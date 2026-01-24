/**
 * =========================================
 * 컬러 테마 상수 (colors.ts)
 * =========================================
 * 
 * 해피야나비야 앱의 컬러 팔레트를 정의합니다.
 * 파스텔톤의 따뜻하고 부드러운 색상으로 구성되어 있습니다.
 * 
 * 디자인 원칙:
 * - 눈의 피로를 줄이기 위해 채도가 낮은 파스텔톤 사용
 * - 메인 배경은 크림색으로 통일하여 일관성 유지
 * - 포인트 색상은 최소화하여 시각적 혼란 방지
 */

export const Colors = {
  // ============================================
  // 기본 색상 (Primary Colors)
  // ============================================
  
  /**
   * 메인 배경색 - 크림색
   * 따뜻하고 부드러운 느낌을 주는 기본 배경
   */
  background: '#FAF3E0',
  
  /**
   * 카드/컨테이너 배경색 - 흰색 계열
   * 콘텐츠 영역을 구분하는 데 사용
   */
  surface: '#FFFFFF',
  surfaceLight: '#FFFEF7',
  
  // ============================================
  // 포인트 색상 (Accent Colors)
  // ============================================
  
  /**
   * 추억일기 테마색 - 부드러운 노랑/베이지
   * 따뜻한 추억을 연상시키는 색상
   */
  memoryPrimary: '#F8E4C8',
  memorySecondary: '#FFE5B4',
  memoryAccent: '#F5DEB3',
  
  /**
   * 약속일기 테마색 - 부드러운 분홍
   * 설렘과 기대를 연상시키는 색상
   */
  promisePrimary: '#F5C6D0',
  promiseSecondary: '#FFD1DC',
  promiseAccent: '#FADADD',
  
  /**
   * 공통 포인트색 - 부드러운 민트/초록
   * 버튼, 아이콘 등 강조 요소에 사용
   */
  primary: '#A8D5BA',
  primaryLight: '#C8E6C9',
  primaryDark: '#81C784',
  
  // ============================================
  // 텍스트 색상 (Text Colors)
  // ============================================
  
  /**
   * 메인 텍스트 - 진한 브라운
   * 가독성이 좋으면서 부드러운 느낌
   */
  textPrimary: '#5D4037',
  
  /**
   * 보조 텍스트 - 중간 브라운
   * 부가 정보, 설명 텍스트에 사용
   */
  textSecondary: '#8D6E63',
  
  /**
   * 힌트/플레이스홀더 텍스트 - 연한 브라운
   */
  textHint: '#A1887F',
  
  /**
   * 비활성 텍스트 - 회색 계열
   */
  textDisabled: '#BDBDBD',
  
  /**
   * 밝은 배경 위의 텍스트 - 흰색
   */
  textLight: '#FFFFFF',
  
  // ============================================
  // 상태 색상 (Status Colors)
  // ============================================
  
  /**
   * 성공 상태 - 부드러운 초록
   */
  success: '#A5D6A7',
  successDark: '#66BB6A',
  
  /**
   * 경고 상태 - 부드러운 주황
   */
  warning: '#FFCC80',
  warningDark: '#FFA726',
  
  /**
   * 에러 상태 - 부드러운 빨강
   */
  error: '#EF9A9A',
  errorDark: '#EF5350',
  
  /**
   * 정보 상태 - 부드러운 파랑
   */
  info: '#90CAF9',
  infoDark: '#42A5F5',
  
  // ============================================
  // 경계선/구분선 색상 (Border Colors)
  // ============================================
  
  /**
   * 기본 경계선 - 연한 베이지
   */
  border: '#E8DCC8',
  
  /**
   * 연한 경계선 - 더 연한 베이지
   */
  borderLight: '#F0E6D8',
  
  /**
   * 강조 경계선 - 브라운 계열
   */
  borderDark: '#D7CCC8',
  
  // ============================================
  // 그림자/오버레이 색상
  // ============================================
  
  /**
   * 그림자 색상
   */
  shadow: 'rgba(93, 64, 55, 0.15)',
  shadowDark: 'rgba(93, 64, 55, 0.25)',
  
  /**
   * 오버레이 색상 (모달 배경 등)
   */
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  
  // ============================================
  // 캘린더 색상 (Calendar Colors)
  // ============================================
  
  calendar: {
    /**
     * 오늘 날짜 표시
     */
    today: '#A8D5BA',
    todayText: '#5D4037',
    
    /**
     * 선택된 날짜
     */
    selected: '#F5C6D0',
    selectedText: '#5D4037',
    
    /**
     * 일요일
     */
    sunday: '#EF9A9A',
    
    /**
     * 토요일
     */
    saturday: '#90CAF9',
    
    /**
     * 기본 날짜
     */
    dayText: '#5D4037',
    
    /**
     * 비활성 날짜 (이전/다음 달)
     */
    inactiveDay: '#BDBDBD',
  },
  
  // ============================================
  // 기분/날씨 아이콘 색상
  // ============================================
  
  mood: {
    veryHappy: '#FFD54F',  // 매우 좋음 - 밝은 노랑
    happy: '#AED581',      // 좋음 - 연두
    normal: '#90A4AE',     // 보통 - 회색
    sad: '#90CAF9',        // 나쁨 - 파랑
    verySad: '#CE93D8',    // 매우 나쁨 - 보라
  },
  
  weather: {
    sunny: '#FFD54F',      // 맑음 - 노랑
    cloudy: '#B0BEC5',     // 흐림 - 회색
    rainy: '#4FC3F7',      // 비 - 파랑
    snowy: '#E1F5FE',      // 눈 - 연한 파랑
    windy: '#A5D6A7',      // 바람 - 초록
  },
  
  // ============================================
  // 일정 카테고리 색상
  // ============================================
  
  schedule: {
    yellow: '#FFF59D',     // 노랑
    blue: '#90CAF9',       // 파랑
    green: '#A5D6A7',      // 초록
    pink: '#F8BBD9',       // 분홍
    orange: '#FFCC80',     // 주황
    purple: '#CE93D8',     // 보라
    red: '#EF9A9A',        // 빨강
    gray: '#BDBDBD',       // 회색
  },
  
  // ============================================
  // 소셜 로그인 버튼 색상
  // ============================================
  
  social: {
    kakao: '#FEE500',
    kakaoText: '#000000',
    google: '#FFFFFF',
    googleText: '#757575',
    googleBorder: '#DADCE0',
  },
} as const;

/**
 * 색상 타입 정의
 */
export type ColorKey = keyof typeof Colors;
export type MoodColorKey = keyof typeof Colors.mood;
export type WeatherColorKey = keyof typeof Colors.weather;
export type ScheduleColorKey = keyof typeof Colors.schedule;
