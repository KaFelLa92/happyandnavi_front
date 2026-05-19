/**
 * =========================================
 * 약속일기 등록 화면 (PromiseCreateScreen.tsx)
 * =========================================
 *
 * 약속일기(일정)의 등록 화면입니다.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Switch, Platform,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Colors } from '@constants/colors';
import { FontFamily, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { Input, CustomAlert } from '@components/common';
import { createPromise } from '@services/promiseService';

const COLOR_OPTIONS = [
  { key: 'blue',   color: '#4FC3F7' },
  { key: 'green',  color: '#81C784' },
  { key: 'orange', color: '#FFB74D' },
  { key: 'pink',   color: '#F48FB1' },
  { key: 'purple', color: '#CE93D8' },
];

const PROMISE_CATEGORIES = [
  { key: 'VACCINATION', label: '예방접종', emoji: '💉' },
  { key: 'CHECKUP',     label: '정기검진', emoji: '🏥' },
  { key: 'GROOMING',    label: '미용',     emoji: '✂️' },
  { key: 'WALK',        label: '산책',     emoji: '🐾' },
  { key: 'FOOD',        label: '사료 구매', emoji: '🍚' },
  { key: 'SNACK',       label: '간식',     emoji: '🦴' },
  { key: 'NAIL',        label: '발톱 관리', emoji: '✨' },
  { key: 'SURGERY',     label: '수술',     emoji: '🔬' },
  { key: 'OTHER',       label: '기타',     emoji: '📌' },
];

const toLocalISO = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

export const PromiseCreateScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const initDate = route.params?.date ? new Date(route.params.date) : new Date();

  const [title,          setTitle]          = useState('');
  const [memo,           setMemo]           = useState('');
  const [allDay,         setAllDay]         = useState(false);
  const [startDate,      setStartDate]      = useState(initDate);
  const [endDate,        setEndDate]        = useState(initDate);
  const [selectedColor,  setSelectedColor]  = useState('blue');
  const [selectedCat,    setSelectedCat]    = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const scrollViewRef = useRef<ScrollView>(null);
  const [isMemoFocused, setIsMemoFocused] = useState(false);

  // 🚨 CustomAlert 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmHandler, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [alertCloseHandler, setAlertOnClose] = useState<(() => void) | undefined>(undefined);

  const triggerAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnConfirm(onConfirm ? () => onConfirm : undefined);
    setAlertOnClose(onClose ? () => onClose : undefined);
    setAlertVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { triggerAlert('알림', '제목을 입력해주세요.'); return; }
    try {
      setIsLoading(true);
      await createPromise({
        promiseTitle:    title,
        promiseComment:  memo,
        promiseColor:    selectedColor,
        promiseCategory: selectedCat ?? undefined,
        allDay:          allDay,
        promiseStart:    toLocalISO(startDate) as any,
        promiseEnd:      toLocalISO(endDate)   as any,
      } as any);
      triggerAlert('완료', '약속일기가 저장되었습니다. 🐾', undefined, () => navigation.goBack());
    } catch (e: any) {
      triggerAlert('오류', e.message || '저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const openStartPicker = () => { setPickerMode('date'); setShowStartPicker(true); };
  const openEndPicker = () => { setPickerMode('date'); setShowEndPicker(true); };

  const handleStartChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      if (event.type === 'set' && selectedDate) {
        setStartDate(selectedDate);
        if (!allDay && pickerMode === 'date') {
          setPickerMode('time');
          setTimeout(() => setShowStartPicker(true), 100);
        }
      }
    } else {
      setShowStartPicker(false);
      if (selectedDate) setStartDate(selectedDate);
    }
  };

  const handleEndChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
      if (event.type === 'set' && selectedDate) {
        setEndDate(selectedDate);
        if (!allDay && pickerMode === 'date') {
          setPickerMode('time');
          setTimeout(() => setShowEndPicker(true), 100);
        }
      }
    } else {
      setShowEndPicker(false);
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약속일기 작성</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.saveText}>저장</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: isMemoFocused ? 400 : Spacing.xxxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
        <Input label="제목" placeholder="약속 제목" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.categoryGrid}>
          {PROMISE_CATEGORIES.map(cat => {
            const selected = selectedCat === cat.key;
            return (
              <TouchableOpacity key={cat.key} style={[styles.catChip, selected && styles.catChipSelected]} onPress={() => setSelectedCat(selected ? null : cat.key)} activeOpacity={0.8}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, selected && styles.catLabelSelected]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>종일</Text>
          <Switch value={allDay} onValueChange={setAllDay} trackColor={{ false: Colors.border, true: Colors.primaryLight }} thumbColor={allDay ? Colors.primary : Colors.surface} />
        </View>

        <TouchableOpacity style={styles.dateRow} onPress={openStartPicker}>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={styles.dateIcon} />
          <View>
            <Text style={styles.dateSubLabel}>시작</Text>
            <Text style={styles.dateValue}>{format(startDate, allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateRow} onPress={openEndPicker}>
          <Ionicons name="calendar-outline" size={20} color={Colors.promiseSecondary} style={styles.dateIcon} />
          <View>
            <Text style={styles.dateSubLabel}>종료</Text>
            <Text style={styles.dateValue}>{format(endDate, allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm')}</Text>
          </View>
        </TouchableOpacity>

        {showStartPicker && <DateTimePicker value={startDate} mode={Platform.OS === 'ios' ? (allDay ? 'date' : 'datetime') : pickerMode} display="default" onChange={handleStartChange} />}
        {showEndPicker && <DateTimePicker value={endDate} mode={Platform.OS === 'ios' ? (allDay ? 'date' : 'datetime') : pickerMode} display="default" minimumDate={pickerMode === 'date' ? startDate : undefined} onChange={handleEndChange} />}

        <Text style={styles.label}>색상</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map(({ key, color }) => (
            <TouchableOpacity key={key} style={[styles.colorDot, { backgroundColor: color }, selectedColor === key && styles.colorDotSelected]} onPress={() => setSelectedColor(key)} />
          ))}
        </View>

        <Input
          label="메모" placeholder="메모 (선택)" value={memo} onChangeText={setMemo} multiline numberOfLines={4} style={styles.memoInput}
          onFocus={() => { setIsMemoFocused(true); setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 300); }}
          onBlur={() => setIsMemoFocused(false)}
        />
        </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* 🚨 커스텀 알럿 장착 */}
      <CustomAlert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={() => { setAlertVisible(false); alertCloseHandler?.(); setAlertOnClose(undefined); }} onConfirm={alertConfirmHandler} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  headerBtn:   { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: Colors.textPrimary },
  saveText:    { fontFamily: FontFamily.diary, fontSize: 22, color: Colors.primary },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  catChipSelected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  catLabelSelected: { color: Colors.primary, fontWeight: FontWeight.semibold },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  dateIcon:    { marginRight: Spacing.md },
  dateSubLabel:{ fontSize: FontSize.xs, color: Colors.textSecondary },
  dateValue:   { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary, marginTop: 2 },
  colorRow:    { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  colorDot:    { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary, transform: [{ scale: 1.15 }] },
  memoInput:   { fontFamily: FontFamily.diary, fontSize: 20, height: 100, textAlignVertical: 'top' },
});

export default PromiseCreateScreen;