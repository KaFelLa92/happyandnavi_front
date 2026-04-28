/**
 * =========================================
 * 추억일기 작성 화면 (MemoryCreateScreen.tsx)
 * =========================================
 *
 * 추억일기를 등록하는 화면입니다.
 * 사진은 필수입니다.
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

export const MemoryCreateScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const initialDate = route.params?.date || new Date().toISOString().split('T')[0];
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!imageUri) { Alert.alert('알림', '사진을 선택해주세요.'); return; }
    if (!content.trim()) { Alert.alert('알림', '내용을 입력해주세요.'); return; }
    try {
      setIsLoading(true);
      await createMemory({ memoryDate: initialDate, memoryContent: content }, imageUri);
      Alert.alert('완료', '추억일기가 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message || '저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
          numberOfLines={8}
          placeholder="오늘의 추억을 기록해보세요..."
          value={content}
          onChangeText={setContent}
          style={styles.textInput}
          containerStyle={styles.inputContainer}
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
  scrollContent: { padding: Spacing.lg },
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
  inputContainer: { marginBottom: 0 },
  textInput: { height: 160, textAlignVertical: 'top' },
});

export default MemoryCreateScreen;