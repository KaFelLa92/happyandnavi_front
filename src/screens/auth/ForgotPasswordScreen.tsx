/**
 * =========================================
 * 비밀번호 찾기 화면 (ForgotPasswordScreen.tsx)
 * =========================================
 * 260509 신규: 로그인 이전 화면에서 접근 가능한 비밀번호 재설정 진입점
 *
 * NOTE: 백엔드 비번 리셋 API (forgotPassword/sendResetCode 등) 가 추가되면
 * 이메일 인증 코드 발송 → 검증 → 새 비번 설정 흐름으로 확장 필요.
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
import { resetPassword } from '@services/authService';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) { Alert.alert('알림', '이메일을 입력해주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      Alert.alert('알림', '올바른 이메일 형식이 아니에요.'); return;
    }

    try {
      setIsLoading(true);
      await resetPassword(trimmed); // 임시 비밀번호 발송 API 호출
      setSent(true); // 성공 화면으로 전환
      Alert.alert(
        '전송 완료',
        `${trimmed} 주소로 비밀번호 재설정 안내를 보냈어요.\n메일함을 확인해주세요. 🐾`,
      );
    } catch (e: any) {
      Alert.alert('오류', e.message || '전송에 실패했어요.');
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
          <Text style={styles.headerTitle}>비밀번호 찾기</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={32} color="#FF6B6B" />
          </View>

          <Text style={styles.title}>비밀번호를 잊으셨나요?</Text>
          <Text style={styles.desc}>
            {'가입 시 사용한 이메일을 입력해주세요.\n비밀번호 재설정 링크를 보내드릴게요.'}
          </Text>

          <View style={styles.formCard}>
            <Input
              label="이메일"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!sent}
            />
          </View>

          <Button
            title={sent ? '재전송' : '재설정 링크 보내기'}
            onPress={handleSend}
            loading={isLoading}
            style={styles.primaryBtn}
          />

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
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#4A3B32' },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40, alignItems: 'center' },

  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.xl, marginBottom: Spacing.xl,
    borderWidth: 2, borderColor: '#FFD5D5',
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
  primaryBtn: { alignSelf: 'stretch', backgroundColor: '#FF6B6B', borderRadius: 16, marginBottom: Spacing.md },

  linkRow:  { padding: Spacing.md },
  linkText: { fontSize: 14, color: '#A0938A', textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;
