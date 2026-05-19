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
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react';
import { User, LoginResponse, LoginRequest, SignupRequest } from '../types';
import {
  login as loginService,
  logout as logoutService,
  signup as signupService,
  kakaoLogin as kakaoLoginService,
  googleLogin as googleLoginService,
  naverLogin as naverLoginService,
  appleLogin as appleLoginService,
  getUserInfo,
  saveUserInfo,
} from '../services/authService';
import { getStoredTokens } from '../services/api';
import { getMyInfo } from '../services/userService';
import { debugLog } from '../constants/config';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  signup: (request: SignupRequest) => Promise<User>;
  logout: () => Promise<void>;
  kakaoLogin: (accessToken: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  naverLogin: (accessToken: string) => Promise<void>;
  appleLogin: (identityToken: string) => Promise<void>;
  updateUser: (user: User) => void;
  refreshAuth: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  isAuthenticated: false, user: null, isLoading: true,
  login: async () => {}, signup: async () => ({} as User),
  logout: async () => {},
  kakaoLogin: async () => {},
  googleLogin: async () => {},
  naverLogin: async () => {},
  appleLogin: async () => {},
  updateUser: () => {},
  refreshAuth: async () => {},
};
const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps { children: ReactNode; }

// 인증 오류 status code 들 (이 경우 즉시 로그아웃)
const AUTH_ERROR_STATUSES = [401, 403, 404];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false, user: null, isLoading: true,
  });

  // ========================================
  // 초기화 - 토큰 검증 후 로그인 상태 결정
  // ========================================
  const initializeAuth = useCallback(async () => {
    try {
      debugLog('인증 상태 초기화 시작');
      const tokens = await getStoredTokens();

      if (!tokens?.accessToken) {
        debugLog('토큰 없음 → 로그인 페이지');
        setState({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      // 🔒 토큰이 있어도 서버 검증 필수
      let user: User | null = null;
      try {
        user = await getMyInfo(); // 서버에서 최신 정보 조회
      } catch (error: any) {
        const status = error?.status ?? error?.response?.status ?? error?.statusCode;
        debugLog('getMyInfo 실패:', status, error?.message);

        // 인증 오류 → 토큰 무효 → 즉시 로그아웃
        if (AUTH_ERROR_STATUSES.includes(status)) {
          debugLog('🔒 토큰 검증 실패 → 강제 로그아웃');
          try { await logoutService(); } catch {}
          setState({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        // 네트워크 등 일시 오류 → 캐시로 fallback (오프라인 대응)
        debugLog('네트워크 일시 오류, 캐시 사용');
        user = await getUserInfo();
      }

      if (user) {
        await saveUserInfo(user);
        setState({ isAuthenticated: true, user, isLoading: false });
        debugLog('인증 복원 완료:', user.userId);
      } else {
        // 캐시도 없음 → 토큰 무효 처리
        debugLog('🔒 사용자 정보 없음 → 강제 로그아웃');
        try { await logoutService(); } catch {}
        setState({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch (error) {
      debugLog('인증 초기화 에러:', error);
      try { await logoutService(); } catch {}
      setState({ isAuthenticated: false, user: null, isLoading: false });
    }
  }, []);

  useEffect(() => { initializeAuth(); }, [initializeAuth]);

  // ========================================
  // 액션들
  // ========================================
  const login = useCallback(async (request: LoginRequest) => {
      // 1. 로그인 요청 (authService 내에서 토큰이 SecureStore에 저장됨)
      await loginService(request);

      // 2. 추가된 핵심 코드: 토큰을 바탕으로 꽉 찬 내 정보(펫 이름, 사진 등) 다시 조회!
      const fullUser = await getMyInfo();

      // 3. 상태 업데이트 및 캐시 저장
      await saveUserInfo(fullUser);
      setState({ isAuthenticated: true, user: fullUser, isLoading: false });
    }, []);

  const signup = useCallback(async (request: SignupRequest) => {
    return await signupService(request);
  }, []);

  const logout = useCallback(async () => {
    try { await logoutService(); } catch {}
    setState({ isAuthenticated: false, user: null, isLoading: false });
  }, []);

  const kakaoLogin = useCallback(async (accessToken: string) => {
      // 1. 카카오 로그인 요청 (토큰 저장됨)
      await kakaoLoginService(accessToken);

      // 2. 내 정보 다시 조회
      const fullUser = await getMyInfo();

      // 3. 상태 업데이트
      await saveUserInfo(fullUser);
      setState({ isAuthenticated: true, user: fullUser, isLoading: false });
    }, []);

  const googleLogin = useCallback(async (idToken: string) => {
      // 1. 구글 로그인 요청 (토큰 저장됨)
      await googleLoginService(idToken);

      // 2. 내 정보 다시 조회
      const fullUser = await getMyInfo();

      // 3. 상태 업데이트
      await saveUserInfo(fullUser);
      setState({ isAuthenticated: true, user: fullUser, isLoading: false });
    }, []);

    // naverLogin 함수
    const naverLogin = useCallback(async (accessToken: string) => {
      try {
        const response = await naverLoginService(accessToken);
        const userInfo = await getMyInfo();
        setState({ isAuthenticated: true, user: userInfo, isLoading: false });
      } catch (error: any) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw error;
      }
    }, []);

    // appleLogin 함수
    const appleLogin = useCallback(async (identityToken: string) => {
      try {
        const response = await appleLoginService(identityToken);
        const userInfo = await getMyInfo();
        setState({ isAuthenticated: true, user: userInfo, isLoading: false });
      } catch (error: any) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw error;
      }
    }, []);

  const updateUser = useCallback((user: User) => {
    saveUserInfo(user).catch(() => {});
    setState(prev => ({ ...prev, user }));
  }, []);

  const refreshAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{
      ...state, login, signup, logout, kakaoLogin, googleLogin, naverLogin, appleLogin, updateUser, refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
