/**
 * =========================================
 * 공통 입력 필드 컴포넌트 (Input.tsx)
 * =========================================
 * 
 * 앱 전체에서 사용되는 일관된 스타일의 입력 필드입니다.
 * 
 * 기능:
 * - 라벨 표시
 * - 에러 메시지 표시
 * - 비밀번호 숨김/표시 토글
 * - 좌/우측 아이콘
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
  ComponentSize,
} from '../../constants/typography';

// ============================================
// 타입 정의
// ============================================

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 좌측 아이콘 이름 (Ionicons) */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** 우측 아이콘 이름 (Ionicons) */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** 우측 아이콘 클릭 핸들러 */
  onRightIconPress?: () => void;
  /** 컨테이너 추가 스타일 */
  containerStyle?: ViewStyle;
  /** 입력 필드 추가 스타일 */
  inputStyle?: TextStyle;
  /** 비밀번호 토글 표시 여부 */
  showPasswordToggle?: boolean;
}

// ============================================
// 컴포넌트
// ============================================

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  showPasswordToggle = false,
  secureTextEntry,
  ...textInputProps
}) => {
  // 비밀번호 표시 상태
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 실제 secureTextEntry 값 (토글 적용)
  const actualSecureTextEntry = showPasswordToggle
    ? secureTextEntry && !isPasswordVisible
    : secureTextEntry;

  // 포커스 상태
  const [isFocused, setIsFocused] = useState(false);

  // 동적 스타일
  const inputContainerStyle: ViewStyle = {
    borderColor: error
      ? Colors.error
      : isFocused
      ? Colors.primary
      : Colors.border,
    backgroundColor: textInputProps.editable === false
      ? Colors.borderLight
      : Colors.surface,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 라벨 */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {/* 입력 필드 컨테이너 */}
      <View style={[styles.inputContainer, inputContainerStyle]}>
        {/* 좌측 아이콘 */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={Colors.textHint}
            style={styles.leftIcon}
          />
        )}

        {/* 텍스트 입력 */}
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          secureTextEntry={actualSecureTextEntry}
          placeholderTextColor={Colors.textHint}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />

        {/* 비밀번호 토글 버튼 */}
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textHint}
            />
          </TouchableOpacity>
        )}

        {/* 우측 아이콘 */}
        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.textHint}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 에러 메시지 */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: ComponentSize.inputHeight.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    height: '100%',
  },
  inputWithLeftIcon: {
    marginLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    marginRight: Spacing.xs,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIconButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default Input;
