/**
 * =========================================
 * 추억일기 상세 화면 (MemoryDetailScreen.tsx)
 * =========================================
 *
 * 추억일기를 상세 조회하는 화면입니다.
 */

 import { API_BASE_URL } from '../../constants/config';
 import React, { useState, useEffect } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   Image, ScrollView, Alert, ActivityIndicator,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
 import { LoadingSpinner } from '@components/common';
 import { getMemory, deleteMemory } from '@services/memoryService';
 import { Memory } from '@types';

 // ============================================
 // 코드표 (MemoryCreateScreen 과 동일)
 // ============================================
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

 const findOption = (options: typeof WEATHER_OPTIONS, code?: number | null) =>
   options.find(o => o.code === code) ?? null;

 // ============================================
 // 컴포넌트
 // ============================================

 export const MemoryDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
   const { memoryId } = route.params;
   const [memory, setMemory] = useState<Memory | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);

    const getImageUrl = (path?: string) => {
        if (!path) return undefined;

        // 1. 구글/카카오 프사 등 정상적인 외부 인터넷 주소는 그대로 통과
        if (path.startsWith('http') && !path.includes('localhost')) {
          return path;
        }

        // 2. 정규식을 사용하여 진짜 경로('/profile/...' 또는 '/memory/...')만 쏙 뽑아냅니다.
        // 앞에 http://localhost:8080/uploads/uploads/ 가 몇 개가 붙어있든 다 무시합니다!
        const match = path.match(/(\/profile\/.*|\/memory\/.*)/);

        if (match && match[1]) {
          // 3. 현재 노트북 IP(API_BASE_URL) + /uploads + 진짜 경로 조립
          return `${API_BASE_URL}/uploads${match[1]}`;
        }

        return path; // 매칭 안 될 경우를 대비한 안전 장치
      };

   useEffect(() => { loadMemory(); }, [memoryId]);

   const loadMemory = async () => {
     try {
       const data = await getMemory(memoryId);
       setMemory(data);
     } catch (e: any) {
       Alert.alert('오류', e.message || '불러오기 실패');
       navigation.goBack();
     } finally {
       setIsLoading(false);
     }
   };

   const handleDelete = () => {
     Alert.alert('삭제', '이 추억일기를 삭제하시겠습니까?', [
       { text: '취소', style: 'cancel' },
       {
         text: '삭제', style: 'destructive', onPress: async () => {
           try {
             setIsDeleting(true);
             await deleteMemory(memoryId);
             navigation.goBack();
           } catch (e: any) {
             Alert.alert('오류', e.message || '삭제 실패');
             setIsDeleting(false);
           }
         },
       },
     ]);
   };

   if (isLoading) return <LoadingSpinner fullScreen message="불러오는 중..." />;

   const weather  = findOption(WEATHER_OPTIONS, memory?.memoryWeather);
   const userMood = findOption(MOOD_OPTIONS, memory?.userMood);
   const petMood  = findOption(MOOD_OPTIONS, memory?.petMood);
   const hasMeta  = weather || userMood || petMood;

   return (
     <SafeAreaView style={styles.container}>
       {/* 헤더 */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>추억일기</Text>
         <View style={styles.headerRight}>
           <TouchableOpacity
             onPress={() => navigation.navigate('MemoryEdit', { memory })}
             style={styles.headerBtn}
           >
             <Ionicons name="pencil-outline" size={22} color={Colors.primary} />
           </TouchableOpacity>
           <TouchableOpacity onPress={handleDelete} style={styles.headerBtn} disabled={isDeleting}>
             {isDeleting
               ? <ActivityIndicator size="small" color={Colors.error} />
               : <Ionicons name="trash-outline" size={22} color={Colors.error} />
             }
           </TouchableOpacity>
         </View>
       </View>

       <ScrollView showsVerticalScrollIndicator={false}>
         {/* 사진 */}
         {memory?.memoryUrl && (
                    <Image
                      source={{ uri: getImageUrl(memory.memoryUrl) }}
                      style={styles.image}
                      resizeMode="cover"
                      onLoad={() => console.log('✅ [Detail 성공] 이미지 로드 완료!')}
                      onError={(e) => console.log('❌ [Detail 에러] 이미지 로드 실패 원인:', e.nativeEvent.error)}
                    />
                  )}

         <View style={styles.content}>
           {/* 날짜 */}
           <Text style={styles.date}>{memory?.memoryDate}</Text>

           {/* 날씨 / 기분 칩 */}
           {hasMeta && (
             <View style={styles.metaRow}>
               {weather && (
                 <View style={styles.metaChip}>
                   <Text style={styles.metaEmoji}>{weather.emoji}</Text>
                   <Text style={styles.metaLabel}>{weather.label}</Text>
                 </View>
               )}
               {userMood && (
                 <View style={styles.metaChip}>
                   <Text style={styles.metaEmoji}>{userMood.emoji}</Text>
                   <Text style={styles.metaLabel}>내 기분</Text>
                 </View>
               )}
               {petMood && (
                 <View style={styles.metaChip}>
                   <Text style={styles.metaEmoji}>{petMood.emoji}</Text>
                   <Text style={styles.metaLabel}>반려동물 기분</Text>
                 </View>
               )}
             </View>
           )}

           {/* 본문 */}
           {memory?.memoryComment ? (
             <Text style={styles.body}>{memory.memoryComment}</Text>
           ) : (
             <Text style={styles.emptyBody}>코멘트가 없어요 🐾</Text>
           )}
         </View>
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
   headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
   headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
   headerRight: { flexDirection: 'row' },
   image: { width: '100%', height: 280 },
   content: { padding: Spacing.xl },
   date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
   metaRow: {
     flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
     marginBottom: Spacing.lg,
   },
   metaChip: {
     flexDirection: 'row', alignItems: 'center', gap: 4,
     backgroundColor: Colors.surfaceLight,
     paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
     borderRadius: BorderRadius.full, ...Shadow.xs,
   },
   metaEmoji: { fontSize: 16 },
   metaLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
   body: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 24 },
   emptyBody: { fontSize: FontSize.md, color: Colors.textHint, fontStyle: 'italic' },
 });

 export default MemoryDetailScreen;
