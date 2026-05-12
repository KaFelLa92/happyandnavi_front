/**
 * =========================================
 * 로딩 화면 (LoadingScreen.tsx)
 * =========================================
 * 260509 신규: 페이지 전환 / 인증 확인 중 깜빡임 방지용 로딩 화면
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
}

export const LoadingScreen: React.FC<Props> = ({ message = '불러오는 중...' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.ring} />
        </Animated.View>
        <Animated.View style={[styles.heartBg, { transform: [{ scale: pulseValue }] }]}>
          <Ionicons name="paw" size={32} color="#FF6B6B" />
        </Animated.View>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>🐾 Happy & Navi 🐾</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FDFBF7',
    justifyContent: 'center', alignItems: 'center',
  },
  iconWrap: {
    width: 100, height: 100, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, borderColor: '#F0EBE1',
    borderTopColor: '#FF6B6B', borderRightColor: '#FFC85C',
  },
  heartBg: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FFFDF9',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  message: { fontSize: 15, color: '#4A3B32', fontWeight: '600', marginBottom: 6 },
  subMessage: { fontSize: 12, color: '#A0938A' },
});

export default LoadingScreen;
