/**
 * =========================================
 * 추억일기 상세 화면 (MemoryDetailScreen.tsx)
 * =========================================
 *
 * 추억일기를 상세 조회하는 화면입니다.
 */

 import React, { useState, useEffect } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   Image, ScrollView, Alert, ActivityIndicator,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing } from '@constants/typography';
 import { LoadingSpinner } from '@components/common';
 import { getMemory, deleteMemory } from '@services/memoryService';
 import { Memory } from '@types';

 export const MemoryDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
   const { memoryId } = route.params;
   const [memory, setMemory] = useState<Memory | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);

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

   return (
     <SafeAreaView style={styles.container}>
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
         {memory?.imageUrl && (
           <Image source={{ uri: memory.imageUrl }} style={styles.image} resizeMode="cover" />
         )}
         <View style={styles.content}>
           <Text style={styles.date}>{memory?.memoryDate}</Text>
           <Text style={styles.body}>{memory?.memoryContent}</Text>
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
   body: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 24 },
 });

 export default MemoryDetailScreen;