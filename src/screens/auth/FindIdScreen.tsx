/**
 * =========================================
 * 아이디(이메일) 찾기 화면 (FindIdScreen.tsx)
 * =========================================
 * 260509 신규: 로그인 이전 화면에서 접근 가능한 이메일 찾기
 *
 * NOTE: 백엔드 API (findEmailByPhone 등) 가 추가되면 연락처 입력 → 이메일 일부 마스킹 표시.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@constants/typography';
import { Input, Button } from '@components/common';
import { findEmailByPhone } from '@services/authService';

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};

export const FindIdScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);

  const handleFind = async () => {
    const trimmed = phone.replace(/[^0-9]/g, '');
    if (!trimmed) { Alert.alert('알림', '연락처를 입력해주세요.'); return; }
    if (trimmed.length < 10) { Alert.alert('알림', '올바른 연락처가 아니에요.'); return; }

    try {
      setIsLoading(true);
      const maskedEmail = await findEmailByPhone(phone.trim());
      setFoundEmail(maskedEmail);
    } catch (e: any) {
      Alert.alert('오류', e.message || '조회에 실패했어요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#4A3B32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>아이디 찾기</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={32} color="#4FC3F7" />
          </View>

          <Text style={styles.title}>이메일이 기억나지 않으세요?</Text>
          <Text style={styles.desc}>
            {'가입 시 등록한 연락처를 입력해주세요.\n해당 연락처로 가입된 이메일을 알려드릴게요.'}
          </Text>

          <View style={styles.formCard}>
            <Input
              label="연락처"
              placeholder="010-0000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {foundEmail && (
            <View style={styles.resultCard}>
              <Ionicons name="checkmark-circle" size={28} color="#4FC3F7" style={{ marginBottom: 8 }} />
              <Text style={styles.resultLabel}>가입된 이메일</Text>
              <Text style={styles.resultEmail}>{foundEmail}</Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginBtnText}>로그인 하기</Text>
              </TouchableOpacity>
            </View>
          )}

          {!foundEmail && (
            <Button
              title="이메일 찾기"
              onPress={handleFind}
              loading={isLoading}
              style={styles.primaryBtn}
            />
          )}

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>로그인으로 돌아가기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerBtn:   { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#4A3B32' },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40, alignItems: 'center' },

  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EFF9FF', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.xl, marginBottom: Spacing.xl,
    borderWidth: 2, borderColor: '#B3E5FC',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4A3B32', marginBottom: Spacing.sm },
  desc:  { fontSize: 14, color: '#A0938A', textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },

  formCard: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: Spacing.lg,
    borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.xl,
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  primaryBtn: { alignSelf: 'stretch', backgroundColor: '#4FC3F7', borderRadius: 16, marginBottom: Spacing.md },

  resultCard: {
    alignSelf: 'stretch', alignItems: 'center',
    backgroundColor: '#EFF9FF', borderRadius: 20, padding: Spacing.xl,
    borderWidth: 1, borderColor: '#B3E5FC', marginBottom: Spacing.xl,
  },
  resultLabel: { fontSize: 12, color: '#A0938A', marginBottom: 6 },
  resultEmail: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32', marginBottom: Spacing.lg },
  loginBtn:    { backgroundColor: '#4FC3F7', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 14 },
  loginBtnText:{ color: '#fff', fontSize: 14, fontWeight: 'bold' },

  linkRow:  { padding: Spacing.md },
  linkText: { fontSize: 14, color: '#A0938A', textDecorationLine: 'underline' },
});

export default FindIdScreen;
