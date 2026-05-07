/**
 * =========================================
 * 추억일기 수정 화면 (MemoryEditScreen.tsx)
 * =========================================
 *
 * 추억일기를 수정하는 화면입니다.
 */

 import React, { useState } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   ScrollView, Alert, ActivityIndicator,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
 import { Input } from '@components/common';
 import { updateMemory } from '@services/memoryService';
 import { Memory } from '@types';

 const WEATHER_OPTIONS = [
   { code: 1, label: '맑음',  emoji: '☀️' },
   { code: 2, label: '흐림',  emoji: '☁️' },
   { code: 3, label: '비',    emoji: '🌧️' },
   { code: 4, label: '눈',    emoji: '❄️' },
   { code: 5, label: '바람',  emoji: '💨' },
 ];
 const MOOD_OPTIONS = [
   { code: 1, label: '매우 좋음', emoji: '😄' },
   { code: 2, label: '좋음',     emoji: '🙂' },
   { code: 3, label: '보통',     emoji: '😐' },
   { code: 4, label: '나쁨',     emoji: '😟' },
   { code: 5, label: '매우 나쁨', emoji: '😢' },
 ];

 // ============================================
 // 칩 그룹 공용 컴포넌트
 // ============================================
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

 // ============================================
 // 메인 컴포넌트
 // ============================================
 export const MemoryEditScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
   const memory: Memory = route.params.memory;

   const [content,  setContent]  = useState(memory.memoryComment || '');
   const [weather,  setWeather]  = useState<number | undefined>(memory.memoryWeather ?? undefined);
   const [userMood, setUserMood] = useState<number | undefined>(memory.userMood ?? undefined);
   const [petMood,  setPetMood]  = useState<number | undefined>(memory.petMood ?? undefined);
   const [isLoading, setIsLoading] = useState(false);

   const handleSave = async () => {
     if (!content.trim()) { Alert.alert('알림', '내용을 입력해주세요.'); return; }
     try {
       setIsLoading(true);
       await updateMemory(memory.memoryId, {
         memoryComment: content,
         memoryWeather: weather,
         userMood,
         petMood,
       });
       Alert.alert('완료', '수정되었습니다.', [
         { text: '확인', onPress: () => navigation.goBack() },
       ]);
     } catch (e: any) {
       Alert.alert('오류', e.message || '수정 실패');
     } finally {
       setIsLoading(false);
     }
   };

   return (
     <SafeAreaView style={styles.container}>
       {/* 헤더 */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>추억일기 수정</Text>
         <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
           {isLoading
             ? <ActivityIndicator size="small" color={Colors.primary} />
             : <Text style={styles.saveText}>저장</Text>
           }
         </TouchableOpacity>
       </View>

       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         {/* 날짜 표시 (수정 불가) */}
         <Text style={styles.dateLabel}>{memory.memoryDate?.toString()}</Text>

         {/* 본문 (수정 가능) */}
         <Input
           multiline
           numberOfLines={8}
           placeholder="추억을 기록해보세요..."
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

         {/* 내 기분 */}
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
   inputContainer: { marginBottom: Spacing.lg },
   textInput: { height: 160, textAlignVertical: 'top' },

   // 칩 스타일
   chipGroupWrap: { marginBottom: Spacing.lg },
   fieldLabel: {
     fontSize: FontSize.sm, fontWeight: FontWeight.medium,
     color: Colors.textSecondary, marginBottom: Spacing.sm,
   },
   chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
   chip: {
     flexDirection: 'row', alignItems: 'center', gap: 4,
     paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
     borderRadius: BorderRadius.full,
     backgroundColor: Colors.surfaceLight,
     borderWidth: 1, borderColor: Colors.border,
   },
   chipSelected: {
     backgroundColor: Colors.primaryLight,
     borderColor: Colors.primary,
   },
   chipEmoji: { fontSize: 15 },
   chipLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
   chipLabelSelected: { color: Colors.primary, fontWeight: FontWeight.semibold },
 });

 export default MemoryEditScreen;
