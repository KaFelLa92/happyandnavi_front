/**
 * =========================================
 * 홈 화면 (HomeScreen.tsx)
 * =========================================
 * 260503 변경:
 *   - 머릿문구 랜덤 출력 (확률 기반 4종)
 *   - allowsEditing: Platform.OS === 'ios' (Android 편집 버튼 버그 대응)
 *   - uploadPetPhoto 호출 방식 정리 (service 함수 직접 사용)
 */

import { API_BASE_URL } from '../../constants/config';
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Image, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { useAuth } from '@context/AuthContext';
import { uploadPetPhoto } from '@services/userService';
import { FontFamily } from '@constants/typography';
import { CustomAlert } from '@components/common/CustomAlert'; // 🚨 커스텀 알럿 임포트

const { width } = Dimensions.get('window');
const defaultPetImage = require('../../../assets/icon.png');

const getGreeting = (petName: string, regDate?: string): string => {
  const name = petName?.trim() || '우리 아이';
  const rand = Math.random();
  if (rand < 0.25) return `${name}(이)랑 오늘도 행복하게! 🐾`;
  if (rand < 0.55) return `오늘 ${name}(이)는 어때요? 🐾`;
  if (rand < 0.75 && regDate) {
    try {
      const start = new Date(regDate);
      const today = new Date();
      const days = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
      return `${name}(이)랑 함께한 ${days}일째 🐾`;
    } catch {}
  }
  return `오늘도 ${name}(이)랑 즐거운 하루! 🌟`;
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // 🚨 커스텀 알럿용 상태 관리
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const triggerAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const greeting = useMemo(
    () => getGreeting(user?.petName ?? '', (user as any)?.regDate),
    [user?.petName, (user as any)?.regDate],
  );

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http') && !path.includes('localhost')) return path;
    const cleanPath = path.replace(/http:\/\/localhost:\d+/g, '');
    return `${API_BASE_URL}/uploads${cleanPath}`;
  };

  const pickPetPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      triggerAlert('권한 필요', '사진첩 접근 권한이 필요합니다.');
      return;
    }

    const mediaTypes = (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: Platform.OS === 'ios',
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        const updatedUser = await uploadPetPhoto(result.assets[0].uri);
        if (updateUser) updateUser(updatedUser);
        triggerAlert('완료', '프로필 사진이 변경되었습니다. 🐾');
      } catch {
        triggerAlert('오류', '사진 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          <View style={styles.springBinding}>
            {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.springRing} />)}
          </View>

          <TouchableOpacity onPress={pickPetPhoto} style={styles.profileImageContainer} activeOpacity={0.8}>
            {isUploading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <Image
                source={user?.petPhotoUrl ? { uri: getImageUrl(user.petPhotoUrl) } : defaultPetImage}
                style={user?.petPhotoUrl ? styles.profileImage : styles.logoDefaultImage}
                resizeMode={user?.petPhotoUrl ? 'cover' : 'contain'}
              />
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.petNameText}>{user?.petName || '반려동물'}의 일기장 📖</Text>

          {/* 🚨 업그레이드 코드: Idea A "오늘의 반려동물 대시보드 카드" */}
          <View style={styles.dashboardContainer}>
            <Text style={styles.dashboardTitle}>📋 오늘의 기록 현황</Text>
            <View style={styles.dashboardGrid}>
              <View style={styles.dashboardItem}>
                <Ionicons name="images-outline" size={22} color="#FF6B6B" />
                <Text style={styles.dashboardLabel}>기록된 추억</Text>
                <Text style={styles.dashboardCount}>추억 가득 🐾</Text>
              </View>
              <View style={styles.dashboardItem}>
                <Ionicons name="calendar-outline" size={22} color="#4FC3F7" />
                <Text style={styles.dashboardLabel}>남은 약속</Text>
                <Text style={styles.dashboardCount}>일정 확인 📅</Text>
              </View>
            </View>

            {/* 임박 일정 퀵 배너 */}
            <View style={styles.ddayBanner}>
              <Text style={styles.ddayBadge}>D-Day</Text>
              <Text style={styles.ddayText} numberOfLines={1}>캘린더 탭에서 소중한 약속을 관리해 보세요!</Text>
            </View>
          </View>

          <View style={styles.diaryButtons}>
            <TouchableOpacity style={[styles.diaryButton, styles.memoryButton]} onPress={() => navigation.navigate('Memory')} activeOpacity={0.8}>
              <Text style={styles.diaryButtonText}>추억일기 펼치기 📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.diaryButton, styles.promiseButton]} onPress={() => navigation.navigate('Promise')} activeOpacity={0.8}>
              <Text style={styles.diaryButtonText}>약속일기 펼치기 📅</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 🚨 공통 커스텀 알럿 장착 */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  headerLeft: { flex: 1 },
  greeting:   { fontFamily: FontFamily.diary, fontSize: 23, color: Colors.textPrimary },
  settingsButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center', paddingTop: Spacing.md },
  cardContainer: {
    width: width - Spacing.lg * 2, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1', ...Shadow.md,
  },
  springBinding: { flexDirection: 'row', justifyContent: 'space-around', width: '70%', marginBottom: Spacing.md },
  springRing: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1CCC5' },
  profileImageContainer: { position: 'relative', marginBottom: Spacing.md },
  profileImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: '#FFFFFF' },
  logoDefaultImage: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#F0EBE1' },
  editIconBadge: { position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  petNameText: { fontFamily: FontFamily.diary, fontSize: 22, color: Colors.textPrimary, marginBottom: Spacing.lg },

  // 🚨 대시보드 추가 스타일
  dashboardContainer: { width: '100%', backgroundColor: '#FDFBF7', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: '#F0EBE1' },
  dashboardTitle: { fontSize: 13, fontWeight: 'bold', color: '#4A3B32', marginBottom: Spacing.sm },
  dashboardGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  dashboardItem: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: '#F5F0E6' },
  dashboardLabel: { fontSize: 11, color: '#A0938A', marginTop: 4 },
  dashboardCount: { fontSize: 13, fontWeight: '700', color: '#4A3B32', marginTop: 2 },
  ddayBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 8, borderRadius: 8, gap: 6, marginTop: 4 },
  ddayBadge: { backgroundColor: '#FF6B6B', color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ddayText: { fontSize: 11, color: '#A0938A', flex: 1 },

  diaryButtons: { flexDirection: 'column', width: '100%', gap: Spacing.sm },
  diaryButton: { width: '100%', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  memoryButton:  { backgroundColor: '#FFB5B5' },
  promiseButton: { backgroundColor: '#81C784' }, // 따뜻한 연그린 톤 보완
  diaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});

export default HomeScreen;