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
 * 260502 변경:
 *   - 프로필 사진 업로드 UI 추가 (탭 → 갤러리에서 선택 → 업로드)
 *   - user.petPhotoUrl 이 있으면 이미지로, 없으면 이모지로 폴백
 */

import { API_BASE_URL } from '../../constants/config';
import React, { useState } from 'react';
import { Platform
} from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@constants/colors';
import { FontFamily, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { useAuth } from '@context/AuthContext';
import { updateNotificationSettings, uploadPetPhoto } from '@services/userService';
import { Card } from '@components/common';

// ============================================
// 컴포넌트
// ============================================

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(
    user?.scheduleSet === 1
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // 🚨 만능 URL 헬퍼 함수 추가 (HomeScreen과 동일)
  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http') && !path.includes('localhost')) {
      return path;
    }
    const cleanPath = path.replace(/http:\/\/localhost:\d+/g, '');
    return `${API_BASE_URL}/uploads${cleanPath}`;
  };

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
      setNotificationEnabled(!value);
      Alert.alert('오류', '설정 변경에 실패했습니다.');
    }
  };

  // ========================================
  // 프로필 사진 업로드
  // ========================================

  const handlePickPetPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // 최신 API 적용
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setIsUploadingPhoto(true);
      const updatedUser = await uploadPetPhoto(result.assets[0].uri);

      if (updatedUser) {
        updateUser(updatedUser);
        Alert.alert('완료', '프로필 사진이 업데이트되었습니다. 🐾');
      }
    } catch (e: any) {
      Alert.alert('오류', e.message || '사진 업로드에 실패했습니다.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ========================================
  // 로그아웃 / 회원 탈퇴
  // ========================================

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: async () => { await logout(); } },
      ]
    );
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  // ========================================
  // 메뉴 아이템 컴포넌트
  // ========================================

  const MenuItem = ({ icon, title, subtitle, onPress, rightElement, danger = false }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.error : '#A0938A'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#D1CCC5" />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 🚨 다이어리 감성으로 업그레이드된 프로필 카드 */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={handlePickPetPhoto}
            activeOpacity={0.8}
            disabled={isUploadingPhoto}
          >
            {isUploadingPhoto ? (
              <ActivityIndicator color={Colors.primary} />
            ) : user?.petPhotoUrl ? (
              <Image source={{ uri: getImageUrl(user.petPhotoUrl) }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarEmoji}>🐾</Text>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.petName || '반려동물'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.signupTypeBadge}>
              <Text style={styles.signupTypeText}>{user?.signupTypeText || '일반'} 회원</Text>
            </View>
          </View>
        </View>

        {/* 설정 메뉴들 (몽글몽글한 카드 디자인 적용) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 설정</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="camera-outline" title="프로필 사진 변경" onPress={handlePickPetPhoto} />
            <MenuItem icon="person-outline" title="프로필 수정" onPress={() => navigation.navigate('EditProfile')} />
            {user?.signupType === 1 && (
              <MenuItem icon="lock-closed-outline" title="비밀번호 변경" onPress={() => navigation.navigate('ChangePassword')} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="일정 알림"
              rightElement={
                <Switch
                  value={notificationEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={notificationEnabled ? Colors.primary : Colors.surface}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" title="로그아웃" onPress={handleLogout} />
            <MenuItem icon="trash-outline" title="회원 탈퇴" onPress={handleDeleteAccount} danger />
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Happy & Navi 🐾</Text>
          <Text style={styles.appVersion}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' }, // 크림색 배경
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: '#4A3B32' },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  // 🐾 프로필 카드 디자인 변경
  profileCard: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl,
    backgroundColor: '#FFFDF9',
    padding: Spacing.lg, borderRadius: 20,
    borderWidth: 1, borderColor: '#F0EBE1',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
    borderWidth: 4, borderColor: '#FFFBF0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 40 },
  avatarEmoji: { fontSize: 32 },
  cameraBadge: {
    position: 'absolute', right: -4, bottom: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.promisePrimary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFFDF9',
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: FontFamily.diary, fontSize: 25, color: '#4A3B32' },
  profileEmail: { fontSize: FontSize.sm, color: '#A0938A', marginTop: 4 },
  signupTypeBadge: {
    backgroundColor: '#F0EBE1', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 8,
  },
  signupTypeText: { fontSize: FontSize.xs, color: '#4A3B32', fontWeight: 'bold' },

  // 메뉴 디자인 변경
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: 'bold', color: '#A0938A',
    marginBottom: Spacing.sm, marginLeft: Spacing.xs,
  },
  menuCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#F0EBE1',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: '#FDFBF7',
  },
  menuIconContainer: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFFBF0',
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  menuIconDanger: { backgroundColor: '#FFF5F5' },
  menuContent: { flex: 1 },
  menuTitle: { fontFamily: FontFamily.diary, fontSize: 20, color: '#4A3B32' },
  menuTitleDanger: { color: Colors.error },
  menuSubtitle: { fontSize: FontSize.sm, color: '#A0938A', marginTop: 2 },

  appInfo: { alignItems: 'center', marginTop: Spacing.lg, paddingTop: Spacing.xl },
  appName: { fontSize: FontSize.md, fontWeight: 'bold', color: '#A0938A' },
  appVersion: { fontSize: FontSize.sm, color: '#D1CCC5', marginTop: 4 },
});

export default SettingsScreen;
