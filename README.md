# 해피야나비야 (Happy & Navi) 🐶🐱

반려동물 일상 기록 및 추억 공유 앱입니다.

## 📱 주요 기능

### 추억일기 📸
- 반려동물과의 일상을 사진과 함께 기록
- 날씨, 기분 등 부가 정보 기록
- 월별 캘린더로 추억 확인

### 약속일기 📅
- 병원 예약, 미용, 산책 등 일정 관리
- 알림 설정으로 일정 놓치지 않기
- 반복 일정 설정

## 🛠 기술 스택

### Frontend (React Native)
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **HTTP Client**: Axios
- **State Management**: React Context
- **Date Handling**: date-fns
- **UI Components**: Custom Components

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: MyBatis
- **Security**: Spring Security + JWT
- **Build Tool**: Gradle

## 📁 프로젝트 구조

```
happyandnavi_front/
├── App.tsx                 # 앱 진입점
├── app.json               # Expo 설정
├── package.json           # 의존성 관리
├── tsconfig.json          # TypeScript 설정
├── babel.config.js        # Babel 설정
└── src/
    ├── assets/            # 이미지, 폰트 등 정적 리소스
    ├── components/        # 재사용 가능한 컴포넌트
    │   ├── common/        # 공통 컴포넌트 (Button, Input, Card 등)
    │   ├── memory/        # 추억일기 관련 컴포넌트
    │   └── promise/       # 약속일기 관련 컴포넌트
    ├── constants/         # 상수 정의
    │   ├── colors.ts      # 컬러 팔레트
    │   ├── config.ts      # 환경 설정
    │   └── typography.ts  # 폰트, 간격 등
    ├── context/           # React Context
    │   └── AuthContext.tsx
    ├── hooks/             # 커스텀 훅
    ├── navigation/        # 네비게이션 설정
    │   └── Navigation.tsx
    ├── screens/           # 화면 컴포넌트
    │   ├── auth/          # 인증 관련 (로그인, 회원가입)
    │   ├── main/          # 메인 화면 (홈)
    │   ├── memory/        # 추억일기 화면
    │   ├── promise/       # 약속일기 화면
    │   └── settings/      # 설정 화면
    ├── services/          # API 서비스
    │   ├── api.ts         # Axios 설정
    │   ├── authService.ts
    │   ├── userService.ts
    │   ├── memoryService.ts
    │   └── promiseService.ts
    ├── styles/            # 공통 스타일
    ├── types/             # TypeScript 타입 정의
    └── utils/             # 유틸리티 함수
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.x 이상
- npm 또는 yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio 또는 Xcode (에뮬레이터용)

### 설치 및 실행

1. **의존성 설치**
```bash
cd happyandnavi_front
npm install
```

2. **환경 설정**
`src/constants/config.ts` 파일에서 설정값을 수정합니다:
```typescript
// API 서버 주소 설정
export const API_BASE_URL = 'http://your-server-ip:8080';

// 카카오 로그인 설정
export const KAKAO_CONFIG = {
  NATIVE_APP_KEY: 'your-kakao-native-app-key',
  REST_API_KEY: 'your-kakao-rest-api-key',
};

// 구글 로그인 설정
export const GOOGLE_CONFIG = {
  WEB_CLIENT_ID: 'your-google-client-id.apps.googleusercontent.com',
};
```

3. **앱 실행**
```bash
# Expo 개발 서버 시작
npm start

# 또는 특정 플랫폼으로 실행
npm run android
npm run ios
```

## 🔐 소셜 로그인 설정

### 카카오 로그인

1. [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱 등록
2. 플랫폼 설정:
   - Android: 패키지명, 키 해시 등록
   - iOS: 번들 ID 등록
3. 카카오 로그인 활성화
4. 동의 항목 설정 (이메일, 프로필)
5. `app.json`과 `config.ts`에 키 입력

### 구글 로그인

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성:
   - 웹 애플리케이션
   - Android
   - iOS
3. `config.ts`에 클라이언트 ID 입력

## 📡 API 엔드포인트

### 인증 (Auth)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/kakao` | 카카오 로그인 |
| POST | `/api/auth/google` | 구글 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/check-email` | 이메일 중복 확인 |

### 사용자 (User)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/me` | 내 정보 조회 |
| PUT | `/api/users/me` | 내 정보 수정 |
| PUT | `/api/users/me/password` | 비밀번호 변경 |
| PUT | `/api/users/me/settings` | 알림 설정 변경 |
| DELETE | `/api/users/me` | 회원 탈퇴 |

### 추억일기 (Memory)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/memories` | 추억일기 등록 |
| GET | `/api/memories` | 목록 조회 (페이징) |
| GET | `/api/memories/{id}` | 상세 조회 |
| GET | `/api/memories/calendar` | 월별 캘린더 데이터 |
| GET | `/api/memories/year/{year}` | 연도별 조회 |
| GET | `/api/memories/search` | 검색 |
| PUT | `/api/memories/{id}` | 수정 |
| DELETE | `/api/memories/{id}` | 삭제 |

### 약속일기 (Promise)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/promises` | 일정 등록 |
| GET | `/api/promises` | 전체 일정 조회 |
| GET | `/api/promises/{id}` | 상세 조회 |
| GET | `/api/promises/calendar` | 월별 캘린더 일정 |
| GET | `/api/promises/today` | 오늘 일정 |
| GET | `/api/promises/upcoming` | 다가오는 일정 |
| GET | `/api/promises/search` | 검색 |
| PUT | `/api/promises/{id}` | 수정 |
| DELETE | `/api/promises/{id}` | 삭제 |

## 🎨 디자인 가이드

### 컬러 팔레트
- **배경**: `#FAF3E0` (크림)
- **추억일기 테마**: `#F8E4C8` (베이지/노랑)
- **약속일기 테마**: `#F5C6D0` (분홍)
- **포인트 색상**: `#A8D5BA` (민트/초록)
- **텍스트**: `#5D4037` (브라운)

### 아이콘
- 날씨: ☀️ 맑음, ☁️ 흐림, 🌧️ 비, ❄️ 눈, 💨 바람
- 기분: 😄 매우좋음, 🙂 좋음, 😐 보통, 😢 나쁨, 😭 매우나쁨

## 📝 TODO

- [ ] 추억일기 상세/생성/수정 화면 구현
- [ ] 약속일기 상세/생성/수정 화면 구현
- [ ] 프로필 수정 화면 구현
- [ ] 비밀번호 변경 화면 구현
- [ ] 회원 탈퇴 화면 구현
- [ ] 이미지 피커 컴포넌트 구현
- [ ] 푸시 알림 구현
- [ ] 오프라인 지원 (AsyncStorage 캐싱)
- [ ] 다크 모드 지원
- [ ] 다국어 지원

## 📄 라이선스

MIT License

## 👥 팀

해피야나비야 개발팀

---

🐾 **Happy & Navi** - 반려동물과의 소중한 일상을 기록하세요!
