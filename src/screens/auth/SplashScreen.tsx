/**
 * =========================================
 * 스플래시 화면 (SplashScreen.tsx)
 * =========================================
 * 
 * 앱 시작 시 표시되는 로딩 화면입니다.
 * "Happy & Navi" 로고와 귀여운 캐릭터가 표시됩니다.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { FontSize, FontWeight, Spacing } from '../../../constants/typography';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  /** 스플래시 완료 후 콜백 */
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // 애니메이션 값
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // 페이드인 + 스케일 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2초 후 완료 콜백
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* 배경 장식 - 별과 하트 */}
      <View style={styles.decorations}>
        <Text style={[styles.decoration, styles.star1]}>⭐</Text>
        <Text style={[styles.decoration, styles.heart1]}>💗</Text>
        <Text style={[styles.decoration, styles.star2]}>✨</Text>
        <Text style={[styles.decoration, styles.heart2]}>💕</Text>
      </View>

      {/* 메인 로고 영역 */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* PET DIARY 배너 */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🐾 PET DIARY 🐾</Text>
        </View>

        {/* 캐릭터 이미지 영역 */}
        <View style={styles.characterContainer}>
          {/* 해피 (강아지) */}
          <View style={styles.character}>
            <Text style={styles.characterEmoji}>🐶</Text>
            <View style={styles.characterBody}>
              <Text style={styles.happyName}>Happy</Text>
            </View>
          </View>

          {/* 나비 (고양이) */}
          <View style={styles.character}>
            <Text style={styles.characterEmoji}>🐱</Text>
            <View style={styles.characterBody}>
              <Text style={styles.naviName}>Navi</Text>
            </View>
          </View>
        </View>

        {/* 앱 이름 */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleHappy}>Happy</Text>
          <Text style={styles.titleAnd}>&</Text>
          <Text style={styles.titleNavi}>Navi</Text>
        </View>

        {/* 부제목 */}
        <Text style={styles.subtitle}>반려동물과의 소중한 일상</Text>
      </Animated.View>

      {/* 로딩 인디케이터 */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
        <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
  },
  decoration: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.6,
  },
  star1: {
    top: '15%',
    left: '15%',
  },
  heart1: {
    top: '20%',
    right: '20%',
  },
  star2: {
    bottom: '25%',
    left: '20%',
  },
  heart2: {
    bottom: '30%',
    right: '15%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  banner: {
    backgroundColor: Colors.memoryPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  bannerText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  characterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  character: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  characterEmoji: {
    fontSize: 60,
    marginBottom: -10,
  },
  characterBody: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  happyName: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  naviName: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleHappy: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.memoryPrimary,
  },
  titleAnd: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginHorizontal: Spacing.xs,
  },
  titleNavi: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.promisePrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
    opacity: 0.3,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
});

export default SplashScreen;
