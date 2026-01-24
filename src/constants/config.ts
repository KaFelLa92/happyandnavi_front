/**
 * =========================================
 * 환경 설정 파일 (config.ts)
 * =========================================
 * 
 * API 서버 주소, 소셜 로그인 키 등 환경 설정값을 관리합니다.
 * 
 * ⚠️ 주의: 실제 운영 환경에서는 이 값들을 환경변수로 관리하세요!
 * - .env 파일과 react-native-config 라이브러리 사용 권장
 * - 또는 Expo의 app.config.js의 extra 필드 활용
 */

// ============================================
// API 서버 설정
// ============================================

/**
 * 백엔드 API 서버 기본 URL
 * 
 * 개발 환경:
 * - Android 에뮬레이터: http://10.0.2.2:8080
 * - iOS 시뮬레이터: http://localhost:8080
 * - 실제 기기: http://{컴퓨터IP}:8080
 * 
 * 운영 환경:
 * - https://api.happyandnavi.com 등 실제 도메인 사용
 */
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080'  // Android 에뮬레이터용 (iOS는 localhost 사용)
  : 'https://api.happyandnavi.com';

/**
 * API 엔드포인트 경로들
 */
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    CHECK_EMAIL: '/api/auth/check-email',
    FIND_EMAIL: '/api/auth/find-email',
    // 소셜 로그인
    KAKAO_LOGIN: '/api/auth/kakao',
    GOOGLE_LOGIN: '/api/auth/google',
  },
  // 사용자 관련
  USER: {
    ME: '/api/users/me',
    UPDATE: '/api/users/me',
    PASSWORD: '/api/users/me/password',
    SETTINGS: '/api/users/me/settings',
    DELETE: '/api/users/me',
  },
  // 추억일기 관련
  MEMORY: {
    BASE: '/api/memories',
    CALENDAR: '/api/memories/calendar',
    YEAR: '/api/memories/year',
    SEARCH: '/api/memories/search',
  },
  // 약속일기(일정) 관련
  PROMISE: {
    BASE: '/api/promises',
    CALENDAR: '/api/promises/calendar',
    TODAY: '/api/promises/today',
    UPCOMING: '/api/promises/upcoming',
    SEARCH: '/api/promises/search',
  },
} as const;

// ============================================
// 소셜 로그인 설정
// ============================================

/**
 * 카카오 로그인 설정
 * 
 * 카카오 디벨로퍼스(https://developers.kakao.com)에서 발급받은 키를 입력하세요.
 * 
 * 설정 방법:
 * 1. 카카오 디벨로퍼스 > 내 애플리케이션 > 앱 생성
 * 2. 앱 키 > REST API 키, 네이티브 앱 키 복사
 * 3. 플랫폼 > Android, iOS 등록
 *    - Android: 패키지명, 키 해시 등록
 *    - iOS: 번들 ID 등록
 * 4. 카카오 로그인 활성화
 * 5. 동의 항목 설정 (닉네임, 이메일 등)
 */
export const KAKAO_CONFIG = {
  // 네이티브 앱 키 (Android/iOS 앱에서 사용)
  NATIVE_APP_KEY: 'YOUR_KAKAO_NATIVE_APP_KEY',
  // REST API 키 (서버에서 사용)
  REST_API_KEY: '1f54735975efc268bb021af3f1c41758',
  // JavaScript 키 (웹에서 사용)
  JAVASCRIPT_KEY: 'YOUR_KAKAO_JAVASCRIPT_KEY',
  // 리다이렉트 URI
  REDIRECT_URI: 'kakao{YOUR_NATIVE_APP_KEY}://oauth',
} as const;

/**
 * 구글 로그인 설정
 * 
 * Google Cloud Console(https://console.cloud.google.com)에서 설정하세요.
 * 
 * 설정 방법:
 * 1. Google Cloud Console > 새 프로젝트 생성
 * 2. API 및 서비스 > OAuth 동의 화면 설정
 * 3. 사용자 인증 정보 > OAuth 2.0 클라이언트 ID 생성
 *    - 웹 애플리케이션용 (백엔드)
 *    - Android용 (SHA-1 지문 필요)
 *    - iOS용 (번들 ID 필요)
 */
export const GOOGLE_CONFIG = {
  // 웹 클라이언트 ID (Android, iOS 공통으로 사용)
  WEB_CLIENT_ID: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  // iOS 클라이언트 ID
  IOS_CLIENT_ID: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
  // Android 클라이언트 ID (선택적)
  ANDROID_CLIENT_ID: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
} as const;

// ============================================
// 앱 설정
// ============================================

/**
 * 앱 기본 설정값
 */
export const APP_CONFIG = {
  // 앱 이름
  APP_NAME: '해피야나비야',
  // 앱 버전
  VERSION: '1.0.0',
  // 페이지당 기본 항목 수
  DEFAULT_PAGE_SIZE: 20,
  // 토큰 저장 키
  TOKEN_STORAGE_KEY: 'happyandnavi_tokens',
  USER_STORAGE_KEY: 'happyandnavi_user',
  // 이미지 최대 크기 (바이트)
  MAX_IMAGE_SIZE: 50 * 1024 * 1024, // 50MB
  // 지원되는 이미지 형식
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
} as const;

// ============================================
// 개발 환경 감지
// ============================================

/**
 * 현재 환경이 개발 환경인지 확인
 * __DEV__는 React Native에서 제공하는 전역 변수입니다.
 */
export const isDevelopment = __DEV__;

/**
 * 디버그 로그 출력 함수
 * 개발 환경에서만 로그를 출력합니다.
 */
export const debugLog = (...args: any[]) => {
  if (__DEV__) {
    console.log('[DEBUG]', ...args);
  }
};
