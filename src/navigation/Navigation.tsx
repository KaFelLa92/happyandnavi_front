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
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';

import { SplashScreen, LoginScreen, SignupScreen } from '../screens/auth';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { FindIdScreen } from '../screens/auth/FindIdScreen';
import { LoadingScreen } from '../screens/common/LoadingScreen';
import { NotFoundScreen } from '../screens/common/NotFoundScreen';

import { HomeScreen } from '../screens/main/HomeScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { MemoryCalendarScreen } from '../screens/memory/MemoryCalendarScreen';
import { MemoryCreateScreen } from '../screens/memory/MemoryCreateScreen';
import { MemoryDetailScreen } from '../screens/memory/MemoryDetailScreen';
import { MemoryEditScreen } from '../screens/memory/MemoryEditScreen';
import { PromiseCalendarScreen } from '../screens/promise/PromiseCalendarScreen';
import { PromiseCreateScreen } from '../screens/promise/PromiseCreateScreen';
import { PromiseDetailScreen } from '../screens/promise/PromiseDetailScreen';
import { PromiseEditScreen } from '../screens/promise/PromiseEditScreen';

const AuthStack    = createNativeStackNavigator();
const MainTab      = createBottomTabNavigator();
const HomeStack    = createNativeStackNavigator();
const MemoryStack  = createNativeStackNavigator();
const PromiseStack = createNativeStackNavigator();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain"       component={HomeScreen} />
    <HomeStack.Screen name="Settings"       component={SettingsScreen} />
    <HomeStack.Screen name="EditProfile"    component={EditProfileScreen} />
    <HomeStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <HomeStack.Screen name="DeleteAccount"  component={DeleteAccountScreen} />
    <HomeStack.Screen name="NotFound"       component={NotFoundScreen} />
  </HomeStack.Navigator>
);

const MemoryStackNavigator: React.FC = () => (
  <MemoryStack.Navigator screenOptions={{ headerShown: false }}>
    <MemoryStack.Screen name="MemoryCalendar" component={MemoryCalendarScreen} />
    <MemoryStack.Screen name="MemoryDetail"   component={MemoryDetailScreen} />
    <MemoryStack.Screen name="MemoryCreate"   component={MemoryCreateScreen} />
    <MemoryStack.Screen name="MemoryEdit"     component={MemoryEditScreen} />
    <MemoryStack.Screen name="NotFound"       component={NotFoundScreen} />
  </MemoryStack.Navigator>
);

const PromiseStackNavigator: React.FC = () => (
  <PromiseStack.Navigator screenOptions={{ headerShown: false }}>
    <PromiseStack.Screen name="PromiseCalendar" component={PromiseCalendarScreen} />
    <PromiseStack.Screen name="PromiseDetail"   component={PromiseDetailScreen} />
    <PromiseStack.Screen name="PromiseCreate"   component={PromiseCreateScreen} />
    <PromiseStack.Screen name="PromiseEdit"     component={PromiseEditScreen} />
    <PromiseStack.Screen name="NotFound"        component={NotFoundScreen} />
  </PromiseStack.Navigator>
);

// ============================================
// Android 첫 inset 값 락(lock) 훅
// ============================================
const useAndroidLockedBottom = (): number => {
  const insets = useSafeAreaInsets();
  const [stableBottom, setStableBottom] = useState(insets.bottom);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // 🚨 핵심 해결 로직: 카메라를 다녀온 후 insets.bottom이 0에서 48로 커지면,
      // 탭바가 파묻히지 않도록 가장 큰 값(실제 시스템 바 높이)으로 락을 갱신합니다.
      if (insets.bottom > stableBottom) {
        console.log(`🛠️ [Android Inset Fix] 시스템 바 노출 감지! 탭바 끌어올림: ${stableBottom} -> ${insets.bottom}`);
        setStableBottom(insets.bottom);
      }
    }
  }, [insets.bottom, stableBottom]);

  return Platform.OS === 'ios' ? insets.bottom : stableBottom;
};

// ============================================
// 메인 탭 네비게이터
// ============================================
const MainTabNavigator: React.FC = () => {
  const stableBottom = useAndroidLockedBottom();

  const tabBarStyle = useMemo(() => {
    // 🚨 기존에는 안드로이드 높이를 64로 고정했지만, 이제 stableBottom(48px 등)을 더해서 위로 올려줍니다!
    const finalHeight = Platform.OS === 'ios' ? 88 + stableBottom : 64 + stableBottom;
    const finalPadding = Platform.OS === 'ios' ? stableBottom + 10 : stableBottom + 12;

    console.log(`📐 [TabBarStyle] 최종 탭바 높이: ${finalHeight}, 하단 패딩: ${finalPadding}`);

    return [
      styles.tabBar,
      {
        height: finalHeight,
        paddingBottom: finalPadding,
        paddingTop: 10,
      },
    ];
  }, [stableBottom]); // 의존성 배열에 stableBottom만 남깁니다.

  const screenOptions = useCallback(({ route }: any) => ({
      headerShown: false,
      tabBarShowLabel: false, // 🚨 핵심: 기본 라벨(글자)을 숨깁니다!
      tabBarActiveTintColor: '#FF6B6B',
      tabBarInactiveTintColor: '#A0938A',
      tabBarStyle,
      tabBarHideOnKeyboard: true,

      // 🚨 아이콘과 글자를 하나로 묶어서 예쁜 둥근 배경 안에 넣습니다.
      tabBarIcon: ({ focused, color }: any) => {
        let iconName: any;
        let labelName = '';

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
          labelName = '홈';
        } else if (route.name === 'Memory') {
          iconName = focused ? 'images' : 'images-outline';
          labelName = '추억일기';
        } else if (route.name === 'Promise') {
          iconName = focused ? 'calendar' : 'calendar-outline';
          labelName = '약속일기';
        }
      return (
          <View style={[styles.tabItemContainer, focused && styles.activeTabBg]}>
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={[styles.tabBarLabel, { color }]}>{labelName}</Text>
          </View>
        );
      },
    }), [tabBarStyle]);

  return (
    <MainTab.Navigator screenOptions={screenOptions}>
      <MainTab.Screen name="Home"    component={HomeStackNavigator} />
      <MainTab.Screen name="Memory"  component={MemoryStackNavigator} />
      <MainTab.Screen name="Promise" component={PromiseStackNavigator} />
    </MainTab.Navigator>
  );
};

const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login"          component={LoginScreen} />
    <AuthStack.Screen name="Signup"         component={SignupScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="FindId"         component={FindIdScreen} />
    <AuthStack.Screen name="NotFound"       component={NotFoundScreen} />
  </AuthStack.Navigator>
);

export const Navigation: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen message="잠시만요..." />;
  return (
    <NavigationContainer fallback={<LoadingScreen message="페이지를 준비 중이에요" />}>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#F0EBE1',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
  // 🚨 아이콘과 글자를 감싸는 컨테이너 스타일 추가
    tabItemContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 16, // 가로 공간을 충분히 주어 찌그러짐 방지
      borderRadius: 20,
    },
    activeTabBg: {
      backgroundColor: '#FFF5F5', // 클릭 시 핑크색 둥근 배경
    },
    tabBarLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      marginTop: 2
    },
  });

export default Navigation;
