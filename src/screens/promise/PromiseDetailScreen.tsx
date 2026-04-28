/**
 * =========================================
 * 약속일기 상세 화면 (PromiseDetailScreen.tsx)
 * =========================================
 *
 * 약속일기(일정)의 상세 화면입니다.
 */

 import React, { useState, useEffect } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   ScrollView, Alert, ActivityIndicator,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { format, parseISO } from 'date-fns';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
 import { LoadingSpinner } from '@components/common';
 import { getPromise, deletePromise } from '@services/promiseService';
 import { Promise as PromiseType } from '@types';

 export const PromiseDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
   const { promiseId } = route.params;
   const [promise, setPromise] = useState<PromiseType | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);

   useEffect(() => { loadPromise(); }, [promiseId]);

   const loadPromise = async () => {
     try {
       const data = await getPromise(promiseId);
       setPromise(data);
     } catch (e: any) {
       Alert.alert('오류', e.message || '불러오기 실패');
       navigation.goBack();
     } finally {
       setIsLoading(false);
     }
   };

   const handleDelete = () => {
     Alert.alert('삭제', '이 약속일기를 삭제하시겠습니까?', [
       { text: '취소', style: 'cancel' },
       {
         text: '삭제', style: 'destructive', onPress: async () => {
           try {
             setIsDeleting(true);
             await deletePromise(promiseId);
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

   const colorKey = promise?.promiseColor as keyof typeof Colors.schedule;
   const dotColor = Colors.schedule[colorKey] || Colors.primary;

   return (
     <SafeAreaView style={styles.container}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>약속일기</Text>
         <View style={styles.headerRight}>
           <TouchableOpacity
             onPress={() => navigation.navigate('PromiseEdit', { promise })}
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

       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         <View style={[styles.titleBar, { borderLeftColor: dotColor }]}>
           <Text style={styles.title}>{promise?.promiseTitle}</Text>
         </View>

         <View style={styles.infoRow}>
           <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={styles.infoIcon} />
           <View>
             <Text style={styles.infoLabel}>{promise?.allDay ? '종일' : '시간'}</Text>
             <Text style={styles.infoValue}>
               {promise?.promiseStart
                 ? format(parseISO(promise.promiseStart), promise.allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm')
                 : ''}
               {promise?.promiseEnd && !promise.allDay
                 ? ` ~ ${format(parseISO(promise.promiseEnd), 'HH:mm')}`
                 : ''}
             </Text>
           </View>
         </View>

         {!!promise?.promiseLocation && (
           <View style={styles.infoRow}>
             <Ionicons name="location-outline" size={20} color={Colors.primary} style={styles.infoIcon} />
             <View>
               <Text style={styles.infoLabel}>장소</Text>
               <Text style={styles.infoValue}>{promise.promiseLocation}</Text>
             </View>
           </View>
         )}

         {!!promise?.promiseMemo && (
           <View style={styles.memoBox}>
             <Text style={styles.infoLabel}>메모</Text>
             <Text style={styles.memoText}>{promise.promiseMemo}</Text>
           </View>
         )}
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
   scrollContent: { padding: Spacing.xl },
   titleBar: { borderLeftWidth: 4, paddingLeft: Spacing.md, marginBottom: Spacing.xl },
   title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
   infoRow: {
     flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surfaceLight,
     borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm,
   },
   infoIcon: { marginRight: Spacing.md, marginTop: 2 },
   infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
   infoValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
   memoBox: {
     backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
     padding: Spacing.md, ...Shadow.sm,
   },
   memoText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22, marginTop: Spacing.xs },
 });

 export default PromiseDetailScreen;