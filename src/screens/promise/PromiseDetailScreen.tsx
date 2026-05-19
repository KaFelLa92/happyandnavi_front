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
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { FontFamily, Spacing } from '@constants/typography';
import { LoadingSpinner, CustomAlert } from '@components/common';
import { getPromise, deletePromise } from '@services/promiseService';
import { Promise as PromiseType } from '@types';

const SCHEDULE_COLORS: Record<string, string> = { blue: '#4FC3F7', green: '#81C784', orange: '#FFB74D', pink: '#F48FB1', purple: '#CE93D8' };
const getScheduleColor = (key?: string | null): string => SCHEDULE_COLORS[key ?? ''] ?? '#4FC3F7';

const CATEGORY_MAP: Record<string, string> = { VACCINATION: '💉 예방접종', CHECKUP: '🏥 정기검진', GROOMING: '✂️ 미용', WALK: '🐾 산책', FOOD: '🍚 사료 구매', SNACK: '🦴 간식', NAIL: '✨ 발톱 관리', SURGERY: '🔬 수술', OTHER: '📌 기타' };

export const PromiseDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { promiseId } = route.params;
  const [promise,    setPromise]    = useState<PromiseType | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🚨 CustomAlert 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmHandler, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);

  const triggerAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnConfirm(onConfirm ? () => onConfirm : undefined);
    setAlertVisible(true);
  };

  useEffect(() => { loadPromise(); }, [promiseId]);

  const loadPromise = async () => {
    try {
      const data = await getPromise(promiseId);
      setPromise(data);
    } catch (e: any) {
      triggerAlert('오류', e.message || '불러오기 실패', () => navigation.goBack());
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    triggerAlert('약속 삭제 🗑️', '이 약속일기를 삭제하시겠습니까?\n삭제하면 복구할 수 없어요.', async () => {
      try {
        setIsDeleting(true);
        await deletePromise(promiseId);
        navigation.goBack();
      } catch (e: any) {
        triggerAlert('오류', e.message || '삭제 실패');
        setIsDeleting(false);
      }
    });
  };

  if (isLoading) return <LoadingSpinner fullScreen message="불러오는 중..." />;

  const dotColor   = getScheduleColor(promise?.promiseColor);
  const catLabel   = CATEGORY_MAP[(promise as any)?.promiseCategory ?? ''];

  const startFormatted = promise?.promiseStart ? format(parseISO(promise.promiseStart as string), promise.allDay ? 'yyyy.MM.dd' : 'yyyy.MM.dd HH:mm') : '';
  const endFormatted = promise?.promiseEnd && !promise.allDay ? ` ~ ${format(parseISO(promise.promiseEnd as string), 'yyyy.MM.dd HH:mm')}` : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#4A3B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약속일기</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('PromiseEdit', { promise })} style={styles.iconBtn}>
            <Ionicons name="pencil" size={20} color="#A0938A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn} disabled={isDeleting}>
            {isDeleting ? <ActivityIndicator size="small" color="#FF6B6B" /> : <Ionicons name="trash" size={20} color="#FF6B6B" />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.titleCard, { borderLeftColor: dotColor }]}>
          {catLabel && <Text style={styles.catBadge}>{catLabel}</Text>}
          <Text style={styles.titleText}>{promise?.promiseTitle}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={[styles.infoIconBg, { backgroundColor: '#EFF9FF' }]}><Ionicons name="calendar-outline" size={20} color="#4FC3F7" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoSubLabel}>{promise?.allDay ? '종일' : '일시'}</Text>
            <Text style={styles.infoValue}>{startFormatted}{endFormatted}</Text>
          </View>
        </View>

        {!!promise?.promiseComment && (
          <View style={styles.memoCard}>
            <View style={styles.memoHeader}><Ionicons name="document-text-outline" size={16} color="#A0938A" /><Text style={styles.memoLabel}>메모</Text></View>
            <Text style={styles.memoText}>{promise.promiseComment}</Text>
          </View>
        )}
      </ScrollView>

      {/* 🚨 커스텀 알럿 장착 */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfirmHandler}
        confirmText={alertConfirmHandler ? (alertTitle.includes('삭제') ? '삭제하기' : '확인') : '확인'}
        cancelText="취소"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  iconBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 22, color: '#4A3B32' },
  headerRight: { flexDirection: 'row' }, scrollContent:{ padding: Spacing.lg, paddingBottom: 50 },
  titleCard: { backgroundColor: '#FFFDF9', borderRadius: 20, padding: Spacing.xl, borderLeftWidth: 5, borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.xl, shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  catBadge: { fontSize: 12, color: '#A0938A', marginBottom: 6, fontWeight: '600' }, titleText: { fontFamily: FontFamily.diary, fontSize: 28, color: '#4A3B32' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: Spacing.lg, borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.md, shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  infoIconBg:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }, infoSubLabel: { fontSize: 11, color: '#A0938A', marginBottom: 3 }, infoValue:    { fontSize: 15, fontWeight: '600', color: '#4A3B32' },
  memoCard: { backgroundColor: '#FFFDF9', borderRadius: 16, padding: Spacing.lg, borderWidth: 1, borderColor: '#F0EBE1', minHeight: 100, shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  memoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm }, memoLabel:  { fontSize: 12, color: '#A0938A', fontWeight: '600' }, memoText:   { fontFamily: FontFamily.diary, fontSize: 20, color: '#4A3B32', lineHeight: 24 },
});

export default PromiseDetailScreen;