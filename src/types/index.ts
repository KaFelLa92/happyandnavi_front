/**
 * =========================================
 * 타입 정의 파일 (types.ts)
 * =========================================
 * 
 * 앱 전체에서 사용되는 타입들을 정의합니다.
 */

// ============================================
// 사용자 관련 타입
// ============================================

/**
 * 사용자 정보 타입
 */
export interface User {
  userId: number;
  email: string;
  phone?: string;
  petName: string;
  petPhotoPath?: string;
  scheduleSet: number;
  signupType: number;
  signupTypeText: string;
  regDate: string;
}

/**
 * 회원가입 요청 타입
 */
export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  petName: string;
}

/**
 * 로그인 요청 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 타입
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  petName: string;
  email: string;
}

/**
 * 소셜 로그인 타입
 */
export type SocialLoginType = 'kakao' | 'google';

/**
 * 소셜 로그인 응답 타입
 */
export interface SocialLoginResponse {
  socialId: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
}

// ============================================
// 추억일기 관련 타입
// ============================================

/**
 * 기분 타입
 */
export type MoodType = 1 | 2 | 3 | 4 | 5;

/**
 * 날씨 타입
 */
export type WeatherType = 1 | 2 | 3 | 4 | 5;

/**
 * 추억일기 타입
 */
export interface Memory {
  memoryId: number;
  memoryDate: string;
  memoryPath: string;
  memoryUrl: string;
  memoryComment?: string;
  memoryWeather?: WeatherType;
  weatherText?: string;
  weatherEmoji?: string;
  userMood?: MoodType;
  userMoodText?: string;
  userMoodEmoji?: string;
  petMood?: MoodType;
  petMoodText?: string;
  petMoodEmoji?: string;
  userId: number;
  regDate: string;
  modDate?: string;
}

/**
 * 추억일기 생성 요청 타입
 */
export interface CreateMemoryRequest {
  memoryDate: string;
  memoryComment?: string;
  memoryWeather?: WeatherType;
  userMood?: MoodType;
  petMood?: MoodType;
}

/**
 * 추억일기 수정 요청 타입
 */
export interface UpdateMemoryRequest {
  memoryDate?: string;
  memoryComment?: string;
  memoryWeather?: WeatherType;
  userMood?: MoodType;
  petMood?: MoodType;
}

/**
 * 캘린더 아이템 타입 (추억일기)
 */
export interface MemoryCalendarItem {
  memoryId: number;
  memoryDate: string;
  day: number;
  thumbnailUrl: string;
  hasMemory: boolean;
}

// ============================================
// 약속일기(일정) 관련 타입
// ============================================

/**
 * 반복 타입
 */
export type RepeatType = 0 | 1 | 2 | 3 | 4;

/**
 * 약속일기 타입
 */
export interface Promise {
  promiseId: number;
  promiseTitle: string;
  promiseIconPath?: string;
  promiseColor: string;
  promiseComment?: string;
  promiseStart?: string;
  promiseEnd?: string;
  reminderMinutes?: number;
  reminderText?: string;
  repeatType: RepeatType;
  repeatTypeText?: string;
  allDay: boolean;
  userId: number;
  regDate: string;
  modDate?: string;
}

/**
 * 약속일기 생성 요청 타입
 */
export interface CreatePromiseRequest {
  promiseTitle: string;
  promiseIconPath?: string;
  promiseColor?: string;
  promiseComment?: string;
  promiseStart?: string;
  promiseEnd?: string;
  reminderMinutes?: number;
  repeatType?: RepeatType;
  allDay?: boolean;
}

/**
 * 약속일기 수정 요청 타입
 */
export interface UpdatePromiseRequest {
  promiseTitle?: string;
  promiseIconPath?: string;
  promiseColor?: string;
  promiseComment?: string;
  promiseStart?: string;
  promiseEnd?: string;
  reminderMinutes?: number;
  repeatType?: RepeatType;
  allDay?: boolean;
}

/**
 * 캘린더 아이템 타입 (약속일기)
 */
export interface PromiseCalendarItem {
  promiseId: number;
  promiseTitle: string;
  promiseColor: string;
  promiseStart?: string;
  promiseEnd?: string;
  allDay: boolean;
}

// ============================================
// API 관련 타입
// ============================================

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
}

/**
 * 페이징 응답 타입
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * API 에러 타입
 */
export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ============================================
// 네비게이션 관련 타입
// ============================================

/**
 * 인증 스택 파라미터 타입
 */
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  PetNameInput: { userId: number };
};

/**
 * 메인 탭 파라미터 타입
 */
export type MainTabParamList = {
  Home: undefined;
  Memory: undefined;
  Promise: undefined;
};

/**
 * 홈 스택 파라미터 타입
 */
export type HomeStackParamList = {
  HomeMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  DeleteAccount: undefined;
};

/**
 * 추억일기 스택 파라미터 타입
 */
export type MemoryStackParamList = {
  MemoryCalendar: undefined;
  MemoryDetail: { memoryId: number };
  MemoryCreate: { date?: string };
  MemoryEdit: { memoryId: number };
};

/**
 * 약속일기 스택 파라미터 타입
 */
export type PromiseStackParamList = {
  PromiseCalendar: undefined;
  PromiseDetail: { promiseId: number };
  PromiseCreate: { date?: string };
  PromiseEdit: { promiseId: number };
};

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 기분 정보 타입
 */
export interface MoodInfo {
  code: MoodType;
  text: string;
  emoji: string;
}

/**
 * 날씨 정보 타입
 */
export interface WeatherInfo {
  code: WeatherType;
  text: string;
  emoji: string;
}

/**
 * 반복 정보 타입
 */
export interface RepeatInfo {
  code: RepeatType;
  text: string;
}

/**
 * 일정 색상 옵션 타입
 */
export interface ColorOption {
  name: string;
  value: string;
  color: string;
}
