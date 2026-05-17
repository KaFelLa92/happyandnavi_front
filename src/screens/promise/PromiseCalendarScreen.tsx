/**
 * =========================================
 * 약속일기 캘린더 화면 (PromiseCalendarScreen.tsx)
 * =========================================
 * 
 * 약속일기(일정)의 메인 화면입니다.
 * 월별 캘린더에 등록된 일정이 표시됩니다.
 * 260502 변경:
 *  - 빈 날짜: 1번째 클릭 → 선택, 2번째 클릭(같은 날) → 등록 페이지
 *  - 일정 있는 날: 1번째 클릭 → 말풍선에 일정 리스트 (기존 동작 유지)
 *  - 추억일기 캘린더와 동일한 셀 간격/포커싱 패턴 적용
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameDay, parseISO, isToday as dateFnsIsToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { FontFamily, Spacing } from '@constants/typography';
import { LoadingSpinner } from '@components/common';
import { getCalendarData } from '@services/promiseService';
import { PromiseCalendarItem } from '@types';

// ============================================
// 레이아웃 상수
// ============================================
const { width } = Dimensions.get('window');
const CELL_W   = (width - Spacing.lg * 2 - Spacing.lg * 2 - 10) / 7;
const BAR_H    = 12;
const BAR_GAP  = 2;
const MAX_LANES = 2;
const BAR_MARGIN = 2;

const SCHEDULE_COLORS: Record<string, string> = {
  blue: '#4FC3F7', green: '#81C784', orange: '#FFB74D',
  pink: '#F48FB1', purple: '#CE93D8',
};
const getScheduleColor = (key?: string | null): string => SCHEDULE_COLORS[key ?? ''] ?? '#4FC3F7';
const normalizeDate = (dt: string): string => dt.substring(0, 10);

interface BarInfo {
  promise: PromiseCalendarItem;
  startCol: number; span: number; lane: number;
  isActualStart: boolean; isActualEnd: boolean;
}

export const PromiseCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentDate,   setCurrentDate]   = useState(new Date());
  const [calendarData,  setCalendarData]  = useState<PromiseCalendarItem[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [modalDate,     setModalDate]     = useState<Date>(new Date());
  const [modalPromises, setModalPromises] = useState<PromiseCalendarItem[]>([]);

  const loadCalendarData = useCallback(async () => {
    try {
      const data = await getCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1);
      setCalendarData(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentDate]);

  useFocusEffect(useCallback(() => { setIsLoading(true); loadCalendarData(); }, [loadCalendarData]));

  // 주(week) 단위 분리
  const generateWeekRows = (): (Date | null)[][] => {
    const start = startOfMonth(currentDate);
    const end   = endOfMonth(currentDate);
    const startDow = getDay(start);
    const all: (Date | null)[] = [
      ...Array(startDow).fill(null),
      ...eachDayOfInterval({ start, end }),
    ];
    while (all.length % 7 !== 0) all.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
    return weeks;
  };

  const getBarsForWeek = (week: (Date | null)[]): BarInfo[] => {
    const realDays = week.filter((d): d is Date => d !== null);
    if (realDays.length === 0) return [];
    const wsStr = format(realDays[0], 'yyyy-MM-dd');
    const weStr = format(realDays[realDays.length - 1], 'yyyy-MM-dd');

    const raw: Omit<BarInfo, 'lane'>[] = [];
    calendarData.forEach(item => {
      if (!item.promiseStart) return;
      const ps = normalizeDate(item.promiseStart as unknown as string);
      const pe = item.promiseEnd ? normalizeDate(item.promiseEnd as unknown as string) : ps;
      if (ps > weStr || pe < wsStr) return;
      const cs = ps < wsStr ? wsStr : ps;
      const ce = pe > weStr ? weStr : pe;
      const startCol = week.findIndex(d => d && format(d, 'yyyy-MM-dd') === cs);
      const endCol   = week.findIndex(d => d && format(d, 'yyyy-MM-dd') === ce);
      if (startCol === -1) return;
      const aec = endCol === -1 ? week.length - 1 : endCol;
      raw.push({
        promise: item, startCol, span: aec - startCol + 1,
        isActualStart: ps >= wsStr, isActualEnd: pe <= weStr,
      });
    });
    raw.sort((a, b) => a.startCol - b.startCol || b.span - a.span);

    const laneEnd: number[] = [];
    return raw.map(bar => {
      let lane = 0;
      while (laneEnd[lane] !== undefined && laneEnd[lane] >= bar.startCol) lane++;
      laneEnd[lane] = bar.startCol + bar.span - 1;
      return { ...bar, lane };
    });
  };

  const getPromisesForDay = (date: Date): PromiseCalendarItem[] => {
    const ds = format(date, 'yyyy-MM-dd');
    return calendarData.filter(item => {
      if (!item.promiseStart) return false;
      const s = normalizeDate(item.promiseStart as unknown as string);
      const e = item.promiseEnd ? normalizeDate(item.promiseEnd as unknown as string) : s;
      return ds >= s && ds <= e;
    });
  };

  // ========================================
  // 모달-우선 클릭: 모든 날짜 → 모달
  // ========================================
  const handleDayPress = (date: Date) => {
    const promises = getPromisesForDay(date);
    setModalDate(date);
    setModalPromises(promises);
    setModalVisible(true);
  };

  const formatTime = (dt?: string | null): string => {
    if (!dt) return '';
    try { return format(parseISO(dt), 'HH:mm'); } catch { return ''; }
  };

  // ========================================
  // 주 행 렌더
  // ========================================
  const renderWeekRow = (week: (Date | null)[], wIdx: number) => {
    const bars = getBarsForWeek(week);
    const usedLanes = Math.min(MAX_LANES, bars.length === 0 ? 0
      : Math.max(...bars.map(b => b.lane)) + 1);
    const barsHeight = usedLanes * (BAR_H + BAR_GAP) + 2;

    return (
      <View key={wIdx} style={styles.weekRow}>
        {/* 날짜 숫자 행 */}
        <View style={styles.dateNumRow}>
          {week.map((date, c) => {
            if (!date) return <View key={c} style={styles.emptyCell} />;
            const isToday = dateFnsIsToday(date);
            const dow = getDay(date);
            return (
              <TouchableOpacity
                key={c}
                style={[styles.dateNumCell, isToday && styles.todayNumCell]}
                onPress={() => handleDayPress(date)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  dow === 0 && { color: '#FF6B6B' },
                  dow === 6 && { color: '#4FC3F7' },
                  isToday && styles.todayText,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 바 영역 */}
        <View style={[styles.barsArea, { height: barsHeight }]}>
          {bars.filter(b => b.lane < MAX_LANES).map((bar, idx) => {
            const color = getScheduleColor(bar.promise.promiseColor);
            const left  = bar.startCol * CELL_W + (bar.isActualStart ? BAR_MARGIN : 0);
            const right = (bar.startCol + bar.span) * CELL_W - (bar.isActualEnd ? BAR_MARGIN : 0);
            const top   = bar.lane * (BAR_H + BAR_GAP);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.bar,
                  {
                    left, top,
                    width: Math.max(0, right - left),
                    backgroundColor: color,
                    borderTopLeftRadius:    bar.isActualStart ? 6 : 0,
                    borderBottomLeftRadius: bar.isActualStart ? 6 : 0,
                    borderTopRightRadius:   bar.isActualEnd ? 6 : 0,
                    borderBottomRightRadius:bar.isActualEnd ? 6 : 0,
                  },
                ]}
                onPress={() => navigation.navigate('PromiseDetail', { promiseId: bar.promise.promiseId })}
                activeOpacity={0.85}
              >
                {bar.isActualStart && (
                  <Text style={styles.barText} numberOfLines={1}>
                    {(bar.promise as any).categoryEmoji ? `${(bar.promise as any).categoryEmoji} ` : ''}
                    {bar.promise.promiseTitle}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen message="일정을 불러오는 중..." />;

  const weeks = generateWeekRows();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>약속일기</Text>
      </View>

      {/* 캘린더 카드 - 화면 꽉 채움 */}
      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <Ionicons name="chevron-back" size={20} color="#4A3B32" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <Ionicons name="chevron-forward" size={20} color="#4A3B32" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={[
              styles.weekDayText,
              i === 0 && { color: '#FF6B6B' }, i === 6 && { color: '#4FC3F7' },
            ]}>{d}</Text>
          ))}
        </View>

        {/* 주 단위 그리드 - flex: 1 */}
        <View style={styles.gridContainer}>
          {weeks.map((week, i) => renderWeekRow(week, i))}
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PromiseCreate', { date: format(new Date(), 'yyyy-MM-dd') })}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ===== 모달 (모달-우선 정책) ===== */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)} />

        <View style={[styles.modalCard, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalDay}>{format(modalDate, 'd')}</Text>
            <Text style={styles.modalWeekday}>{format(modalDate, 'EEEE', { locale: ko })}</Text>
          </View>
          <View style={styles.modalDivider} />

          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {modalPromises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={36} color="#D1CCC5" />
                <Text style={styles.emptyText}>이 날에는 약속이 없어요</Text>
                <Text style={styles.emptySubText}>새로운 약속을 추가해보세요 🐾</Text>
              </View>
            ) : (
              modalPromises.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.modalItem}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('PromiseDetail', { promiseId: p.promiseId });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemTime}>
                    {p.allDay ? '종일' : formatTime(p.promiseStart as any)}
                  </Text>
                  <View style={[styles.modalColorBar, { backgroundColor: getScheduleColor(p.promiseColor) }]} />
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemTitle} numberOfLines={1}>
                      {(p as any).categoryEmoji ? `${(p as any).categoryEmoji} ` : ''}
                      {p.promiseTitle}
                    </Text>
                    {p.promiseStart && !p.allDay && (
                      <Text style={styles.modalItemSub}>
                        {formatTime(p.promiseStart as any)}
                        {p.promiseEnd ? ` – ${formatTime(p.promiseEnd as any)}` : ''}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1CCC5" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('PromiseCreate', { date: format(modalDate, 'yyyy-MM-dd') });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalAddText}>
                {format(modalDate, 'M월 d일', { locale: ko })}에 약속 추가
              </Text>
              <View style={styles.modalAddIcon}>
                <Ionicons name="add" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.xs },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: '#4A3B32' },

  calendarCard: {
    flex: 1, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: '#FFFDF9', borderRadius: 24,
    padding: Spacing.lg, borderWidth: 1, borderColor: '#F0EBE1',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFBF0',
    justifyContent: 'center', alignItems: 'center',
  },
  monthText: { fontFamily: FontFamily.diary, fontSize: 18, color: '#4A3B32' },

  weekHeader:  { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.xs },
  weekDayText: { width: CELL_W, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#A0938A' },

  gridContainer: { flex: 1, justifyContent: 'space-between' },
  weekRow: { marginBottom: 2 },
  dateNumRow: { flexDirection: 'row', justifyContent: 'space-around' },
  emptyCell:  { width: CELL_W, height: 32 },
  dateNumCell: {
    width: CELL_W, height: 32,
    justifyContent: 'center', alignItems: 'center', borderRadius: 12,
  },
  todayNumCell: { backgroundColor: '#FFFBF0' },

  dayText: { fontSize: 14, color: '#4A3B32', fontWeight: '500' },
  todayText: { color: '#FFB5B5', fontWeight: 'bold' },

  barsArea: { position: 'relative', marginBottom: 2, marginTop: 1 },
  bar: {
    position: 'absolute', height: BAR_H,
    justifyContent: 'center', paddingHorizontal: 4, overflow: 'hidden',
  },
  barText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#4FC3F7',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4FC3F7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },

  // 모달
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '62%',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5DED5', marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  modalDay:     { fontFamily: FontFamily.diary, fontSize: 40, color: '#4A3B32' },
  modalWeekday: { fontSize: 14, color: '#A0938A' },
  modalDivider: { height: 1, backgroundColor: '#F0EBE1', marginHorizontal: Spacing.lg },

  modalList: { flexGrow: 0, paddingHorizontal: Spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 6 },
  emptyText:  { fontSize: 14, color: '#A0938A', fontWeight: '600' },
  emptySubText: { fontSize: 12, color: '#D1CCC5' },

  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  modalItemTime: { width: 44, fontSize: 12, color: '#A0938A', fontWeight: '600', textAlign: 'right' },
  modalColorBar: { width: 4, height: 38, borderRadius: 2 },
  modalItemContent: { flex: 1 },
  modalItemTitle:   { fontFamily: FontFamily.diary, fontSize: 20, color: '#4A3B32', fontWeight: '600' },
  modalItemSub:     { fontSize: 11, color: '#A0938A', marginTop: 2 },

  modalFooter: {
    borderTopWidth: 1, borderTopColor: '#F0EBE1',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  modalAddButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F9FF',
    borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16,
  },
  modalAddText: { fontSize: 14, color: '#4A3B32', fontWeight: '600' },
  modalAddIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#4FC3F7',
    justifyContent: 'center', alignItems: 'center',
  },
});

export default PromiseCalendarScreen;
