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
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { LoadingSpinner } from '@components/common';
import { getCalendarData } from '@services/promiseService';
import { PromiseCalendarItem } from '@types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - Spacing.lg * 2 - Spacing.xs * 6) / 7;
// 바(bar)가 최대 2개 들어가는 셀 높이
const CELL_HEIGHT = CELL_SIZE + 20;

// Colors.schedule 타입 안전 헬퍼
const getScheduleColor = (key?: string | null): string => {
  if (!key) return Colors.promisePrimary;
  return (Colors.schedule as Record<string, string>)[key] ?? Colors.promisePrimary;
};

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  promises: PromiseCalendarItem[];
}

export const PromiseCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<PromiseCalendarItem[]>([]);
  const [isLoading, setIsLoading]       = useState(true);

  // 모달 상태
  const [modalVisible,  setModalVisible]  = useState(false);
  const [modalDate,     setModalDate]     = useState<Date>(new Date());
  const [modalPromises, setModalPromises] = useState<PromiseCalendarItem[]>([]);

  // ========================================
  // 데이터 로딩 (useFocusEffect)
  // ========================================
  const loadCalendarData = useCallback(async () => {
    try {
      const data = await getCalendarData(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      setCalendarData(data);
    } catch (err) {
      console.error('캘린더 데이터 로딩 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadCalendarData();
    }, [loadCalendarData])
  );

  const handlePrevMonth = () => { setCurrentDate(subMonths(currentDate, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(addMonths(currentDate, 1)); setSelectedDate(null); };

  // ========================================
  // 캘린더 데이터 생성
  // ========================================
  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end   = endOfMonth(currentDate);
    const startDow = getDay(start);

    const emptyDays: CalendarDay[] = Array(startDow).fill(null).map((_, i) => ({
      date: new Date(start.getFullYear(), start.getMonth(), -startDow + i + 1),
      day: -startDow + i + 1,
      isCurrentMonth: false,
      promises: [],
    }));

    const calDays: CalendarDay[] = eachDayOfInterval({ start, end }).map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const promises = calendarData.filter(item => {
        if (!item.promiseStart) return false;
        return format(parseISO(item.promiseStart as unknown as string), 'yyyy-MM-dd') === dateStr;
      });
      return { date, day: date.getDate(), isCurrentMonth: true, promises };
    });

    return [...emptyDays, ...calDays];
  };

  // ========================================
  // 날짜 셀 클릭 처리
  //  - 일정 있는 날 → 모달 오픈
  //  - 빈 날 → 두번 클릭 패턴 (등록 페이지)
  // ========================================
  const handleDayPress = (item: CalendarDay) => {
    if (!item.isCurrentMonth) return;

    if (item.promises.length > 0) {
      setModalDate(item.date);
      setModalPromises(item.promises);
      setModalVisible(true);
      return;
    }

    const alreadySelected = selectedDate && isSameDay(item.date, selectedDate);
    if (alreadySelected) {
      navigation.navigate('PromiseCreate', { date: format(item.date, 'yyyy-MM-dd') });
      setSelectedDate(null);
    } else {
      setSelectedDate(item.date);
    }
  };

  // ========================================
  // 시간 포맷 헬퍼
  // ========================================
  const formatTime = (dt?: LocalDateTime | string | null): string => {
    if (!dt) return '';
    try {
      const d = typeof dt === 'string' ? parseISO(dt) : new Date(dt as any);
      return format(d, 'HH:mm');
    } catch {
      return '';
    }
  };

  // ========================================
  // 셀 렌더링
  // ========================================
  const renderDayCell = (item: CalendarDay, index: number) => {
    const { date, day, isCurrentMonth, promises } = item;
    const todayCell  = dateFnsIsToday(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dow        = getDay(date);
    const hasPromise = promises.length > 0 && isCurrentMonth;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          todayCell  && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handleDayPress(item)}
        disabled={!isCurrentMonth}
        activeOpacity={0.7}
      >
        {/* 날짜 숫자 */}
        <Text style={[
          styles.dayText,
          !isCurrentMonth && styles.inactiveDayText,
          dow === 0 && styles.sundayText,
          dow === 6 && styles.saturdayText,
          todayCell  && styles.todayText,
          isSelected && styles.selectedDayText,
        ]}>
          {day > 0 ? day : ''}
        </Text>

        {/* 색상 바 (최대 2개) */}
        {hasPromise && (
          <View style={styles.barContainer}>
            {promises.slice(0, 2).map((p, i) => (
              <View
                key={i}
                style={[styles.bar, { backgroundColor: getScheduleColor(p.promiseColor) }]}
              >
                <Text style={styles.barText} numberOfLines={1}>
                  {(p as any).categoryEmoji ? `${(p as any).categoryEmoji} ` : ''}
                  {p.promiseTitle}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen message="일정을 불러오는 중..." />;

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>약속일기</Text>
        </View>
      </View>

      {/* 캘린더 */}
      <View style={styles.calendarContainer}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={[
              styles.weekDayText,
              i === 0 && styles.sundayText,
              i === 6 && styles.saturdayText,
            ]}>{d}</Text>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((item, index) => renderDayCell(item, index))}
          </View>
        </ScrollView>
      </View>

      {/* + 버튼 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('PromiseCreate', {
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        })}
      >
        <Ionicons name="add" size={28} color={Colors.textLight} />
      </TouchableOpacity>

      {/* ========================================
          갤럭시 캘린더 스타일 바텀시트 모달
          ======================================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* 어두운 오버레이 — 탭하면 모달 닫기 */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />

        {/* 바텀시트 카드 */}
        <View style={[styles.modalCard, { paddingBottom: insets.bottom + 8 }]}>
          {/* 헤더 드래그 핸들 */}
          <View style={styles.modalHandle} />

          {/* 날짜 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalDay}>{format(modalDate, 'd')}</Text>
            <Text style={styles.modalWeekday}>
              {format(modalDate, 'EEEE', { locale: ko })}
            </Text>
          </View>
          <View style={styles.modalDivider} />

          {/* 일정 리스트 */}
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {modalPromises.map((promise, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalItem}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('PromiseDetail', { promiseId: promise.promiseId });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalItemTime}>
                  {promise.allDay
                    ? '종일'
                    : formatTime(promise.promiseStart as any)
                  }
                </Text>
                <View style={[
                  styles.modalColorBar,
                  { backgroundColor: getScheduleColor(promise.promiseColor) },
                ]} />
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle} numberOfLines={1}>
                    {(promise as any).categoryEmoji ? `${(promise as any).categoryEmoji} ` : ''}
                    {promise.promiseTitle}
                  </Text>
                  {promise.promiseStart && !promise.allDay && (
                    <Text style={styles.modalItemSub}>
                      {formatTime(promise.promiseStart as any)}
                      {promise.promiseEnd ? ` – ${formatTime(promise.promiseEnd as any)}` : ''}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textHint} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 하단 추가 버튼 */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('PromiseCreate', {
                  date: format(modalDate, 'yyyy-MM-dd'),
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalAddText}>
                {format(modalDate, 'M월 d일', { locale: ko })}에 추가
              </Text>
              <View style={styles.modalAddIcon}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// LocalDateTime type alias for clarity
type LocalDateTime = string | Date;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingVertical: Spacing.md },
  titleBadge: {
    backgroundColor: Colors.promisePrimary,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, ...Shadow.sm,
  },
  titleText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  calendarContainer: {
    flex: 1, marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadow.sm,
  },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  navButton: { padding: Spacing.sm },
  monthText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  weekHeader: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  weekDayText: {
    width: CELL_SIZE, textAlign: 'center',
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: Spacing.sm },

  dayCell: {
    width: CELL_SIZE, height: CELL_HEIGHT,
    alignItems: 'center', marginVertical: 1,
    paddingTop: 4,
  },
  todayCell:    { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm },
  selectedCell: { backgroundColor: Colors.promisePrimary, borderRadius: BorderRadius.sm },
  dayText: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  inactiveDayText: { color: Colors.textDisabled },
  sundayText:      { color: Colors.calendar.sunday },
  saturdayText:    { color: Colors.calendar.saturday },
  todayText:       { color: Colors.primary, fontWeight: FontWeight.bold },
  selectedDayText: { color: Colors.white, fontWeight: FontWeight.bold },

  // 색상 바
  barContainer: { width: CELL_SIZE - 4, marginTop: 2, gap: 1 },
  bar: {
    width: '100%', height: 13, borderRadius: 2,
    justifyContent: 'center', paddingHorizontal: 2, overflow: 'hidden',
  },
  barText: { fontSize: 8, color: '#fff', fontWeight: '600' },

  addButton: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.promiseSecondary,
    justifyContent: 'center', alignItems: 'center', ...Shadow.lg,
  },

  // 모달 오버레이
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  // 바텀시트 카드
  modalCard: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white ?? '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '62%',
    ...Shadow.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 10, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  modalDay: { fontSize: 30, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalWeekday: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.lg },

  modalList: { flexGrow: 0, paddingHorizontal: Spacing.lg },
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  modalItemTime: {
    width: 44, fontSize: FontSize.sm, color: Colors.textSecondary,
    fontWeight: FontWeight.medium, textAlign: 'right',
  },
  modalColorBar: { width: 4, height: 38, borderRadius: 2 },
  modalItemContent: { flex: 1 },
  modalItemTitle: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  modalItemSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  modalFooter: {
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  modalAddButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16,
  },
  modalAddText: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalAddIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.promisePrimary,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default PromiseCalendarScreen;
