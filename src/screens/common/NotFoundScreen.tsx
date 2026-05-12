/**
 * =========================================
 * 404 화면 (NotFoundScreen.tsx)
 * =========================================
 * 260509 신규: 잘못된 경로 / 삭제된 리소스 접근 시 404 화면
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const NotFoundScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const customMessage = route?.params?.message;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.bigEmoji}>🐾</Text>
          <View style={styles.notFoundBadge}>
            <Text style={styles.notFoundText}>404</Text>
          </View>
        </View>

        <Text style={styles.title}>여기는 어디일까요?</Text>
        <Text style={styles.message}>
          {customMessage || '찾으시는 페이지가 사라졌거나\n잘못된 경로예요.'}
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeMain')}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>이전 페이지로</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            // 루트로 리셋
            try {
              navigation.reset({ index: 0, routes: [{ name: 'HomeMain' }] });
            } catch {
              navigation.navigate('HomeMain');
            }
          }}
        >
          <Text style={styles.secondaryBtnText}>홈으로 가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  content:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  iconWrap: { width: 140, height: 140, marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 80 },
  notFoundBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#FF6B6B', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 16, borderWidth: 3, borderColor: '#FDFBF7',
  },
  notFoundText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  title: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32', marginBottom: 12 },
  message: { fontSize: 14, color: '#A0938A', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF6B6B', paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 16, marginBottom: 12,
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  secondaryBtn:     { paddingVertical: 12, paddingHorizontal: 24 },
  secondaryBtnText: { color: '#A0938A', fontSize: 14, textDecorationLine: 'underline' },
});

export default NotFoundScreen;
