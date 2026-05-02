import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { useAuth } from '@context/AuthContext';
import { uploadPetPhoto } from '@services/userService';

const { width } = Dimensions.get('window');
const defaultPetImage = require('../../../assets/icon.png');

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth(); // AuthContext에 updateUser 함수가 있다고 가정
  const [isUploading, setIsUploading] = useState(false);

  const pickPetPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // 정방형 크롭
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'pet_photo.jpg',
      } as any);

      try {
        const updatedUser = await uploadPetPhoto(formData, token?.accessToken || token);
        if (updateUser) updateUser(updatedUser); // 전역 상태 갱신
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
          <Text style={styles.greeting}>안녕하세요! 🐾</Text>
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
          {/* 스프링 바인딩 */}
          <View style={styles.springBinding}>
            {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.springRing} />)}
          </View>

          {/* 반려동물 프로필 사진 뷰 */}
          <TouchableOpacity onPress={pickPetPhoto} style={styles.profileImageContainer} activeOpacity={0.8}>
            {isUploading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
            <Image
              // 사용자가 등록한 URL이 있으면 그 URL을, 없으면 디폴트 로고를 보여줌
              source={user?.petPhotoUrl ? { uri: user.petPhotoUrl } : defaultPetImage}
              style={user?.petPhotoUrl ? styles.profileImage : styles.logoDefaultImage}
              resizeMode={user?.petPhotoUrl ? "cover" : "contain"} // 사진은 꽉 차게, 로고는 비율맞게
            />
          )}
            <View style={styles.editIconBadge}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* 반려동물 이름 텍스트 */}
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
  profileImage: { width: '100%', height: '100%', borderRadius: 70 },
  logoDefaultImage: {  width: '70%', height: '70%', opacity: 0.8, },
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
  memoryButton: { backgroundColor: Colors.memoryPrimary },
  promiseButton: { backgroundColor: Colors.promisePrimary },
  diaryButtonText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  noteLines: { width: '70%', marginLeft: 20, marginBottom: Spacing.lg },
  noteLine: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm, opacity: 0.5 },
  noteDecorations: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginLeft: 20 },
  noteDeco: { fontSize: 20, opacity: 0.6 },
});

export default HomeScreen;