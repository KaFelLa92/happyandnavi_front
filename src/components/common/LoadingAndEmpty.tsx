/**
 * =========================================
 * 로딩 및 빈 상태 컴포넌트 (LoadingAndEmpty.tsx)
 * =========================================
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, Spacing } from '../../constants/typography';

// ============================================
// 로딩 스피너 컴포넌트
// ============================================

interface LoadingSpinnerProps {
  /** 로딩 메시지 */
  message?: string;
  /** 크기 */
  size?: 'small' | 'large';
  /** 스타일 */
  style?: ViewStyle;
  /** 전체 화면 여부 */
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  size = 'large',
  style,
  fullScreen = false,
}) => {
  return (
    <View style={[
      styles.loadingContainer,
      fullScreen && styles.fullScreen,
      style,
    ]}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message && (
        <Text style={styles.loadingText}>{message}</Text>
      )}
    </View>
  );
};

// ============================================
// 빈 상태 컴포넌트
// ============================================

interface EmptyStateProps {
  /** 이모지 또는 아이콘 */
  emoji?: string;
  /** 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 액션 버튼 */
  action?: React.ReactNode;
  /** 스타일 */
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title,
  description,
  action,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && (
        <Text style={styles.emptyDescription}>{description}</Text>
      )}
      {action && (
        <View style={styles.emptyAction}>{action}</View>
      )}
    </View>
  );
};

// ============================================
// 에러 상태 컴포넌트
// ============================================

interface ErrorStateProps {
  /** 에러 메시지 */
  message?: string;
  /** 재시도 버튼 */
  onRetry?: () => void;
  /** 스타일 */
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = '오류가 발생했습니다.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyEmoji}>😢</Text>
      <Text style={styles.emptyTitle}>{message}</Text>
      {onRetry && (
        <Text 
          style={styles.retryText}
          onPress={onRetry}
        >
          다시 시도하기
        </Text>
      )}
    </View>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: Spacing.lg,
  },
  retryText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
