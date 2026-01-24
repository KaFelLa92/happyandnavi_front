/**
 * =========================================
 * 타이포그래피 및 간격 상수 (typography.ts)
 * =========================================
 * 
 * 일관된 폰트 크기, 줄 높이, 간격을 정의합니다.
 */

import { Platform } from 'react-native';

// ============================================
// 폰트 패밀리
// ============================================

/**
 * 시스템 기본 폰트
 * iOS: San Francisco, Android: Roboto
 */
export const FontFamily = {
  // 기본 폰트 (시스템 폰트 사용)
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  // 중간 굵기
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  // 굵은 폰트
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  // 가는 폰트
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'System',
  }),
} as const;

// ============================================
// 폰트 크기
// ============================================

export const FontSize = {
  // 아주 작은 텍스트 (힌트, 캡션)
  xs: 10,
  // 작은 텍스트 (보조 정보)
  sm: 12,
  // 기본 텍스트
  md: 14,
  // 중간 크기 (버튼, 라벨)
  lg: 16,
  // 큰 텍스트 (소제목)
  xl: 18,
  // 더 큰 텍스트 (제목)
  xxl: 20,
  // 매우 큰 텍스트 (대제목)
  xxxl: 24,
  // 헤더/타이틀
  title: 28,
  // 로고/브랜드
  brand: 32,
} as const;

// ============================================
// 폰트 굵기
// ============================================

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
} as const;

// ============================================
// 줄 높이
// ============================================

export const LineHeight = {
  // 타이트한 줄 높이 (제목용)
  tight: 1.2,
  // 기본 줄 높이
  normal: 1.5,
  // 여유로운 줄 높이 (본문용)
  relaxed: 1.75,
  // 넓은 줄 높이
  loose: 2,
} as const;

// ============================================
// 간격 (Spacing)
// ============================================

/**
 * 8px 기반 간격 시스템
 * 일관된 UI를 위해 8의 배수 사용
 */
export const Spacing = {
  // 아주 작은 간격
  xxs: 2,
  xs: 4,
  // 작은 간격
  sm: 8,
  // 기본 간격
  md: 12,
  // 중간 간격
  lg: 16,
  // 큰 간격
  xl: 20,
  // 더 큰 간격
  xxl: 24,
  // 매우 큰 간격
  xxxl: 32,
  // 섹션 간격
  section: 40,
  // 페이지 패딩
  page: 48,
} as const;

// ============================================
// 둥근 모서리 (Border Radius)
// ============================================

export const BorderRadius = {
  // 아주 작은 둥근 모서리
  xs: 4,
  // 작은 둥근 모서리
  sm: 8,
  // 기본 둥근 모서리
  md: 12,
  // 큰 둥근 모서리
  lg: 16,
  // 더 큰 둥근 모서리
  xl: 20,
  // 매우 큰 둥근 모서리
  xxl: 24,
  // 완전 둥근 (원형, pill 형태)
  full: 9999,
} as const;

// ============================================
// 그림자 (Shadow)
// ============================================

export const Shadow = {
  // 작은 그림자
  sm: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // 기본 그림자
  md: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  // 큰 그림자
  lg: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  // 매우 큰 그림자
  xl: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

// ============================================
// 아이콘 크기
// ============================================

export const IconSize = {
  // 아주 작은 아이콘
  xs: 12,
  // 작은 아이콘
  sm: 16,
  // 기본 아이콘
  md: 20,
  // 중간 아이콘
  lg: 24,
  // 큰 아이콘
  xl: 32,
  // 매우 큰 아이콘
  xxl: 40,
  // 대형 아이콘
  xxxl: 48,
} as const;

// ============================================
// 컴포넌트 크기
// ============================================

export const ComponentSize = {
  // 버튼 높이
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  // 입력 필드 높이
  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },
  // 헤더 높이
  headerHeight: 56,
  // 탭바 높이
  tabBarHeight: Platform.select({
    ios: 84, // Safe area 포함
    android: 60,
    default: 60,
  }),
  // 캘린더 셀 크기
  calendarCell: 48,
  // 썸네일 크기
  thumbnail: {
    sm: 48,
    md: 72,
    lg: 96,
  },
  // 아바타 크기
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
} as const;

// ============================================
// Z-Index 레이어
// ============================================

export const ZIndex = {
  // 기본
  base: 0,
  // 드롭다운
  dropdown: 10,
  // 스티키 요소
  sticky: 20,
  // 네비게이션
  navigation: 30,
  // 오버레이
  overlay: 40,
  // 모달
  modal: 50,
  // 팝오버
  popover: 60,
  // 토스트/알림
  toast: 70,
} as const;
