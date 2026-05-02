/**
 * =========================================
 * 약속일기 캘린더 화면 (PromiseCalendarScreen.tsx)
 * =========================================
 * 
 * 약속일기(일정)의 메인 화면입니다.
 * 월별 캘린더에 등록된 일정이 표시됩니다.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl // 추가
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '@constants/typography';
import { LoadingSpinner, Card } from '@components/common';
import { getCalendarData, getTodayPromises } from '@services/promiseService';
import { PromiseCalendarItem, Promise as PromiseType } from '@types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - Spacing.lg * 2 - Spacing.xs * 6) / 7;

// ============================================
// 타입 정의 (추가)
// ============================================

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  promises: PromiseCalendarItem[];
}

// ============================================
// 컴포넌트
// ============================================

export const PromiseCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // ========================================
  // 상태
  // ========================================

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<PromiseCalendarItem[]>([]);
  const [selectedDayPromises, setSelectedDayPromises] = useState<PromiseCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // 추가

  // ========================================
  // 데이터 로딩
  // ========================================

  const loadCalendarData = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const data = await getCalendarData(year, month);
      setCalendarData(data);
    } catch (error) {
      console.error('캘린더 데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false); // 추가
    }
  }, [currentDate]);

  useEffect(() => {
    setIsLoading(true);
    loadCalendarData();
  }, [loadCalendarData]);

  // ========================================
  // 날짜 선택 시 해당 일정 필터링
  // ========================================

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayPromises = calendarData.filter((item) => {
        if (item.promiseStart) {
          const startDate = format(parseISO(item.promiseStart), 'yyyy-MM-dd');
          return startDate === dateStr;
        }
        return false;
      });
      setSelectedDayPromises(dayPromises);
    } else {
      setSelectedDayPromises([]);
    }
  }, [selectedDate, calendarData]);

  // ========================================
  // 새로고침 (추가)
  // ========================================

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCalendarData();
  };

  // ========================================
  // 월 변경
  // ========================================

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  // ========================================
  // 캘린더 데이터 생성 (변경: 추억일기 스타일 적용)
  // ========================================

  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // 시작 요일에 맞게 빈 셀 추가
    const startDayOfWeek = getDay(start);
    const emptyDays: CalendarDay[] = Array(startDayOfWeek)
      .fill(null)
      .map((_, index) => ({
        date: new Date(start.getFullYear(), start.getMonth(), -startDayOfWeek + index + 1),
        day: -startDayOfWeek + index + 1,
        isCurrentMonth: false,
        promises: [],
      }));

    const calendarDaysArray: CalendarDay[] = days.map((date) => {
      const day = date.getDate();
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayPromises = calendarData.filter((item) => {
        if (item.promiseStart) {
          const startDate = format(parseISO(item.promiseStart), 'yyyy-MM-dd');
          return startDate === dateStr;
        }
        return false;
      });

      return {
        date,
        day,
        isCurrentMonth: true,
        promises: dayPromises,
      };
    });

    return [...emptyDays, ...calendarDaysArray];
  };

  // ========================================
  // 날짜 셀 렌더링 (변경: 추억일기 스타일 적용 & 클릭 이벤트 추가)
  // ========================================

  const renderDayCell = (item: CalendarDay, index: number) => {
    const { date, day, isCurrentMonth, promises } = item;
    const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dayOfWeek = getDay(date);
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const hasPromise = promises.length > 0;

    const handlePress = () => {
      if (!isCurrentMonth) return;

      if (hasPromise) {
        setSelectedDate(date); // 일정이 있으면 하단에 리스트 띄우기
      } else {
        // 일정이 없으면 바로 작성 페이지로 이동
        navigation.navigate('PromiseCreate', { date: format(date, 'yyyy-MM-dd') });
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell, // 선택된 셀 스타일 적용
        ]}
        onPress={handlePress}
        disabled={!isCurrentMonth}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.inactiveDayText,
            isSunday && styles.sundayText,
            isSaturday && styles.saturdayText,
            isToday && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}
        >
          {day > 0 ? day : ''}
        </Text>

        {/* 일정 도트 표시 */}
        {hasPromise && isCurrentMonth && (
          <View style={styles.dotContainer}>
            {promises.slice(0, 3).map((promise, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: Colors.schedule[promise.promiseColor as keyof typeof Colors.schedule] || Colors.promisePrimary } // promisePrimary로 변경
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ========================================
  // 렌더링
  // ========================================

  if (isLoading) {
    return <LoadingSpinner fullScreen message="일정을 불러오는 중..." />;
  }

  const calendarDays = generateCalendarDays();

  return (
    <SafeAreaView style={styles.container}>
      {/* ======== 헤더 ======== */}
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>약속일기</Text>
        </View>
      </View>

      {/* ======== 선택된 날짜의 일정 표시 ======== */}
      {selectedDate && selectedDayPromises.length > 0 && (
        <View style={styles.selectedPromises}>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleCharacter}>🐰</Text>
            <TouchableOpacity
              style={styles.closeBubbleButton}
              onPress={() => setSelectedDate(null)}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {selectedDayPromises.map((promise, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.promiseBadge,
                  { backgroundColor: Colors.schedule[promise.promiseColor as keyof typeof Colors.schedule] || Colors.promisePrimary }
                ]}
                onPress={() => navigation.navigate('PromiseDetail', { promiseId: promise.promiseId })}
              >
                <Text style={styles.promiseTime}>
                  {promise.allDay ? '종일' : promise.promiseStart ? format(parseISO(promise.promiseStart), 'HH:mm') : ''}
                </Text>
                <Text style={styles.promiseTitle} numberOfLines={1}>
                  {promise.promiseTitle}
                </Text>
              </TouchableOpacity>
            ))}
             <TouchableOpacity
              style={styles.addPromiseToDateButton}
              onPress={() => navigation.navigate('PromiseCreate', {
                date: format(selectedDate, 'yyyy-MM-dd')
              })}
            >
              <Text style={styles.addPromiseToDateText}>+ 새 일정 추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======== 캘린더 영역 ======== */}
      <View style={styles.calendarContainer}>
        {/* 월 네비게이션 */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {format(currentDate, 'yyyy년 M월', { locale: ko })} {/* 포맷 변경 */}
          </Text>

          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text
              key={index}
              style={[
                styles.weekDayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.calendarGrid}>
            {calendarDays.map((item, index) => renderDayCell(item, index))}
          </View>
        </ScrollView>

        {/* 캘린더 장식 */}
        <View style={styles.calendarDeco}>
          <Text style={styles.decoEmoji}>🐾</Text>
        </View>
      </View>

      {/* ======== 추가 버튼 ======== */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('PromiseCreate', {
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
        })}
      >
        <Ionicons name="add" size={28} color={Colors.textLight} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ============================================
// 스타일 (변경: 추억일기 스타일 통합)
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // 헤더
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  titleBadge: {
    backgroundColor: Colors.promisePrimary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  titleText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  // 선택된 날짜 일정
  selectedPromises: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  speechBubble: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    position: 'relative',
  },
  bubbleCharacter: {
    position: 'absolute',
    top: -20,
    left: 20,
    fontSize: 32,
  },
  closeBubbleButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 1,
  },
  promiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  promiseTime: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
    minWidth: 50,
  },
  promiseTitle: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  addPromiseToDateButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  addPromiseToDateText: {
    color: Colors.promisePrimary, // promisePrimary로 변경
    fontWeight: FontWeight.bold,
  },

  // 캘린더 컨테이너
  calendarContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },

  // 월 네비게이션
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  navButton: {
    padding: Spacing.sm,
  },
  monthText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  // 요일 헤더
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  weekDayText: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // 캘린더 그리드
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: Spacing.sm,
  },

  // 날짜 셀 (추억일기와 통일)
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE, // 높이도 너비와 동일하게
    justifyContent: 'center', // 중앙 정렬
    alignItems: 'center',
    marginVertical: Spacing.xxs,
  },
  todayCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
  },
  selectedCell: {
    backgroundColor: Colors.promisePrimary, // 핑크색 강조
    borderRadius: BorderRadius.sm,
  },
  dayText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  inactiveDayText: {
    color: Colors.textDisabled,
  },
  sundayText: {
    color: Colors.calendar.sunday,
  },
  saturdayText: {
    color: Colors.calendar.saturday,
  },
  todayText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  selectedDayText: {
    color: Colors.white, // 배경이 핑크색이므로 글씨는 흰색으로
    fontWeight: FontWeight.bold,
  },

  // 일정 도트
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute', // 절대 위치로 하단에 배치
    bottom: 2,
    gap: 2,
  },
  dot: {
    width: 4, // 크기 약간 축소
    height: 4,
    borderRadius: 2,
  },

  // 캘린더 장식
  calendarDeco: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  decoEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },

  // 추가 버튼
  addButton: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.promiseSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
});

export default PromiseCalendarScreen;