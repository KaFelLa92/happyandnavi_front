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

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, ComponentSize } from '../constants/typography';
import { useAuth } from '../context/AuthContext';

import { SplashScreen, LoginScreen, SignupScreen } from '../screens/auth';
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

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MemoryStack = createNativeStackNavigator();
const PromiseStack = createNativeStackNavigator();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Settings" component={SettingsScreen} />
    <HomeStack.Screen name="EditProfile" component={EditProfileScreen} />
    <HomeStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <HomeStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
  </HomeStack.Navigator>
);

const MemoryStackNavigator: React.FC = () => (
  <MemoryStack.Navigator screenOptions={{ headerShown: false }}>
    <MemoryStack.Screen name="MemoryCalendar" component={MemoryCalendarScreen} />
    <MemoryStack.Screen name="MemoryCreate" component={MemoryCreateScreen} />
    <MemoryStack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
    <MemoryStack.Screen name="MemoryEdit" component={MemoryEditScreen} />
  </MemoryStack.Navigator>
);

const PromiseStackNavigator: React.FC = () => (
  <PromiseStack.Navigator screenOptions={{ headerShown: false }}>
    <PromiseStack.Screen name="PromiseCalendar" component={PromiseCalendarScreen} />
    <PromiseStack.Screen name="PromiseCreate" component={PromiseCreateScreen} />
    <PromiseStack.Screen name="PromiseDetail" component={PromiseDetailScreen} />
    <PromiseStack.Screen name="PromiseEdit" component={PromiseEditScreen} />
  </PromiseStack.Navigator>
);

const MainTabNavigator: React.FC = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Memory') iconName = focused ? 'images' : 'images-outline';
        else if (route.name === 'Promise') iconName = focused ? 'calendar' : 'calendar-outline';
        return (
          <View style={focused ? styles.activeTabIcon : undefined}>
            <Ionicons name={iconName} size={24} color={color} />
          </View>
        );
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textHint,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarItemStyle: styles.tabBarItem,
    })}
  >
    <MainTab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: '홈' }} />
    <MainTab.Screen name="Memory" component={MemoryStackNavigator} options={{ tabBarLabel: '추억일기' }} />
    <MainTab.Screen name="Promise" component={PromiseStackNavigator} options={{ tabBarLabel: '약속일기' }} />
  </MainTab.Navigator>
);

const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

export const Navigation: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: ComponentSize.tabBarHeight,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, marginTop: 4 },
  tabBarItem: { paddingVertical: 4 },
  activeTabIcon: { backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 6 },
});

export default Navigation;