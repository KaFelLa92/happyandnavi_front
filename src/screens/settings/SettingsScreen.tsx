/**
 * =========================================
 * 설정 화면 (SettingsScreen.tsx)
 * =========================================
 * 
 * 마이페이지/설정 화면입니다.
 * 
 * 기능:
 * - 프로필 정보 표시
 * - 정보 수정
 * - 비밀번호 변경
 * - 알림 설정
 * - 로그아웃
 * - 회원 탈퇴
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '@constants/typography';
import { useAuth } from '@context/AuthContext';
import { updateNotificationSettings } from '@services/userService';
import { Card } from '@components/common';

// ============================================
// 컴포넌트
// ============================================

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(
    user?.scheduleSet === 1
  );

  // ========================================
  // 알림 설정 토글
  // ========================================

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationEnabled(value);
      await updateNotificationSettings(value ? 1 : 0);
      
      if (user) {
        updateUser({ ...user, scheduleSet: value ? 1 : 0 });
      }
    } catch (error) {
      // 실패 시 롤백
      setNotificationEnabled(!value);
      Alert.alert('오류', '설정 변경에 실패했습니다.');
    }
  };

  // ========================================
  // 로그아웃
  // ========================================

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // ========================================
  // 회원 탈퇴
  // ========================================

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  // ========================================
  // 메뉴 아이템 컴포넌트
  // ========================================

  interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }

  const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? Colors.error : Colors.primary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        onPress && (
          <Ionicons name="chevron-forward" size={20} color={Colors.textHint} />
        )
      )}
    </TouchableOpacity>
  );

  // ========================================
  // 렌더링
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {/* ======== 헤더 ======== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ======== 프로필 카드 ======== */}
        <Card style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarEmoji}>🐾</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.userName || '반려동물'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.signupTypeBadge}>
              <Text style={styles.signupTypeText}>
                {user?.signupTypeText || '일반'} 회원
              </Text>
            </View>
          </View>
        </Card>

        {/* ======== 계정 설정 ======== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 설정</Text>
          <Card style={styles.menuCard} noPadding>
            <MenuItem
              icon="person-outline"
              title="프로필 수정"
              subtitle="반려동물 이름, 연락처 변경"
              onPress={() => navigation.navigate('EditProfile')}
            />
            {user?.signupType === 1 && (
              <MenuItem
                icon="lock-closed-outline"
                title="비밀번호 변경"
                onPress={() => navigation.navigate('ChangePassword')}
              />
            )}
          </Card>
        </View>

        {/* ======== 앱 설정 ======== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <Card style={styles.menuCard} noPadding>
            <MenuItem
              icon="notifications-outline"
              title="일정 알림"
              subtitle={notificationEnabled ? '켜짐' : '꺼짐'}
              rightElement={
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={notificationEnabled ? Colors.primary : Colors.surface}
                />
              }
            />
          </Card>
        </View>

        {/* ======== 계정 관리 ======== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <Card style={styles.menuCard} noPadding>
            <MenuItem
              icon="log-out-outline"
              title="로그아웃"
              onPress={handleLogout}
            />
            <MenuItem
              icon="trash-outline"
              title="회원 탈퇴"
              onPress={handleDeleteAccount}
              danger
            />
          </Card>
        </View>

        {/* ======== 앱 정보 ======== */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Happy & Navi 🐾</Text>
          <Text style={styles.appVersion}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  // 콘텐츠
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // 프로필 카드
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  signupTypeBadge: {
    backgroundColor: Colors.memoryPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  signupTypeText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },

  // 섹션
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuCard: {
    overflow: 'hidden',
  },

  // 메뉴 아이템
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIconDanger: {
    backgroundColor: '#FFEBEE',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  menuTitleDanger: {
    color: Colors.error,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },

  // 앱 정보
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  appName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  appVersion: {
    fontSize: FontSize.sm,
    color: Colors.textHint,
    marginTop: Spacing.xs,
  },
});

export default SettingsScreen;
