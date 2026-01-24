/**
 * =========================================
 * API 서비스 (api.ts)
 * =========================================
 * 
 * Axios 기반 HTTP 클라이언트 설정 및 API 요청 함수들을 제공합니다.
 * 
 * 주요 기능:
 * - 기본 Axios 인스턴스 설정
 * - 요청/응답 인터셉터 (토큰 자동 첨부, 토큰 갱신)
 * - 공통 에러 처리
 */

import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  APP_CONFIG, 
  debugLog 
} from '../constants/config';
import { ApiResponse, LoginResponse } from '../types';

// ============================================
// Axios 인스턴스 생성
// ============================================

/**
 * 기본 API 클라이언트
 * 
 * - baseURL: 백엔드 서버 주소
 * - timeout: 요청 타임아웃 (15초)
 * - headers: 기본 헤더 설정
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================
// 토큰 저장소 유틸리티
// ============================================

/**
 * 토큰 저장 인터페이스
 */
interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  savedAt: number;
}

/**
 * SecureStore에서 토큰 가져오기
 */
export const getStoredTokens = async (): Promise<TokenStorage | null> => {
  try {
    const tokenString = await SecureStore.getItemAsync(APP_CONFIG.TOKEN_STORAGE_KEY);
    if (tokenString) {
      return JSON.parse(tokenString);
    }
    return null;
  } catch (error) {
    debugLog('토큰 조회 실패:', error);
    return null;
  }
};

/**
 * SecureStore에 토큰 저장
 */
export const saveTokens = async (tokens: LoginResponse): Promise<void> => {
  try {
    const tokenStorage: TokenStorage = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      savedAt: Date.now(),
    };
    await SecureStore.setItemAsync(
      APP_CONFIG.TOKEN_STORAGE_KEY,
      JSON.stringify(tokenStorage)
    );
    debugLog('토큰 저장 완료');
  } catch (error) {
    debugLog('토큰 저장 실패:', error);
    throw error;
  }
};

/**
 * SecureStore에서 토큰 삭제
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(APP_CONFIG.TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(APP_CONFIG.USER_STORAGE_KEY);
    debugLog('토큰 삭제 완료');
  } catch (error) {
    debugLog('토큰 삭제 실패:', error);
  }
};

/**
 * Access Token이 만료되었는지 확인
 */
const isTokenExpired = (tokens: TokenStorage): boolean => {
  // 만료 5분 전에 갱신하도록 여유를 둠
  const expirationTime = tokens.savedAt + (tokens.expiresIn * 1000) - (5 * 60 * 1000);
  return Date.now() >= expirationTime;
};

// ============================================
// 토큰 갱신 로직
// ============================================

/**
 * 토큰 갱신 중복 요청 방지를 위한 변수
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 토큰 갱신 완료 후 대기 중인 요청들 처리
 */
const onTokenRefreshed = (newToken: string): void => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * 토큰 갱신 대기 구독
 */
const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * 토큰 갱신 요청
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = await getStoredTokens();
    if (!tokens?.refreshToken) {
      return null;
    }

    debugLog('토큰 갱신 시도...');
    
    // 토큰 갱신 API 호출 (인터셉터 우회)
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken: tokens.refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.success && response.data.data) {
      await saveTokens(response.data.data);
      debugLog('토큰 갱신 성공');
      return response.data.data.accessToken;
    }
    
    return null;
  } catch (error) {
    debugLog('토큰 갱신 실패:', error);
    await clearTokens();
    return null;
  }
};

// ============================================
// 요청 인터셉터
// ============================================

/**
 * 요청 인터셉터
 * 
 * 모든 API 요청 전에 실행됩니다.
 * - Access Token을 Authorization 헤더에 자동 첨부
 * - 토큰 만료 시 자동 갱신
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 인증이 필요 없는 엔드포인트는 토큰 첨부 스킵
    const publicEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.SIGNUP,
      API_ENDPOINTS.AUTH.CHECK_EMAIL,
      API_ENDPOINTS.AUTH.FIND_EMAIL,
      API_ENDPOINTS.AUTH.KAKAO_LOGIN,
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
    ];
    
    if (publicEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config;
    }

    // 토큰 조회
    const tokens = await getStoredTokens();
    
    if (tokens?.accessToken) {
      // 토큰 만료 확인 및 갱신
      if (isTokenExpired(tokens) && !isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        
        if (newToken) {
          onTokenRefreshed(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else if (isRefreshing) {
        // 다른 요청이 토큰 갱신 중일 때, 갱신 완료까지 대기
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      } else {
        // 토큰이 유효한 경우
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    debugLog(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    debugLog('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// ============================================
// 응답 인터셉터
// ============================================

/**
 * 응답 인터셉터
 * 
 * 모든 API 응답 후에 실행됩니다.
 * - 401 에러 시 토큰 갱신 후 재시도
 * - 공통 에러 처리
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    debugLog(`API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        
        if (newToken) {
          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } else {
        // 다른 요청이 토큰 갱신 중일 때
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    // 에러 로깅
    debugLog('API 에러:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

// ============================================
// API 함수들
// ============================================

/**
 * GET 요청 헬퍼
 */
export const get = async <T>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data;
};

/**
 * POST 요청 헬퍼
 */
export const post = async <T>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data;
};

/**
 * PUT 요청 헬퍼
 */
export const put = async <T>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data;
};

/**
 * DELETE 요청 헬퍼
 */
export const del = async <T>(
  url: string
): Promise<ApiResponse<T>> => {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
};

/**
 * multipart/form-data POST 요청 (파일 업로드용)
 */
export const postFormData = async <T>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * multipart/form-data PUT 요청 (파일 업로드용)
 */
export const putFormData = async <T>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  const response = await api.put<ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 기본 export
export default api;
