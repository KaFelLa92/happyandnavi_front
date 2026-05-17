/**
 * =========================================
 * 프로필 수정 화면 (EditProfileScreen.tsx)
 * =========================================
 *
 */

 import React, { useState } from 'react';
 import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Spacing } from '@constants/typography';
 import { Input, Button } from '@components/common';
 import { useAuth } from '@context/AuthContext';
 import { updateMyInfo } from '@services/userService';
 import { FontFamily } from '@constants/typography';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [petName, setPetName] = useState(user?.petName || '');
  const [phone,    setPhone]    = useState(user?.phone    || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!petName.trim()) { Alert.alert('알림', '반려동물 이름을 입력해주세요.'); return; }
    try {
      setIsLoading(true);
      const updated = await updateMyInfo({ petName, phone });
      updateUser(updated);
      Alert.alert('완료', '프로필이 수정되었습니다. 🐾', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '수정 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 아바타 영역 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🐾</Text>
          </View>
          <Text style={styles.avatarHint}>
            {user?.petName ? `${user.petName}의 정보를 수정해보세요` : '반려동물 정보를 입력해주세요'}
          </Text>
        </View>

        {/* 입력 카드 */}
        <View style={styles.formCard}>
          <Input
            label="반려동물 이름"
            placeholder="이름을 입력해주세요"
            value={petName}
            onChangeText={setPetName}
          />
          <Input
            label="연락처"
            placeholder="010-0000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="저장하기"
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#FDFBF7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { fontSize: 17, fontWeight: 'bold', color: '#4A3B32' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xxl, marginBottom: Spacing.xl },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#FFFBF0',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    marginBottom: Spacing.lg,
  },
  avatarEmoji: { fontSize: 48 },
  avatarHint:  { fontSize: 14, color: '#A0938A', textAlign: 'center' },

  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.xl,
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },

  saveBtn: { backgroundColor: '#FF6B6B', borderRadius: 16 },
});

export default EditProfileScreen;