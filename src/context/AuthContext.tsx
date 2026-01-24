/**
 * =========================================
 * 인증 컨텍스트 (AuthContext.tsx)
 * =========================================
 * 
 * 앱 전역에서 사용되는 인증 상태를 관리합니다.
 * 
 * 기능:
 * - 로그인/로그아웃 상태 관리
 * - 사용자 정보 저장
 * - 인증 상태 복원 (앱 재시작 시)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, LoginResponse, LoginRequest, SignupRequest } from '../types';
import {
  login as loginService,
  logout as logoutService,
  signup as signupService,
  kakaoLogin as kakaoLoginService,
  googleLogin as googleLoginService,
  isAuthenticated,
  getUserInfo,
  saveUserInfo,
} from '../services/authService';
import { getStoredTokens } from '../services/api';
import { getMyInfo } from '../services/userService';
import { debugLog } from '../constants/config';

// ============================================
// 타입 정의
// ============================================

/**
 * 인증 컨텍스트 상태 타입
 */
interface AuthState {
  /** 인증 여부 */
  isAuthenticated: boolean;
  /** 현재 사용자 정보 */
  user: User | null;
  /** 로딩 상태 (인증 확인 중) */
  isLoading: boolean;
}

/**
 * 인증 컨텍스트 타입 (상태 + 액션)
 */
interface AuthContextType extends AuthState {
  /** 일반 로그인 */
  login: (request: LoginRequest) => Promise<void>;
  /** 회원가입 */
  signup: (request: SignupRequest) => Promise<User>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 카카오 로그인 */
  kakaoLogin: (accessToken: string) => Promise<void>;
  /** 구글 로그인 */
  googleLogin: (idToken: string) => Promise<void>;
  /** 사용자 정보 업데이트 */
  updateUser: (user: User) => void;
  /** 인증 상태 새로고침 */
  refreshAuth: () => Promise<void>;
}

// ============================================
// 컨텍스트 생성
// ============================================

/**
 * 기본값 (실제로는 Provider에서 덮어씌워짐)
 */
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => ({} as User),
  logout: async () => {},
  kakaoLogin: async () => {},
  googleLogin: async () => {},
  updateUser: () => {},
  refreshAuth: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// ============================================
// Provider 컴포넌트
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 인증 Provider
 * 
 * 앱 최상위에서 사용하여 모든 컴포넌트에서 인증 상태 접근 가능
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ========================================
  // 상태
  // ========================================
  
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // ========================================
  // 초기화 (인증 상태 복원)
  // ========================================
  
  /**
   * 앱 시작 시 저장된 토큰으로 인증 상태 복원
   */
  const initializeAuth = useCallback(async () => {
    try {
      debugLog('인증 상태 초기화 시작');
      
      // 저장된 토큰 확인
      const tokens = await getStoredTokens();
      
      if (tokens?.accessToken) {
        // 저장된 사용자 정보 조회
        let user = await getUserInfo();
        
        // 서버에서 최신 정보 가져오기 시도
        try {
          user = await getMyInfo();
        } catch (error) {
          debugLog('사용자 정보 갱신 실패, 캐시 사용');
        }
        
        if (user) {
          setState({
            isAuthenticated: true,
            user,
            isLoading: false,
          });
          debugLog('인증 상태 복원 완료:', user.userId);
          return;
        }
      }
      
      // 인증 정보 없음
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      debugLog('인증 정보 없음');
    } catch (error) {
      debugLog('인증 초기화 에러:', error);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ========================================
  // 액션 함수들
  // ========================================

  /**
   * 일반 로그인
   */
  const login = useCallback(async (request: LoginRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await loginService(request);
      
      const user: User = {
        userId: response.userId,
        email: response.email,
        userName: response.userName,
        scheduleSet: 1,
        signupType: 1,
        signupTypeText: '일반',
        regDate: new Date().toISOString(),
      };
      
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      debugLog('로그인 완료');
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * 회원가입
   */
  const signup = useCallback(async (request: SignupRequest): Promise<User> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const user = await signupService(request);
      
      setState((prev) => ({ ...prev, isLoading: false }));
      
      debugLog('회원가입 완료');
      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      await logoutService();
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      
      debugLog('로그아웃 완료');
    } catch (error) {
      // 에러가 발생해도 로컬 상태는 초기화
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      debugLog('로그아웃 처리 (에러 발생)');
    }
  }, []);

  /**
   * 카카오 로그인
   */
  const kakaoLogin = useCallback(async (accessToken: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await kakaoLoginService(accessToken);
      
      const user: User = {
        userId: response.userId,
        email: response.email,
        userName: response.userName,
        scheduleSet: 1,
        signupType: 2,
        signupTypeText: '카카오',
        regDate: new Date().toISOString(),
      };
      
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      debugLog('카카오 로그인 완료');
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * 구글 로그인
   */
  const googleLogin = useCallback(async (idToken: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await googleLoginService(idToken);
      
      const user: User = {
        userId: response.userId,
        email: response.email,
        userName: response.userName,
        scheduleSet: 1,
        signupType: 3,
        signupTypeText: '구글',
        regDate: new Date().toISOString(),
      };
      
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      debugLog('구글 로그인 완료');
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * 사용자 정보 업데이트 (로컬)
   */
  const updateUser = useCallback((user: User) => {
    setState((prev) => ({
      ...prev,
      user,
    }));
    saveUserInfo(user);
  }, []);

  /**
   * 인증 상태 새로고침
   */
  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  // ========================================
  // 컨텍스트 값
  // ========================================
  
  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    kakaoLogin,
    googleLogin,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 커스텀 훅
// ============================================

/**
 * 인증 컨텍스트 사용 훅
 * 
 * @example
 * const { isAuthenticated, user, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
