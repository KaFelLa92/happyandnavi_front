/**
 * =========================================
 * 추억일기 작성 화면 (MemoryCreateScreen.tsx)
 * =========================================
 *
 * 추억일기를 등록하는 화면입니다.
 * 사진은 필수, 코멘트/날씨/사용자기분/반려동물기분은 선택입니다.
 *
 * 260502 변경: 날씨, 사용자기분, 반려동물기분 입력 UI 추가
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { Input } from '@components/common';
import { createMemory } from '@services/memoryService';

// ============================================
// 코드표 (PROJECT_BLUEPRINT.md 와 일치)
// ============================================

const WEATHER_OPTIONS: { code: number; label: string; emoji: string }[] = [
  { code: 1, label: '맑음', emoji: '☀️' },
  { code: 2, label: '흐림', emoji: '☁️' },
  { code: 3, label: '비',   emoji: '🌧️' },
  { code: 4, label: '눈',   emoji: '❄️' },
  { code: 5, label: '바람', emoji: '💨' },
];

const MOOD_OPTIONS: { code: number; label: string; emoji: string }[] = [
  { code: 1, label: '매우 좋음', emoji: '😄' },
  { code: 2, label: '좋음',     emoji: '🙂' },
  { code: 3, label: '보통',     emoji: '😐' },
  { code: 4, label: '나쁨',     emoji: '😟' },
  { code: 5, label: '매우 나쁨', emoji: '😢' },
];

export const MemoryCreateScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const initialDate = route.params?.date || new Date().toISOString().split('T')[0];

  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [weather, setWeather] = useState<number | undefined>(undefined);
  const [userMood, setUserMood] = useState<number | undefined>(undefined);
  const [petMood, setPetMood] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }
    // expo-image-picker 신버전 호환: MediaType이 있으면 그것을, 아니면 MediaTypeOptions 사용
    const mediaTypes: any =
      (ImagePicker as any).MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!imageUri) { Alert.alert('알림', '사진을 선택해주세요.'); return; }
    if (!content.trim()) { Alert.alert('알림', '내용을 입력해주세요.'); return; }
    try {
      setIsLoading(true);
      await createMemory({
        memoryDate: initialDate,
        memoryComment: content,
        memoryWeather: weather,
        userMood,
        petMood,
      }, imageUri);
      Alert.alert('완료', '추억일기가 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 칩 셀렉터 (날씨/기분 공용)
  const ChipGroup: React.FC<{
    label: string;
    options: { code: number; label: string; emoji: string }[];
    value: number | undefined;
    onChange: (v: number | undefined) => void;
  }> = ({ label, options, value, onChange }) => (
    <View style={styles.chipGroupWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(opt => {
          const selected = value === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(selected ? undefined : opt.code)}
              activeOpacity={0.8}
            >
              <Text style={styles.chipEmoji}>{opt.emoji}</Text>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>추억일기 작성</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
          {isLoading
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Text style={styles.saveText}>저장</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateLabel}>{initialDate}</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.selectedImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color={Colors.textHint} />
              <Text style={styles.imagePlaceholderText}>사진 추가</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          multiline
          numberOfLines={6}
          placeholder="오늘의 추억을 기록해보세요..."
          value={content}
          onChangeText={setContent}
          style={styles.textInput}
          containerStyle={styles.inputContainer}
          maxLength={200}
        />

        {/* 날씨 */}
        <ChipGroup
          label="날씨"
          options={WEATHER_OPTIONS}
          value={weather}
          onChange={setWeather}
        />

        {/* 사용자 기분 */}
        <ChipGroup
          label="내 기분"
          options={MOOD_OPTIONS}
          value={userMood}
          onChange={setUserMood}
        />

        {/* 반려동물 기분 */}
        <ChipGroup
          label="반려동물 기분"
          options={MOOD_OPTIONS}
          value={petMood}
          onChange={setPetMood}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  saveText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  dateLabel: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    marginBottom: Spacing.md, textAlign: 'center',
  },
  imagePicker: {
    width: '100%', height: 220, borderRadius: BorderRadius.xl,
    overflow: 'hidden', marginBottom: Spacing.lg, ...Shadow.sm,
  },
  selectedImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, backgroundColor: Colors.surfaceLight, justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderStyle: 'dashed',
    borderColor: Colors.border, borderRadius: BorderRadius.xl,
  },
  imagePlaceholderText: { marginTop: Spacing.sm, fontSize: FontSize.md, color: Colors.textHint },
  inputContainer: { marginBottom: Spacing.lg },
  textInput: { height: 120, textAlignVertical: 'top' },

  // 칩 그룹
  chipGroupWrap: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipEmoji: {
    fontSize: FontSize.md,
    marginRight: Spacing.xs,
  },
  chipLabel: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  chipLabelSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});

export default MemoryCreateScreen;
