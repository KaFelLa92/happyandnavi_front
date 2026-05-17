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
 *
 * 소셜 로그인 버튼 브랜드 정책 준수 현황:
 *  ✅ 카카오  — #FEE500 배경 + 공식 말풍선 심볼(SVG) + #000000 텍스트
 *  ✅ 구글    — 흰 배경 + 4색 G 로고(SVG) + #1F1F1F 텍스트 + #747775 테두리
 *  ✅ 네이버  — #03A94D 배경 + SVG N 심볼 + 흰 텍스트
 *  ✅ 애플    — expo-apple-authentication 공식 버튼 사용 (App Store 심사 필수 요건)
 *
 * 버튼 레이아웃 — 3-slot 구조로 아이콘·텍스트 오와열 보장:
 *  ┌──────────┬───────────────────────────┬──────────┐
 *  │ iconSlot │       labelText           │  spacer  │
 *  │  48 px   │       flex: 1             │  48 px   │
 *  └──────────┴───────────────────────────┴──────────┘
 *  → spacer = iconSlot 동일 너비  →  텍스트가 '남은 공간의 정중앙'에 위치
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
import { Colors } from '@constants/colors';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '@constants/typography';
import { Button, Input } from '@components/common';
import { useAuth } from '@context/AuthContext';
import { AuthStackParamList } from '@types';
import { login as kakaoSdkLogin } from '@react-native-seoul/kakao-login';
import { kakaoLogin } from '@services/authService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { naverLogin } from '@services/authService';
import * as AppleAuthentication from 'expo-apple-authentication';
import { appleLogin } from '@services/authService';

// 공식 브랜드 아이콘 (SVG)
import { KakaoIcon, GoogleGIcon, NaverNIcon } from '@components/common/SocialLoginIcons';

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
// 구글 로그인 초기화
// ============================================
GoogleSignin.configure({
  webClientId: '412129903711-9bmd285678bmb8fsunvsot12sb2une9o.apps.googleusercontent.com', // 👈 여기에 꼭 본인의 ID를 넣으세요!
});

// ============================================
// 네이버 로그인 초기화
// ============================================
NaverLogin.initialize({
  appName: 'HappyAndNavi',
  consumerKey: 'q8TeRQCF2MORLqt9Rnb_', // 👈 필수
  consumerSecret: 'iWo9TPuvsh', // 👈 필수
  serviceUrlScheme: 'happyandnavi', // iOS용 스킴 (app.json에 등록한 스킴)
  disableNaverAppAuthIOS: true, // iOS 네이버 앱이 없을 때 웹뷰로 로그인하도록 설정
});

// ============================================
// 브랜드 상수 (정책 변경 시 이 블록만 수정)
// ============================================

/** 각 플랫폼 공식 브랜드 색상 */
const BRAND = {
  kakao: {
    bg: '#FEE500',                 // 카카오 공식 필수 배경색
    text: 'rgba(0, 0, 0, 0.85)',   // 레이블: 검정색(#000000)의 85% 불투명도
  },
  google: {
    bg: '#FFFFFF',
    border: '#747775', // 구글 공식 테두리색
    text: '#1F1F1F',   // 구글 공식 다크 텍스트
  },
  naver: {
    bg: '#03A94D',     // 네이버 공식 필수 배경색
    text: '#FFFFFF',
  },
} as const;

/** 소셜 버튼 공통 치수 */
const BTN = {
  height: 50,
  borderRadius: 8,
  iconSlot: 50,        // 아이콘 슬롯 & 스페이서 너비 (반드시 동일하게 유지)
  fontSize: 15,
  fontWeight: '600' as const,
} as const;

