/**
 * =========================================
 * 회원 탈퇴 화면 (DeleteAccountScreen.tsx)
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
import { deleteAccount } from '@services/userService';

export const DeleteAccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const isNormal = user?.signupType === 1;
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '회원 탈퇴',
      '모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴', style: 'destructive', onPress: async () => {
            try {
              setIsLoading(true);
              await deleteAccount(isNormal ? password : undefined);
              await logout();
            } catch (e: any) {
              Alert.alert('오류', e.message || '탈퇴 실패');
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원 탈퇴</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 경고 카드 */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconBg}>
            <Ionicons name="warning-outline" size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.warningTitle}>정말 탈퇴하시겠습니까?</Text>
          <Text style={styles.warningDesc}>
            {'탈퇴 시 아래 모든 데이터가\n영구적으로 삭제됩니다.'}
          </Text>

          {/* 삭제 항목 목록 */}
          <View style={styles.deleteList}>
            {['추억일기 (사진·영상·기록)', '약속일기 (일정·메모)', '반려동물 프로필 사진', '계정 정보'].map(item => (
              <View key={item} style={styles.deleteItem}>
                <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                <Text style={styles.deleteItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 비밀번호 확인 (일반 회원만) */}
        {isNormal && (
          <View style={styles.formCard}>
            <Input
              label="비밀번호 확인"
              placeholder="현재 비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        <Button
          title="회원 탈퇴"
          onPress={handleDelete}
          loading={isLoading}
          style={styles.deleteBtn}
        />

        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelLinkText}>탈퇴하지 않고 돌아가기</Text>
        </TouchableOpacity>
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

  warningCard: {
    alignItems: 'center', backgroundColor: '#FFF5F5',
    borderRadius: 24, padding: Spacing.xl,
    borderWidth: 1, borderColor: '#FFD5D5',
    marginBottom: Spacing.xl,
  },
  warningIconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  warningTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginBottom: Spacing.sm },
  warningDesc:  { fontSize: 14, color: '#A0938A', textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },

  deleteList: { alignSelf: 'stretch', gap: 8 },
  deleteItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteItemText: { fontSize: 13, color: '#A0938A' },

  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.xl,
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },

  deleteBtn:  { backgroundColor: '#FF6B6B', borderRadius: 16, marginBottom: Spacing.md },
  cancelLink: { alignItems: 'center', paddingVertical: Spacing.md },
  cancelLinkText: { fontSize: 14, color: '#A0938A', textDecorationLine: 'underline' },
});

export default DeleteAccountScreen;
