/**
 * =========================================
 * 회원가입 화면 (SignupScreen.tsx)
 * =========================================
 * 
 * 일반 회원가입을 처리합니다.
 * 
 * 입력 필드:
 * - 이메일 (중복 확인)
 * - 비밀번호 (영문, 숫자, 특수문자 포함 8~20자)
 * - 비밀번호 확인
 * - 연락처
 * - 반려동물 이름
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
} from '@constants/typography';
import { Button, Input } from '@components/common';
import { useAuth } from '@context/AuthContext';
import { checkEmailDuplicate } from '@services/authService';
import { AuthStackParamList } from '@types';

// ============================================
// 타입 정의
// ============================================

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  userName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  phone?: string;
  userName?: string;
}

// ============================================
// 컴포넌트
// ============================================

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  // ========================================
  // 상태
  // ========================================
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    userName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { signup } = useAuth();

  // ========================================
  // 입력값 변경 핸들러
  // ========================================

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    // 이메일 변경 시 중복 확인 상태 초기화
    if (field === 'email') {
      setIsEmailChecked(false);
    }
  };

  // ========================================
  // 이메일 중복 확인
  // ========================================

  const handleCheckEmail = async () => {
    const email = formData.email.trim();
    
    if (!email) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요.' }));
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      return;
    }

    try {
      setIsCheckingEmail(true);
      const isDuplicate = await checkEmailDuplicate(email);
      
      if (isDuplicate) {
        setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
        setIsEmailChecked(false);
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
        setIsEmailChecked(true);
        Alert.alert('확인 완료', '사용 가능한 이메일입니다.');
      }
    } catch (error) {
      Alert.alert('오류', '이메일 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // ========================================
  // 유효성 검사
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 이메일
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    } else if (!isEmailChecked) {
      newErrors.email = '이메일 중복 확인을 해주세요.';
    }

    // 비밀번호
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = '비밀번호는 8~20자 사이여야 합니다.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(formData.password)) {
      newErrors.password = '영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 연락처
    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요.';
    } else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다.';
    }

    // 반려동물 이름
    if (!formData.userName.trim()) {
      newErrors.userName = '반려동물 이름을 입력해주세요.';
    } else if (formData.userName.length > 30) {
      newErrors.userName = '이름은 30자를 초과할 수 없습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // 회원가입 핸들러
  // ========================================

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      await signup({
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        phone: formData.phone.replace(/-/g, ''),
        userName: formData.userName.trim(),
      });

      Alert.alert(
        '회원가입 완료',
        '회원가입이 완료되었습니다. 로그인해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        '회원가입 실패',
        error.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // 렌더링
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ======== 헤더 ======== */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>회원가입</Text>
            <View style={styles.backButton} />
          </View>

          {/* ======== 환영 메시지 ======== */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeEmoji}>🐾</Text>
            <Text style={styles.welcomeTitle}>반가워요!</Text>
            <Text style={styles.welcomeSubtitle}>
              해피야나비야와 함께{'\n'}소중한 일상을 기록해보세요
            </Text>
          </View>

          {/* ======== 입력 폼 ======== */}
          <View style={styles.formSection}>
            {/* 이메일 + 중복확인 */}
            <View style={styles.emailRow}>
              <View style={styles.emailInput}>
                <Input
                  label="이메일"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="mail-outline"
                  error={errors.email}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button
                title={isEmailChecked ? '✓' : '확인'}
                onPress={handleCheckEmail}
                loading={isCheckingEmail}
                variant={isEmailChecked ? 'primary' : 'secondary'}
                size="md"
                style={styles.checkButton}
              />
            </View>

            {/* 비밀번호 */}
            <Input
              label="비밀번호"
              placeholder="영문, 숫자, 특수문자 포함 8~20자"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
              showPasswordToggle
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {/* 비밀번호 확인 */}
            <Input
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해주세요"
              value={formData.passwordConfirm}
              onChangeText={(value) => handleChange('passwordConfirm', value)}
              secureTextEntry
              showPasswordToggle
              leftIcon="lock-closed-outline"
              error={errors.passwordConfirm}
            />

            {/* 연락처 */}
            <Input
              label="연락처"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />

            {/* 반려동물 이름 */}
            <Input
              label="반려동물 이름"
              placeholder="우리 아이 이름을 알려주세요 🐶🐱"
              value={formData.userName}
              onChangeText={(value) => handleChange('userName', value)}
              leftIcon="heart-outline"
              error={errors.userName}
            />

            {/* 회원가입 버튼 */}
            <Button
              title="가입하기"
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              style={styles.signupButton}
            />
          </View>

          {/* ======== 로그인 링크 ======== */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // 환영 메시지
  welcomeSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // 폼
  formSection: {
    marginBottom: Spacing.xl,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  emailInput: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkButton: {
    marginTop: 24,
    paddingHorizontal: Spacing.md,
  },
  signupButton: {
    marginTop: Spacing.lg,
  },

  // 로그인 링크
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  loginText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.xs,
  },
});

export default SignupScreen;
