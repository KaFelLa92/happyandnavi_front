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
 import { FontFamily } from '@constants/typography';

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
             navigation.navigate('MemoryCalendar');
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
         <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
             <Ionicons name="arrow-back" size={24} color="#4A3B32" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>{memory?.memoryDate}</Text>
           <View style={styles.headerRight}>
             <TouchableOpacity onPress={() => navigation.navigate('MemoryEdit', { memory })} style={styles.iconBtn}>
               <Ionicons name="pencil" size={20} color="#A0938A" />
             </TouchableOpacity>
             <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
               <Ionicons name="trash" size={20} color="#FF6B6B" />
             </TouchableOpacity>
           </View>
         </View>

         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           {/* 폴라로이드 감성의 사진 카드 */}
           {memory?.memoryUrl && (
             <View style={styles.polaroidCard}>
               <Image source={{ uri: getImageUrl(memory.memoryUrl) }} style={styles.image} resizeMode="cover" />
             </View>
           )}

           {/* 칩스 */}
           {hasMeta && (
             <View style={styles.metaRow}>
               {weather && <View style={styles.chip}><Text style={styles.chipEmoji}>{weather.emoji}</Text><Text style={styles.chipText}>{weather.label}</Text></View>}
               {userMood && <View style={styles.chip}><Text style={styles.chipEmoji}>{userMood.emoji}</Text><Text style={styles.chipText}>내 기분</Text></View>}
               {petMood && <View style={styles.chip}><Text style={styles.chipEmoji}>{petMood.emoji}</Text><Text style={styles.chipText}>반려동물</Text></View>}
             </View>
           )}

           {/* 텍스트 본문 카드 */}
           <View style={styles.textCard}>
             {memory?.memoryComment ? (
               <Text style={styles.bodyText}>{memory.memoryComment}</Text>
             ) : (
               <Text style={styles.emptyText}>남겨진 코멘트가 없어요 🐾</Text>
             )}
           </View>
         </ScrollView>
       </SafeAreaView>
     );
   };

   const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#FDFBF7' },
     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
     iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
     headerTitle: { fontFamily: FontFamily.diary, fontSize: 22, color: '#4A3B32' },
     headerRight: { flexDirection: 'row' },
     scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

     polaroidCard: {
       backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, marginBottom: Spacing.xl,
       borderWidth: 1, borderColor: '#F0EBE1', shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 },
       shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
     },
     image: { width: '100%', height: 300, borderRadius: 12 },

     metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
     chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F0EBE1', ...Shadow.xs },
     chipEmoji: { fontSize: 14, marginRight: 4 },
     chipText: { fontSize: 12, color: '#A0938A', fontWeight: 'bold' },

     textCard: {
       backgroundColor: '#FFFDF9', padding: Spacing.xl, borderRadius: 20,
       borderWidth: 1, borderColor: '#F0EBE1', minHeight: 120,
     },
     bodyText: { fontFamily: FontFamily.diary, fontSize: 20, color: '#4A3B32', lineHeight: 24 },
     emptyText: { fontFamily: FontFamily.diary, fontSize: 20, color: '#D1CCC5', fontStyle: 'italic', textAlign: 'center', marginTop: Spacing.lg },
   });

   export default MemoryDetailScreen;
