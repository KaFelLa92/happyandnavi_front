/**
 * =========================================
 * 로그인 화면 (LoginScreen.tsx)
 * =========================================
 * 
 * 일반 로그인 및 소셜 로그인(카카오, 구글)을 지원합니다.
 * 
 * 화면 구성:
 * - 로고 및 환영 메시지
 * - 이메일/비밀번호 입력
 * - 로그인 버튼
 * - 소셜 로그인 버튼 (카카오, 구글)
 * - 회원가입 링크
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '@constants/typography';
import { Button, Input } from '@components/common';
import { useAuth } from '@context/AuthContext';
import { AuthStackParamList } from '@types';

// ============================================
// 타입 정의
// ============================================

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// ============================================
// 컴포넌트
// ============================================

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // ========================================
  // 상태
  // ========================================
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // 인증 컨텍스트
  const { login, kakaoLogin, googleLogin } = useAuth();

  // ========================================
  // 유효성 검사
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // 이메일 검사
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검사
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // 로그인 핸들러
  // ========================================

  /**
   * 일반 로그인
   */
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      // 로그인 성공 시 AuthContext에서 자동으로 상태 업데이트
    } catch (error: any) {
      Alert.alert(
        '로그인 실패',
        error.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 카카오 로그인
   */
  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      
      // 실제 구현에서는 @react-native-seoul/kakao-login 사용
      // 현재는 시뮬레이션
      Alert.alert(
        '카카오 로그인',
        '카카오 로그인을 구현하려면 카카오 개발자 콘솔에서 앱을 등록하고 ' +
        '@react-native-seoul/kakao-login 라이브러리를 설정해야 합니다.\n\n' +
        'config.ts 파일에서 KAKAO_CONFIG.NATIVE_APP_KEY를 설정해주세요.',
        [{ text: '확인' }]
      );
      
      // 실제 코드:
      // import { login as kakaoSdkLogin } from '@react-native-seoul/kakao-login';
      // const result = await kakaoSdkLogin();
      // await kakaoLogin(result.accessToken);
      
    } catch (error: any) {
      Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 구글 로그인
   */
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // 실제 구현에서는 @react-native-google-signin/google-signin 사용
      Alert.alert(
        '구글 로그인',
        '구글 로그인을 구현하려면 Google Cloud Console에서 OAuth 클라이언트를 생성하고 ' +
        '@react-native-google-signin/google-signin 라이브러리를 설정해야 합니다.\n\n' +
        'config.ts 파일에서 GOOGLE_CONFIG를 설정해주세요.',
        [{ text: '확인' }]
      );
      
      // 실제 코드:
      // import { GoogleSignin } from '@react-native-google-signin/google-signin';
      // await GoogleSignin.hasPlayServices();
      // const { idToken } = await GoogleSignin.signIn();
      // await googleLogin(idToken);
      
    } catch (error: any) {
      Alert.alert('로그인 실패', '구글 로그인 중 오류가 발생했습니다.');
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
          {/* ======== 로고 영역 ======== */}
          <View style={styles.logoSection}>
            {/* 장식 */}
            <View style={styles.decorations}>
              <Text style={styles.deco1}>✨</Text>
              <Text style={styles.deco2}>💗</Text>
              <Text style={styles.deco3}>⭐</Text>
            </View>

            {/* 캐릭터 */}
            <View style={styles.characterContainer}>
              <View style={styles.phoneFrame}>
                <Text style={styles.phoneHeart}>💕</Text>
              </View>
              <View style={styles.characters}>
                <Text style={styles.characterEmoji}>🐶</Text>
                <Text style={styles.characterEmoji}>🐱</Text>
              </View>
            </View>

            {/* 앱 이름 */}
            <View style={styles.titleRow}>
              <Text style={styles.titleHappy}>Happy</Text>
              <Text style={styles.titleAnd}> & </Text>
              <Text style={styles.titleNavi}>Navi</Text>
            </View>
          </View>

          {/* ======== 로그인 폼 ======== */}
          <View style={styles.formSection}>
            {/* 이메일 입력 */}
            <Input
              label="이메일"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={errors.email}
            />

            {/* 비밀번호 입력 */}
            <Input
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showPasswordToggle
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {/* 로그인 버튼 */}
            <Button
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* 구분선 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 소셜 로그인 버튼들 */}
            <View style={styles.socialButtons}>
              {/* 카카오 로그인 */}
              <Button
                title="카카오로 시작하기"
                onPress={handleKakaoLogin}
                variant="kakao"
                fullWidth
                leftIcon={
                  <View style={styles.kakaoIcon}>
                    <Text style={styles.kakaoIconText}>💬</Text>
                  </View>
                }
                style={styles.socialButton}
              />

              {/* 구글 로그인 */}
              <Button
                title="구글로 시작하기"
                onPress={handleGoogleLogin}
                variant="google"
                fullWidth
                leftIcon={
                  <Text style={styles.googleIcon}>G</Text>
                }
                style={styles.socialButton}
              />
            </View>
          </View>

          {/* ======== 회원가입 링크 ======== */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>아직 계정이 없으신가요?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>회원가입</Text>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // 로고 영역
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  decorations: {
    position: 'absolute',
    width: '100%',
    height: 150,
  },
  deco1: {
    position: 'absolute',
    top: 0,
    left: 20,
    fontSize: 20,
    opacity: 0.7,
  },
  deco2: {
    position: 'absolute',
    top: 30,
    right: 30,
    fontSize: 18,
    opacity: 0.7,
  },
  deco3: {
    position: 'absolute',
    top: 60,
    left: 50,
    fontSize: 16,
    opacity: 0.7,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  phoneFrame: {
    width: 60,
    height: 80,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -20,
    zIndex: 1,
  },
  phoneHeart: {
    fontSize: 24,
  },
  characters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  characterEmoji: {
    fontSize: 48,
    marginHorizontal: -8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  titleHappy: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#E8C07D',
  },
  titleAnd: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  titleNavi: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#E8C07D',
  },

  // 폼 영역
  formSection: {
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textHint,
  },
  socialButtons: {
    gap: Spacing.md,
  },
  socialButton: {
    marginBottom: Spacing.sm,
  },
  kakaoIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kakaoIconText: {
    fontSize: 16,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: '#4285F4',
  },

  // 회원가입 링크
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  signupText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.xs,
  },
});

export default LoginScreen;
