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
import { FontFamily } from '@constants/typography';

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

  // ============================================
  // 반려동물 프로필 사진 업로드
  // ============================================
  const pickPetPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
      return;
    }

    // ⚠️ Android 호환을 위해 MediaTypeOptions.Images 사용
    // (배열 문법 ['images'] 은 일부 expo 버전에서 Android 동작 불안정)
    const mediaTypes = (ImagePicker as any).MediaType?.Images
      ?? ImagePicker.MediaTypeOptions.Images;

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
        Alert.alert('완료', '프로필 사진이 변경되었습니다. 🐾');
      } catch {
        Alert.alert('오류', '사진 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    // 🔒 bottom 제외 — 카메라/갤러리 복귀 시 inset 변동이 레이아웃에 영향 안 주도록
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
  greeting:   { fontFamily: FontFamily.diary, fontSize: 23, color: Colors.textPrimary },
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
    width: width - Spacing.lg * 2,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadow.md,
  },
  springBinding: {
    flexDirection: 'row', justifyContent: 'space-around', width: '70%',
    marginBottom: Spacing.lg,
  },
  springRing: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1CCC5',
  },
  profileImageContainer: {
    position: 'relative', marginBottom: Spacing.md,
  },
  profileImage: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 4, borderColor: '#FFFFFF',
  },
  logoDefaultImage: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#F0EBE1',
  },
  editIconBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFFFFF',
  },
  petNameText: {
    fontFamily: FontFamily.diary, fontSize: 22,
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  diaryButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  diaryButton: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: 24, ...Shadow.sm,
  },
  memoryButton:  { backgroundColor: '#FFB5B5' },
  promiseButton: { backgroundColor: '#A8DADC' },
  diaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  noteLines: { width: '90%', gap: 12, marginBottom: Spacing.lg },
  noteLine:  { height: 1, backgroundColor: '#F0EBE1' },
  noteDecorations: {
    flexDirection: 'row', justifyContent: 'space-around', width: '60%',
  },
  noteDeco: { fontSize: 18, opacity: 0.5 },
});

export default HomeScreen;