// ============================================
// 컴포넌트
// ============================================

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, kakaoLogin: ctxKakaoLogin, googleLogin } = useAuth();

  // ----------------------------------------
  // 유효성 검사
  // ----------------------------------------

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------------------
  // 핸들러
  // ----------------------------------------

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const { accessToken } = await kakaoSdkLogin();
      await ctxKakaoLogin(accessToken);
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('구글 토큰을 가져오지 못했습니다.');
      await googleLogin(idToken);
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    try {
      setIsLoading(true);
      const { successResponse, failureResponse } = await NaverLogin.login();
      if (failureResponse) throw new Error(failureResponse.message || '네이버 로그인에 실패했습니다.');
      if (!successResponse?.accessToken) throw new Error('네이버 토큰을 가져오지 못했습니다.');
      await naverLogin(successResponse.accessToken);
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      if (!credential.identityToken) throw new Error('애플 토큰을 가져오지 못했습니다.');
      await appleLogin(credential.identityToken);
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('로그인 실패', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 렌더링
  // ----------------------------------------

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
            <View style={styles.decorations}>
              <Text style={styles.deco1}>✨</Text>
              <Text style={styles.deco2}>💗</Text>
              <Text style={styles.deco3}>⭐</Text>
            </View>
            <View style={styles.characterContainer}>
              <View style={styles.phoneFrame}>
                <Text style={styles.phoneHeart}>💕</Text>
              </View>
              <View style={styles.characters}>
                <Text style={styles.characterEmoji}>🐶</Text>
                <Text style={styles.characterEmoji}>🐱</Text>
              </View>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleHappy}>Happy</Text>
              <Text style={styles.titleAnd}> & </Text>
              <Text style={styles.titleNavi}>Navi</Text>
            </View>
          </View>

          {/* ======== 로그인 폼 ======== */}
          <View style={styles.formSection}>
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
            <Button
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* 로그인 버튼 바로 아래에 추가 */}
          <View style={styles.findContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
              <Text style={styles.findText}>이메일 찾기</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.findText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>

            {/* 구분선 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ======== 소셜 로그인 버튼 ======== */}
            <View style={styles.socialButtons}>

              {/* ─── 카카오 ──────────────────────────────────────────────
               *  정책: developers.kakao.com/docs/latest/ko/kakaologin/design-guide
               *  ✅ 배경 #FEE500  ✅ 공식 말풍선 심볼 SVG  ✅ 텍스트 #000000
               *  레이블: "카카오 로그인" — 브랜드명 포함 필수
               */}
              <TouchableOpacity
                onPress={handleKakaoLogin}
                style={[styles.socialBtn, { backgroundColor: BRAND.kakao.bg, borderRadius: 12, }]}
                activeOpacity={0.8}
                disabled={isLoading}
                accessibilityLabel="카카오 로그인"
                accessibilityRole="button"
              >
                <View style={styles.iconSlot}>
                  <KakaoIcon size={26} />
                </View>
                <Text style={[styles.socialBtnText, { color: BRAND.kakao.text, fontSize: 15 }]}>
                  카카오 로그인
                </Text>
                <View style={styles.iconSlot} />
              </TouchableOpacity>

              {/* ─── 구글 ────────────────────────────────────────────────
               *  정책: developers.google.com/identity/branding-guidelines
               *  ✅ 흰 배경 + #747775 테두리  ✅ 4색 G 로고 SVG  ✅ 텍스트 #1F1F1F
               *  레이블: "Sign in with Google" or Google로 로그인 — 대문자 G 필수, 단색 로고 사용 불가
               */}
              <TouchableOpacity
              onPress={handleGoogleLogin}
              style={[
                styles.socialBtn,
                {
                  backgroundColor: BRAND.google.bg,
                  borderWidth: 1,
                  borderColor: BRAND.google.border,
                },
              ]}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.iconSlot}>
                <GoogleGIcon size={20} />
              </View>
              {/* Roboto 폰트 적용 */}
              <Text style={[
                styles.socialBtnText,
                {
                  color: BRAND.google.text,
                  fontFamily: 'Roboto-Medium', // App.tsx에서 로드한 폰트 이름
                  fontSize: 14, // 가이드라인 권장 사이즈
                  lineHeight: 20,
                }
              ]}>
                Google로 로그인
              </Text>
              <View style={styles.iconSlot} />
            </TouchableOpacity>

              {/* ─── 네이버 ──────────────────────────────────────────────
               *  정책: developers.naver.com/docs/login/bi/bi.md
               *  ✅ 배경 #03A94D  ✅ SVG N 심볼(흰색)  ✅ 텍스트 흰색
               *  레이블: "네이버 로그인" — 브랜드명 포함 필수
               */}
              <TouchableOpacity
                onPress={handleNaverLogin}
                style={[styles.socialBtn, { backgroundColor: BRAND.naver.bg }]}
                activeOpacity={0.8}
                disabled={isLoading}
                accessibilityLabel="네이버 로그인"
                accessibilityRole="button"
              >
                <View style={styles.iconSlot}>
                  <NaverNIcon size={16} />
                </View>
                <Text style={[styles.socialBtnText, { color: BRAND.naver.text, fontSize: 16 }]}>
                  네이버 로그인
                </Text>
                <View style={styles.iconSlot} />
              </TouchableOpacity>

              {/* ─── 애플 (iOS 전용) ────────────────────────────────────
               *  정책: App Store 심사 필수 — 공식 컴포넌트 외 커스텀 불가
               *  ✅ AppleAuthenticationButton 사용
               *  ✅ cornerRadius(8) → 타 버튼과 시각적 통일
               *  ✅ height(48px)    → 타 버튼과 높이 통일
               */}
              {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={BTN.borderRadius}
                  style={styles.appleBtn}
                  onPress={handleAppleLogin}
                />
              )}
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
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  findContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,    // 로그인 버튼과의 간격
    marginBottom: Spacing.sm, // 구분선과의 간격
  },
  findText: {
    fontSize: 14,
    color: '#A0938A', // 'Happy & Navi'의 차분한 보조 텍스트 색상
    fontFamily: FontFamily.diary, // 앱의 감성적인 다이어리 폰트 적용 가능
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1CCC5',
    marginHorizontal: 15, // 좌우 여백을 주어 버튼 간 간격 확보
  },

  // 로고 영역
  logoSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  decorations: { position: 'absolute', width: '100%', height: 150 },
  deco1: { position: 'absolute', top: 0,  left: 20,  fontSize: 20, opacity: 0.7 },
  deco2: { position: 'absolute', top: 30, right: 30, fontSize: 18, opacity: 0.7 },
  deco3: { position: 'absolute', top: 60, left: 50,  fontSize: 16, opacity: 0.7 },
  characterContainer: { alignItems: 'center', marginBottom: Spacing.md },
  phoneFrame: {
    width: 60, height: 80,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: -20, zIndex: 1,
  },
  phoneHeart: { fontSize: 24 },
  characters: { flexDirection: 'row', alignItems: 'flex-end' },
  characterEmoji: { fontSize: 48, marginHorizontal: -8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  titleHappy: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#E8C07D' },
  titleAnd:   { fontSize: FontSize.xl,  fontWeight: FontWeight.bold, color: Colors.primary },
  titleNavi:  { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#E8C07D' },

  // 폼 영역
  formSection: { marginBottom: Spacing.xl },
  loginButton: { marginTop: Spacing.md },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.md, fontSize: FontSize.sm, color: Colors.textHint },

  // 소셜 버튼 — 3-slot 레이아웃
  socialButtons: { gap: Spacing.sm },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: BTN.height,
    borderRadius: BTN.borderRadius,
    overflow: 'hidden',
  },
  iconSlot: {
    width: BTN.iconSlot,
    height: BTN.height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
  },
  socialBtnText: {
    flex: 1,
    textAlign: 'center',
    fontSize: BTN.fontSize,
    fontWeight: BTN.fontWeight,
    letterSpacing: -0.2,
  },

  // 애플 버튼 (공식 컴포넌트 치수 맞춤)
  appleBtn: {
    width: '100%',
    height: BTN.height,
  },

  // 회원가입
  signupSection: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 'auto', paddingTop: Spacing.lg,
  },
  signupText: { fontSize: FontSize.md, color: Colors.textSecondary },
  signupLink: {
    fontSize: FontSize.md, color: Colors.primary,
    fontWeight: FontWeight.semibold, marginLeft: Spacing.xs,
  },
});

export default LoginScreen;
