/**
 * =========================================
 * 공통 버튼 컴포넌트 (Button.tsx)
 * =========================================
 * 
 * 앱 전체에서 사용되는 일관된 스타일의 버튼 컴포넌트입니다.
 * 
 * 지원 변형:
 * - primary: 메인 액션 버튼 (민트색)
 * - secondary: 보조 버튼 (연한 색)
 * - outline: 외곽선만 있는 버튼
 * - memory: 추억일기 테마 (노랑)
 * - promise: 약속일기 테마 (분홍)
 * - kakao: 카카오 로그인 버튼
 * - google: 구글 로그인 버튼
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import {
  FontSize,
  FontWeight,
  BorderRadius,
  ComponentSize,
  Shadow,
} from '../../constants/typography';

// ============================================
// 타입 정의
// ============================================

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'memory'
  | 'promise'
  | 'kakao'
  | 'google';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** 버튼 텍스트 */
  title: string;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 버튼 변형 */
  variant?: ButtonVariant;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 전체 너비 여부 */
  fullWidth?: boolean;
  /** 좌측 아이콘 */
  leftIcon?: React.ReactNode;
  /** 우측 아이콘 */
  rightIcon?: React.ReactNode;
  /** 추가 스타일 */
  style?: ViewStyle;
  /** 텍스트 추가 스타일 */
  textStyle?: TextStyle;
}

// ============================================
// 스타일 맵
// ============================================

/**
 * 변형별 배경색
 */
const variantBackgroundColors: Record<ButtonVariant, string> = {
  primary: Colors.primary,
  secondary: Colors.surfaceLight,
  outline: 'transparent',
  memory: Colors.memoryPrimary,
  promise: Colors.promisePrimary,
  kakao: Colors.social.kakao,
  google: Colors.social.google,
};

/**
 * 변형별 텍스트색
 */
const variantTextColors: Record<ButtonVariant, string> = {
  primary: Colors.textLight,
  secondary: Colors.textPrimary,
  outline: Colors.textPrimary,
  memory: Colors.textPrimary,
  promise: Colors.textPrimary,
  kakao: Colors.social.kakaoText,
  google: Colors.social.googleText,
};

/**
 * 변형별 테두리색
 */
const variantBorderColors: Record<ButtonVariant, string | undefined> = {
  primary: undefined,
  secondary: Colors.border,
  outline: Colors.border,
  memory: Colors.border,
  promise: Colors.border,
  kakao: undefined,
  google: Colors.social.googleBorder,
};

/**
 * 크기별 높이
 */
const sizeHeights: Record<ButtonSize, number> = {
  sm: ComponentSize.buttonHeight.sm,
  md: ComponentSize.buttonHeight.md,
  lg: ComponentSize.buttonHeight.lg,
};

/**
 * 크기별 폰트 크기
 */
const sizeFontSizes: Record<ButtonSize, number> = {
  sm: FontSize.sm,
  md: FontSize.md,
  lg: FontSize.lg,
};

// ============================================
// 컴포넌트
// ============================================

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  // 비활성화 상태 (disabled 또는 loading)
  const isDisabled = disabled || loading;

  // 동적 스타일 계산
  const buttonStyle: ViewStyle = {
    backgroundColor: isDisabled
      ? Colors.borderLight
      : variantBackgroundColors[variant],
    height: sizeHeights[size],
    borderColor: variantBorderColors[variant],
    borderWidth: variantBorderColors[variant] ? 1 : 0,
    ...(fullWidth && { width: '100%' }),
  };

  const textColorStyle: TextStyle = {
    color: isDisabled ? Colors.textDisabled : variantTextColors[variant],
    fontSize: sizeFontSizes[size],
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variantTextColors[variant]}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[styles.text, textColorStyle, textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
