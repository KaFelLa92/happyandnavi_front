/**
 * =========================================
 * 인증 서비스 (authService.ts)
 * =========================================
 * 
 * 로그인, 회원가입, 소셜 로그인 등 인증 관련 API 호출을 담당합니다.
 */

import { API_ENDPOINTS, debugLog } from '../constants/config';
import { 
  post, 
  get, 
  saveTokens, 
  clearTokens,
  getStoredTokens 
} from './api';
import {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SocialLoginType,
} from '../types';
import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../constants/config';

// ============================================
// 일반 인증 관련 함수
// ============================================

/**
 * 일반 로그인
 * 
 * @param request - 로그인 요청 데이터 (이메일, 비밀번호)
 * @returns 로그인 응답 (토큰, 사용자 정보)
 */
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  try {
    debugLog('로그인 시도:', request.email);
    
    const response = await post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, request);
    
    if (response.success && response.data) {
      // 토큰 저장
      await saveTokens(response.data);
      // 사용자 정보 저장
      await saveUserInfo({
        userId: response.data.userId,
        email: response.data.email,
        petName: response.data.petName,
      } as User);
      
      debugLog('로그인 성공:', response.data.userId);
      return response.data;
    }
    
    throw new Error(response.message || '로그인에 실패했습니다.');
  } catch (error: any) {
    debugLog('로그인 실패:', error.message);
    throw error;
  }
};

/**
 * 회원가입
 * 
 * @param request - 회원가입 요청 데이터
 * @returns 생성된 사용자 정보
 */
export const signup = async (request: SignupRequest): Promise<User> => {
  try {
    debugLog('회원가입 시도:', request.email);
    
    const response = await post<User>(API_ENDPOINTS.AUTH.SIGNUP, request);
    
    if (response.success && response.data) {
      debugLog('회원가입 성공:', response.data.userId);
      return response.data;
    }
    
    throw new Error(response.message || '회원가입에 실패했습니다.');
  } catch (error: any) {
    debugLog('회원가입 실패:', error.message);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    const tokens = await getStoredTokens();
    const userInfo = await getUserInfo();
    
    if (userInfo?.userId) {
      // 서버에 로그아웃 요청 (Refresh Token 무효화)
      await post(API_ENDPOINTS.AUTH.LOGOUT, null);
    }
    
    // 로컬 토큰 삭제
    await clearTokens();
    debugLog('로그아웃 완료');
  } catch (error: any) {
    debugLog('로그아웃 에러:', error.message);
    // 에러가 발생해도 로컬 토큰은 삭제
    await clearTokens();
  }
};

/**
 * 토큰 갱신
 * 
 * @param refreshToken - Refresh Token
 * @returns 새로운 토큰 정보
 */
export const refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const response = await post<LoginResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    
    if (response.success && response.data) {
      await saveTokens(response.data);
      return response.data;
    }
    
    throw new Error(response.message || '토큰 갱신에 실패했습니다.');
  } catch (error: any) {
    debugLog('토큰 갱신 실패:', error.message);
    throw error;
  }
};

/**
 * 이메일 중복 확인
 * 
 * @param email - 확인할 이메일
 * @returns 중복 여부 (true: 중복, false: 사용 가능)
 */
export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  try {
    const response = await get<boolean>(
      API_ENDPOINTS.AUTH.CHECK_EMAIL,
      { email }
    );
    
    return response.data ?? false;
  } catch (error: any) {
    debugLog('이메일 중복 확인 실패:', error.message);
    throw error;
  }
};

/**
 * 이메일 찾기 (연락처로)
 * 
 * @param phone - 연락처
 * @returns 마스킹된 이메일
 */
export const findEmailByPhone = async (phone: string): Promise<string> => {
  try {
    const response = await post<string>(
      API_ENDPOINTS.AUTH.FIND_EMAIL,
      { phone }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '이메일을 찾을 수 없습니다.');
  } catch (error: any) {
    debugLog('이메일 찾기 실패:', error.message);
    throw error;
  }
};

// ============================================
// 소셜 로그인 관련 함수
// ============================================

/**
 * 카카오 로그인 처리
 * 
 * 카카오 SDK에서 받은 토큰으로 서버에 로그인 요청
 * 
 * @param accessToken - 카카오 Access Token
 * @returns 서버 로그인 응답
 */
export const kakaoLogin = async (accessToken: string): Promise<LoginResponse> => {
  try {
    debugLog('카카오 로그인 시도');
    
    const response = await post<LoginResponse>(
      API_ENDPOINTS.AUTH.KAKAO_LOGIN,
      { accessToken }
    );
    
    if (response.success && response.data) {
      await saveTokens(response.data);
      await saveUserInfo({
        userId: response.data.userId,
        email: response.data.email,
        petName: response.data.petName,
      } as User);
      
      debugLog('카카오 로그인 성공');
      return response.data;
    }
    
    throw new Error(response.message || '카카오 로그인에 실패했습니다.');
  } catch (error: any) {
    debugLog('카카오 로그인 실패:', error.message);
    throw error;
  }
};

/**
 * 구글 로그인 처리
 * 
 * 구글 SDK에서 받은 토큰으로 서버에 로그인 요청
 * 
 * @param idToken - 구글 ID Token
 * @returns 서버 로그인 응답
 */
export const googleLogin = async (idToken: string): Promise<LoginResponse> => {
  try {
    debugLog('구글 로그인 시도');
    
    const response = await post<LoginResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      { idToken }
    );
    
    if (response.success && response.data) {
      await saveTokens(response.data);
      await saveUserInfo({
        userId: response.data.userId,
        email: response.data.email,
        petName: response.data.petName,
      } as User);
      
      debugLog('구글 로그인 성공');
      return response.data;
    }
    
    throw new Error(response.message || '구글 로그인에 실패했습니다.');
  } catch (error: any) {
    debugLog('구글 로그인 실패:', error.message);
    throw error;
  }
};

// ============================================
// 사용자 정보 저장소
// ============================================

/**
 * 사용자 정보 저장
 */
export const saveUserInfo = async (user: User): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      APP_CONFIG.USER_STORAGE_KEY,
      JSON.stringify(user)
    );
  } catch (error) {
    debugLog('사용자 정보 저장 실패:', error);
  }
};

/**
 * 저장된 사용자 정보 가져오기
 */
export const getUserInfo = async (): Promise<User | null> => {
  try {
    const userString = await SecureStore.getItemAsync(APP_CONFIG.USER_STORAGE_KEY);
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    debugLog('사용자 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 인증 상태 확인
 * 
 * @returns 로그인 여부
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const tokens = await getStoredTokens();
    return tokens !== null && tokens.accessToken !== null;
  } catch (error) {
    return false;
  }
};
