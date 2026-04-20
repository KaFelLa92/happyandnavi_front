/**
 * =========================================
 * 홈 화면 (HomeScreen.tsx)
 * =========================================
 * 
 * 메인 허브 화면입니다.
 * 추억일기와 약속일기 중 선택할 수 있습니다.
 * 우측 상단에 설정(톱니바퀴) 아이콘이 있습니다.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '@constants/typography';
import { useAuth } from '@context/AuthContext';

const { width } = Dimensions.get('window');

// ============================================
// 컴포넌트
// ============================================

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      {/* ======== 헤더 ======== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>안녕하세요! 👋</Text>
          <Text style={styles.petName}>{user?.userName || '반려동물'}의 보호자님</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ======== 메인 캐릭터 영역 ======== */}
        <View style={styles.characterSection}>
          {/* 장식 */}
          <Text style={styles.deco1}>💗</Text>
          <Text style={styles.deco2}>⭐</Text>
          <Text style={styles.deco3}>✨</Text>

          {/* 노트 배경 */}
          <View style={styles.noteBackground}>
            {/* 스프링 바인딩 */}
            <View style={styles.springBinding}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.springRing} />
              ))}
            </View>

            {/* 캐릭터들 */}
            <View style={styles.characters}>
              <Text style={styles.characterEmoji}>🐶</Text>
              <Text style={styles.characterEmoji}>🐱</Text>
              <Text style={styles.characterEmoji}>🐩</Text>
              <Text style={styles.characterEmoji}>😺</Text>
            </View>

            {/* 다이어리 선택 버튼 */}
            <View style={styles.diaryButtons}>
              {/* 추억일기 버튼 */}
              <TouchableOpacity
                style={[styles.diaryButton, styles.memoryButton]}
                onPress={() => navigation.navigate('Memory')}
                activeOpacity={0.8}
              >
                <Text style={styles.diaryButtonText}>추억일기</Text>
              </TouchableOpacity>

              {/* 약속일기 버튼 */}
              <TouchableOpacity
                style={[styles.diaryButton, styles.promiseButton]}
                onPress={() => navigation.navigate('Promise')}
                activeOpacity={0.8}
              >
                <Text style={styles.diaryButtonText}>약속일기</Text>
              </TouchableOpacity>
            </View>

            {/* 노트 라인 */}
            <View style={styles.noteLines}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.noteLine} />
              ))}
            </View>

            {/* 작은 장식들 */}
            <View style={styles.noteDecorations}>
              <Text style={styles.noteDeco}>🐾</Text>
              <Text style={styles.noteDeco}>💕</Text>
              <Text style={styles.noteDeco}>📖</Text>
            </View>
          </View>
        </View>

        {/* ======== 하단 장식 ======== */}
        <View style={styles.bottomSection}>
          <View style={styles.petBowls}>
            <Text style={styles.bowlEmoji}>🥣</Text>
            <Text style={styles.bowlEmoji}>🍖</Text>
          </View>
        </View>
      </ScrollView>
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

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  petName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },

  // 콘텐츠
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // 캐릭터 섹션
  characterSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    position: 'relative',
  },
  deco1: {
    position: 'absolute',
    top: -10,
    right: 40,
    fontSize: 24,
    opacity: 0.8,
  },
  deco2: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 18,
    opacity: 0.7,
  },
  deco3: {
    position: 'absolute',
    top: 40,
    right: 50,
    fontSize: 14,
    opacity: 0.6,
  },

  // 노트 배경
  noteBackground: {
    width: width - Spacing.lg * 2,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    alignItems: 'center',
    ...Shadow.md,
  },
  springBinding: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 30,
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.xl,
  },
  springRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },

  // 캐릭터들
  characters: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    marginLeft: 20,
  },
  characterEmoji: {
    fontSize: 36,
    marginHorizontal: -4,
  },

  // 다이어리 버튼
  diaryButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginLeft: 20,
  },
  diaryButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  memoryButton: {
    backgroundColor: Colors.memoryPrimary,
  },
  promiseButton: {
    backgroundColor: Colors.promisePrimary,
  },
  diaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  // 노트 라인
  noteLines: {
    width: '70%',
    marginLeft: 20,
    marginBottom: Spacing.lg,
  },
  noteLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
    opacity: 0.5,
  },

  // 노트 장식
  noteDecorations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginLeft: 20,
  },
  noteDeco: {
    fontSize: 20,
    opacity: 0.6,
  },

  // 하단 섹션
  bottomSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  petBowls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bowlEmoji: {
    fontSize: 40,
  },
});

export default HomeScreen;
