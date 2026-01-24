/**
 * =========================================
 * 공통 카드 컴포넌트 (Card.tsx)
 * =========================================
 * 
 * 콘텐츠를 감싸는 카드 형태의 컨테이너입니다.
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import {
  BorderRadius,
  Spacing,
  Shadow,
} from '../../constants/typography';

// ============================================
// 타입 정의
// ============================================

interface CardProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 클릭 핸들러 (있으면 터치 가능) */
  onPress?: () => void;
  /** 추가 스타일 */
  style?: ViewStyle;
  /** 패딩 없음 */
  noPadding?: boolean;
  /** 그림자 크기 */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** 테두리 표시 */
  bordered?: boolean;
}

// ============================================
// 컴포넌트
// ============================================

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  noPadding = false,
  shadow = 'sm',
  bordered = false,
}) => {
  // 그림자 스타일
  const shadowStyle = shadow !== 'none' ? Shadow[shadow] : {};

  // 공통 스타일
  const cardStyle: ViewStyle = {
    ...styles.card,
    ...shadowStyle,
    ...(noPadding && { padding: 0 }),
    ...(bordered && styles.bordered),
  };

  // 터치 가능한 경우
  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // 일반 카드
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

// ============================================
// 스타일
// ============================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default Card;
