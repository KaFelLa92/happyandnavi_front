/**
 * =========================================
 * 해피야나비야 메인 앱 (App.tsx)
 * =========================================
 * 
 * 반려동물 일상 기록 및 추억 공유 앱입니다.
 * 
 * 주요 기능:
 * - 추억일기: 반려동물과의 일상을 사진과 함께 기록
 * - 약속일기: 병원 예약, 미용, 산책 등 일정 관리
 * - 캘린더: 월별 추억/일정 확인
 * 
 * 기술 스택:
 * - React Native (Expo)
 * - TypeScript
 * - React Navigation
 * - Axios
 * - date-fns
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// 컨텍스트 Provider
import { AuthProvider } from './src/context/AuthContext';

// 네비게이션
import { Navigation } from './src/navigation/Navigation';

// 상수
import { Colors } from './src/constants/colors';

/**
 * 앱 루트 컴포넌트
 * 
 * Provider 구조:
 * 1. GestureHandlerRootView - 제스처 처리
 * 2. SafeAreaProvider - Safe Area 처리
 * 3. AuthProvider - 인증 상태 관리
 * 4. Navigation - 화면 라우팅
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* 상태바 스타일 설정 */}
          <StatusBar style="dark" backgroundColor={Colors.background} />
          
          {/* 메인 네비게이션 */}
          <Navigation />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
