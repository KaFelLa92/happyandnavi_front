/**
 * =========================================
 * 메인 네비게이션 (Navigation.tsx)
 * =========================================
 * 
 * 앱의 전체 네비게이션 구조를 정의합니다.
 * 
 * 구조:
 * - 인증 스택 (로그인 전)
 *   - Splash
 *   - Login
 *   - Signup
 * 
 * - 메인 탭 (로그인 후)
 *   - Home (홈 스택)
 *     - HomeMain
 *     - Settings
 *     - EditProfile
 *     - ChangePassword
 *     - DeleteAccount
 *   - Memory (추억일기 스택)
 *     - MemoryCalendar
 *     - MemoryDetail
 *     - MemoryCreate
 *     - MemoryEdit
 *   - Promise (약속일기 스택)
 *     - PromiseCalendar
 *     - PromiseDetail
 *     - PromiseCreate
 *     - PromiseEdit
 * 260502 변경:
 * - 안드로이드 시스템 푸터(제스처 바)와 겹치지 않도록 SafeArea 적용
 * - tabBarStyle.height 를 고정값에서 inset에 따라 동적으로 변경
 * - PromiseDetail/Edit, MemoryDetail/Edit import 누락 보완
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

// 스크린 Import
import { SplashScreen, LoginScreen, SignupScreen } from '../screens/auth';
import { HomeScreen } from '../screens/main/HomeScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MemoryCalendarScreen } from '../screens/memory/MemoryCalendarScreen';
import { MemoryCreateScreen } from '../screens/memory/MemoryCreateScreen';
import { MemoryDetailScreen } from '../screens/memory/MemoryDetailScreen';
import { MemoryEditScreen } from '../screens/memory/MemoryEditScreen';
import { PromiseCalendarScreen } from '../screens/promise/PromiseCalendarScreen';
import { PromiseCreateScreen } from '../screens/promise/PromiseCreateScreen';
import { PromiseDetailScreen } from '../screens/promise/PromiseDetailScreen';
import { PromiseEditScreen } from '../screens/promise/PromiseEditScreen';

// ============================================
// 네비게이터 생성
// ============================================

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MemoryStack = createNativeStackNavigator();
const PromiseStack = createNativeStackNavigator();

// ============================================
// 홈 스택
// ============================================

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Settings" component={SettingsScreen} />
  </HomeStack.Navigator>
);

// ============================================
// 추억일기 스택
// ============================================

const MemoryStackNavigator: React.FC = () => (
  <MemoryStack.Navigator screenOptions={{ headerShown: false }}>
    <MemoryStack.Screen name="MemoryCalendar" component={MemoryCalendarScreen} />
    <MemoryStack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
    <MemoryStack.Screen name="MemoryCreate" component={MemoryCreateScreen} />
    <MemoryStack.Screen name="MemoryEdit" component={MemoryEditScreen} />
  </MemoryStack.Navigator>
);

// ============================================
// 약속일기 스택
// ============================================

const PromiseStackNavigator: React.FC = () => (
  <PromiseStack.Navigator screenOptions={{ headerShown: false }}>
    <PromiseStack.Screen name="PromiseCalendar" component={PromiseCalendarScreen} />
    <PromiseStack.Screen name="PromiseDetail" component={PromiseDetailScreen} />
    <PromiseStack.Screen name="PromiseCreate" component={PromiseCreateScreen} />
    <PromiseStack.Screen name="PromiseEdit" component={PromiseEditScreen} />
  </PromiseStack.Navigator>
);

// ============================================
// 메인 탭 네비게이터
// ============================================

const MainTabNavigator: React.FC = () => {
  // 시스템 바(제스처 바) 높이를 inset 으로 받아와 패딩에 더한다.
  const insets = useSafeAreaInsets();

  // 탭바 기본 높이 + 시스템 바 inset
  // iOS는 보통 inset.bottom 으로 홈 인디케이터를 처리하지만,
  // Android의 제스처 네비게이션은 inset.bottom 값이 종종 0으로 들어와 겹치므로
  // 최소 8px 의 패딩을 보장한다.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);
  const TAB_CONTENT_HEIGHT = 56;
  const tabBarHeight = TAB_CONTENT_HEIGHT + bottomInset;

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home')    iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Memory')  iconName = focused ? 'images' : 'images-outline';
          else if (route.name === 'Promise') iconName = focused ? 'calendar' : 'calendar-outline';

          return (
            <View style={focused && styles.activeTabIcon}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textHint,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset + 6,  // 시스템 바 위로 띄우기
            paddingTop: 8,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        // 안드로이드에서 시스템 바(제스처 바)와 겹치는 것을 방지하기 위해
        // safeAreaInsets 를 강제로 적용한다.
        safeAreaInsets: { bottom: bottomInset },
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: '홈' }}
      />
      <MainTab.Screen
        name="Memory"
        component={MemoryStackNavigator}
        options={{ tabBarLabel: '추억일기' }}
      />
      <MainTab.Screen
        name="Promise"
        component={PromiseStackNavigator}
        options={{ tabBarLabel: '약속일기' }}
      />
    </MainTab.Navigator>
  );
};

// ============================================
// 인증 스택
// ============================================

const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

// ============================================
// 루트 네비게이션
// ============================================

export const Navigation: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    // height/padding 은 인라인으로 동적 계산
  },
  tabBarLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  activeTabIcon: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 6,
  },
});

export default Navigation;
