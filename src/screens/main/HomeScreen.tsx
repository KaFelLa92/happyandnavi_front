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
  ScrollView, Dimensions, Image, Alert,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { useAuth } from '@context/AuthContext';
import { uploadPetPhoto } from '@services/userService';

const { width } = Dimensions.get('window');
const defaultPetImage = require('../../../assets/icon.png');

// ============================================
// 랜덤 머릿문구 생성 (확률 기반)
// ============================================

/**
 * 확률 분포:
 *  A: "{name}(이)랑 오늘도 행복하게! 🐾"   25%
 *  B: "오늘 {name}(이)는 어때요? 🐾"       30%
 *  C: "{name}(이)랑 함께한 {n}일째 🐾"     20% (regDate 있을 때, 없으면 D로 대체)
 *  D: "오늘도 {name}(이)랑 즐거운 하루! 🌟" 25%
 */
const getGreeting = (petName: string, regDate?: string): string => {
  const name = petName?.trim() || '우리 아이';
  const rand = Math.random();

  if (rand < 0.25) {
    // A — 25%
    return `${name}(이)랑 오늘도 행복하게! 🐾`;
  }
  if (rand < 0.55) {
    // B — 30%
    return `오늘 ${name}(이)는 어때요? 🐾`;
  }
  if (rand < 0.75 && regDate) {
    // C — 20% (regDate 없으면 D로 넘어감)
    try {
      const start = new Date(regDate);
      const today = new Date();
      const days  = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
      return `${name}(이)랑 함께한 ${days}일째 🐾`;
    } catch {
      // 파싱 실패 시 D로 fallthrough
    }
  }
  // D — 25% (또는 C 조건 미충족 시 fallback)
  return `오늘도 ${name}(이)랑 즐거운 하루! 🌟`;
};

// ============================================
// 컴포넌트
// ============================================

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

// 🚨 [디버깅] 현재 로그인된 user 객체에 사진 경로가 어떤 키값으로 들어오는지 확인합니다.
  console.log('====================================');
  console.log('[DEBUG] 현재 로그인된 유저 정보:', user);
  console.log('====================================');

  // 앱 마운트 시 한 번만 계산 (탭 전환해도 변경되지 않음)
  const greeting = useMemo(
    () => getGreeting(user?.petName ?? '', (user as any)?.regDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;

    // 1. 카카오/구글 프사 등 진짜 외부 URL인 경우 (kakaocdn 등) 그대로 사용
    if (path.startsWith('http') && !path.includes('localhost')) {
      return path;
    }

    // 2. 백엔드가 localhost로 잘못 보냈다면 그 부분을 깔끔하게 잘라냅니다.
    // 예: "http://localhost:8080/profile/..." -> "/profile/..."
    const cleanPath = path.replace(/http:\/\/localhost:\d+/g, '');

    // 3. 현재 접속된 노트북 IP(API_BASE_URL)와 /uploads 를 붙여서 최종 주소 완성!
    // 예: "http://172.30.1.65:8080/uploads/profile/..."
    return `${API_BASE_URL}/uploads${cleanPath}`;
  };

  // ============================================
  // 반려동물 프로필 사진 업로드
  // ============================================
  const pickPetPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      // Android: allowsEditing=true 로 설정 시 편집 화면에서 완료 버튼이
      // 일부 기종에서 보이지 않는 버그 → iOS만 true
      allowsEditing: Platform.OS === 'ios',
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        const updatedUser = await uploadPetPhoto(result.assets[0].uri);
        if (updateUser) updateUser(updatedUser);
        Alert.alert('완료', '프로필 사진이 변경되었습니다. 🐾');
      } catch (error) {
        Alert.alert('오류', '사진 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardContainer}>
          {/* 스프링 바인딩 */}
          <View style={styles.springBinding}>
            {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.springRing} />)}
          </View>

          {/* 반려동물 프로필 사진 */}
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

          {/* 반려동물 이름 */}
          <Text style={styles.petNameText}>{user?.petName || '반려동물'}의 일기장 📖</Text>

          {/* 다이어리 선택 버튼 */}
          <View style={styles.diaryButtons}>
            <TouchableOpacity
              style={[styles.diaryButton, styles.memoryButton]}
              onPress={() => navigation.navigate('Memory')}
              activeOpacity={0.8}
            >
              <Text style={styles.diaryButtonText}>추억일기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.diaryButton, styles.promiseButton]}
              onPress={() => navigation.navigate('Promise')}
              activeOpacity={0.8}
            >
              <Text style={styles.diaryButtonText}>약속일기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteLines}>
            {[1, 2, 3].map(i => <View key={i} style={styles.noteLine} />)}
          </View>
          <View style={styles.noteDecorations}>
            <Text style={styles.noteDeco}>🐾</Text>
            <Text style={styles.noteDeco}>💕</Text>
            <Text style={styles.noteDeco}>📖</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  settingsButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', ...Shadow.sm,
  },
  content: { flex: 1 },
  scrollContent: {
    flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl,
    alignItems: 'center', paddingTop: Spacing.md,
  },
  cardContainer: {
    width: width - Spacing.lg * 2, backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl, padding: Spacing.xl, paddingTop: Spacing.xxxl,
    alignItems: 'center', ...Shadow.md,
  },
  springBinding: {
    position: 'absolute', left: 20, top: 0, bottom: 0, width: 30,
    justifyContent: 'space-evenly', paddingVertical: Spacing.xl,
  },
  springRing: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 3,
    borderColor: Colors.border, backgroundColor: Colors.background,
  },
  profileImageContainer: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
    marginLeft: 20, ...Shadow.sm, borderWidth: 4, borderColor: Colors.surfaceLight,
  },
  profileImage:      { width: '100%', height: '100%', borderRadius: 70 },
  logoDefaultImage:  { width: '70%', height: '70%', opacity: 0.8 },
  editIconBadge: {
    position: 'absolute', bottom: 0, right: 10, backgroundColor: Colors.primary,
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: Colors.surfaceLight,
  },
  petNameText: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary,
    marginBottom: Spacing.xl, marginLeft: 20,
  },
  diaryButtons: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.md,
    marginBottom: Spacing.xl, marginLeft: 20,
  },
  diaryButton: {
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, ...Shadow.sm,
  },
  memoryButton:  { backgroundColor: Colors.memoryPrimary },
  promiseButton: { backgroundColor: Colors.promisePrimary },
  diaryButtonText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  noteLines:      { width: '70%', marginLeft: 20, marginBottom: Spacing.lg },
  noteLine:       { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm, opacity: 0.5 },
  noteDecorations:{ flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginLeft: 20 },
  noteDeco:       { fontSize: 20, opacity: 0.6 },
});

export default HomeScreen;
