/**
 * =========================================
 * 약속일기 수정 화면 (PromiseEditScreen.tsx)
 * =========================================
 *
 * 약속일기(일정)의 수정 화면입니다.
 */

 import React, { useState } from 'react';
 import {
   View, Text, StyleSheet, TouchableOpacity,
   ScrollView, Alert, ActivityIndicator, Switch,
 } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import DateTimePicker from '@react-native-community/datetimepicker';
 import { format, parseISO } from 'date-fns';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
 import { Input } from '@components/common';
 import { updatePromise } from '@services/promiseService';
 import { Promise as PromiseType } from '@types';

 const COLOR_OPTIONS = [
   { key: 'blue',   color: '#4FC3F7' },
   { key: 'green',  color: '#81C784' },
   { key: 'orange', color: '#FFB74D' },
   { key: 'pink',   color: '#F48FB1' },
   { key: 'purple', color: '#CE93D8' },
 ];

 export const PromiseEditScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
   const original: PromiseType = route.params.promise;
   const [title, setTitle] = useState(original.promiseTitle || '');
   const [memo, setMemo] = useState(original.promiseMemo || '');
   const [location, setLocation] = useState(original.promiseLocation || '');
   const [allDay, setAllDay] = useState(!!original.allDay);
   const [startDate, setStartDate] = useState(
     original.promiseStart ? parseISO(original.promiseStart) : new Date()
   );
   const [endDate, setEndDate] = useState(
     original.promiseEnd ? parseISO(original.promiseEnd) : new Date()
   );
   const [selectedColor, setSelectedColor] = useState(original.promiseColor || 'blue');
   const [showStartPicker, setShowStartPicker] = useState(false);
   const [showEndPicker, setShowEndPicker] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleSave = async () => {
     if (!title.trim()) { Alert.alert('알림', '제목을 입력해주세요.'); return; }
     try {
       setIsLoading(true);
       await updatePromise(original.promiseId, {
         promiseTitle: title,
         promiseMemo: memo,
         promiseLocation: location,
         allDay: allDay ? 1 : 0,
         promiseStart: startDate.toISOString(),
         promiseEnd: endDate.toISOString(),
         promiseColor: selectedColor,
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
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>약속일기 수정</Text>
         <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
           {isLoading
             ? <ActivityIndicator size="small" color={Colors.primary} />
             : <Text style={styles.saveText}>저장</Text>
           }
         </TouchableOpacity>
       </View>

       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         <Input label="제목" placeholder="약속 제목" value={title} onChangeText={setTitle} />
         <Input label="장소" placeholder="장소 (선택)" value={location} onChangeText={setLocation} />

         <View style={styles.row}>
           <Text style={styles.label}>종일</Text>
           <Switch
             value={allDay}
             onValueChange={setAllDay}
             trackColor={{ false: Colors.border, true: Colors.primaryLight }}
             thumbColor={allDay ? Colors.primary : Colors.surface}
           />
         </View>

         <TouchableOpacity style={styles.dateRow} onPress={() => setShowStartPicker(true)}>
           <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={styles.dateIcon} />
           <View>
             <Text style={styles.dateSubLabel}>시작</Text>
             <Text style={styles.dateValue}>
               {format(startDate, allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm')}
             </Text>
           </View>
         </TouchableOpacity>

         <TouchableOpacity style={styles.dateRow} onPress={() => setShowEndPicker(true)}>
           <Ionicons name="calendar-outline" size={20} color={Colors.promiseSecondary} style={styles.dateIcon} />
           <View>
             <Text style={styles.dateSubLabel}>종료</Text>
             <Text style={styles.dateValue}>
               {format(endDate, allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm')}
             </Text>
           </View>
         </TouchableOpacity>

         {showStartPicker && (
           <DateTimePicker
             value={startDate}
             mode={allDay ? 'date' : 'datetime'}
             display="default"
             onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
           />
         )}
         {showEndPicker && (
           <DateTimePicker
             value={endDate}
             mode={allDay ? 'date' : 'datetime'}
             display="default"
             minimumDate={startDate}
             onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
           />
         )}

         <Text style={styles.label}>색상</Text>
         <View style={styles.colorRow}>
           {COLOR_OPTIONS.map(({ key, color }) => (
             <TouchableOpacity
               key={key}
               style={[styles.colorDot, { backgroundColor: color }, selectedColor === key && styles.colorDotSelected]}
               onPress={() => setSelectedColor(key)}
             />
           ))}
         </View>

         <Input
           label="메모"
           placeholder="메모 (선택)"
           value={memo}
           onChangeText={setMemo}
           multiline
           numberOfLines={4}
           style={styles.memoInput}
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
   row: {
     flexDirection: 'row', alignItems: 'center',
     justifyContent: 'space-between', marginBottom: Spacing.md,
   },
   label: {
     fontSize: FontSize.sm, fontWeight: FontWeight.medium,
     color: Colors.textSecondary, marginBottom: Spacing.xs,
   },
   dateRow: {
     flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight,
     borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm,
   },
   dateIcon: { marginRight: Spacing.md },
   dateSubLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
   dateValue: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary, marginTop: 2 },
   colorRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
   colorDot: { width: 32, height: 32, borderRadius: 16 },
   colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary, transform: [{ scale: 1.15 }] },
   memoInput: { height: 100, textAlignVertical: 'top' },
 });

 export default PromiseEditScreen;