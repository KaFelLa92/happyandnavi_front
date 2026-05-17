/**
 * =========================================
 * 추억일기 수정 화면 (MemoryEditScreen.tsx)
 * =========================================
 *
 * 추억일기를 수정하는 화면입니다.
 */

 import { API_BASE_URL } from '../../constants/config';
 import React, { useState } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   ScrollView, Alert, ActivityIndicator, Platform,
   KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback,
   Image
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontFamily, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
 import { Input } from '@components/common';
 import { updateMemory } from '@services/memoryService';
 import { Memory } from '@types';

const WEATHER_OPTIONS = [
  { code: 1, label: '맑음', emoji: '☀️' }, { code: 2, label: '흐림', emoji: '☁️' },
  { code: 3, label: '비', emoji: '🌧️' }, { code: 4, label: '눈', emoji: '❄️' }, { code: 5, label: '바람', emoji: '💨' },
];
const MOOD_OPTIONS = [
  { code: 1, label: '매우 좋음', emoji: '😄' }, { code: 2, label: '좋음', emoji: '🙂' },
  { code: 3, label: '보통', emoji: '😐' }, { code: 4, label: '나쁨', emoji: '😟' }, { code: 5, label: '매우 나쁨', emoji: '😢' },
];

export const MemoryEditScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const original: Memory = route.params.memory;

  const [comment, setComment] = useState(original.memoryComment || '');
  const [weather, setWeather] = useState<number | null>(original.memoryWeather ?? null);
  const [userMood, setUserMood] = useState<number | null>(original.userMood ?? null);
  const [petMood,  setPetMood]  = useState<number | null>(original.petMood ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http') && !path.includes('localhost')) return path;
    const match = path.match(/(\/profile\/.*|\/memory.*)/);
    if (match && match[1]) return `${API_BASE_URL}/uploads${match[1]}`;
    return path;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateMemory(original.memoryId, {
        memoryComment: comment, memoryWeather: weather ?? undefined,
        userMood: userMood ?? undefined, petMood: petMood ?? undefined,
      });
      Alert.alert('완료', '수정되었습니다.', [
              { text: '확인', onPress: () => navigation.navigate('MemoryCalendar') }
            ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '수정 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>추억 수정하기</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#FF6B6B" /> : <Text style={styles.saveText}>완료</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 기존 이미지 고정 표시 (수정 불가 안내) */}
        <View style={styles.mediaCard}>
          <Image source={{ uri: getImageUrl(original.memoryUrl) }} style={styles.fixedImage} />
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>사진/영상은 수정할 수 없어요</Text></View>
        </View>

        <Text style={styles.sectionLabel}>날씨와 기분 수정</Text>
        <View style={styles.chipRow}>
          {WEATHER_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.code} style={[styles.chip, weather === opt.code && styles.chipSelected]} onPress={() => setWeather(opt.code)}>
              <Text style={styles.chipEmoji}>{opt.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.moodRow}>
          <View style={styles.moodGroup}>
            <Text style={styles.moodSubLabel}>내 기분</Text>
            <View style={styles.chipRowSmall}>
              {MOOD_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.code} style={[styles.moodChip, userMood === opt.code && styles.moodChipSelected]} onPress={() => setUserMood(opt.code)}>
                  <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.moodGroup}>
            <Text style={styles.moodSubLabel}>반려동물</Text>
            <View style={styles.chipRowSmall}>
              {MOOD_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.code} style={[styles.moodChip, petMood === opt.code && styles.moodChipSelected]} onPress={() => setPetMood(opt.code)}>
                  <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Input label="내용 수정" value={comment} onChangeText={setComment} multiline numberOfLines={5} style={styles.memoInput} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: '#4A3B32' },
  saveText: { fontFamily: FontFamily.diary, fontSize: 22, color: '#FF6B6B' },
  scrollContent: { padding: Spacing.lg },

  mediaCard: { borderRadius: 16, overflow: 'hidden', marginBottom: Spacing.xl, borderWidth: 1, borderColor: '#F0EBE1' },
  fixedImage: { width: '100%', height: 200, opacity: 0.8 },
  infoBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(74, 59, 50, 0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  infoBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#A0938A', marginBottom: 12 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1' },
  chipSelected: { backgroundColor: '#FFFBF0', borderColor: '#FFC85C' },
  chipEmoji: { fontSize: 18 },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  moodGroup: { gap: 6 },
  moodSubLabel: { fontSize: 12, color: '#A0938A' },
  chipRowSmall: { flexDirection: 'row', gap: 4 },
  moodChip: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1' },
  moodChipSelected: { backgroundColor: '#FFFBF0', borderColor: '#FFC85C' },
  moodEmoji: { fontSize: 16 },

  memoInput: { fontFamily: FontFamily.diary, fontSize: 20, minHeight: 120, textAlignVertical: 'top' },
});

 export default MemoryEditScreen;
