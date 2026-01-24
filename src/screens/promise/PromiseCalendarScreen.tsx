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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Colors } from '../../../constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../../constants/typography';
import { LoadingSpinner, Card } from '../../../components/common';
import { getCalendarData, getTodayPromises } from '../../../services/promiseService';
import { PromiseCalendarItem, Promise as PromiseType } from '../../../types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - Spacing.lg * 2 - Spacing.xs * 6) / 7;

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
  // 캘린더 데이터 생성
  // ========================================

  const generateCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const startDayOfWeek = getDay(start);
    const emptyDays = Array(startDayOfWeek).fill(null);

    return [...emptyDays, ...days];
  };

  // ========================================
  // 날짜에 일정이 있는지 확인
  // ========================================

  const getPromisesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarData.filter((item) => {
      if (item.promiseStart) {
        const startDate = format(parseISO(item.promiseStart), 'yyyy-MM-dd');
        return startDate === dateStr;
      }
      return false;
    });
  };

  // ========================================
  // 날짜 셀 렌더링
  // ========================================

  const renderDayCell = (item: Date | null, index: number) => {
    if (!item) {
      return <View key={index} style={styles.dayCell} />;
    }

    const date = item;
    const day = date.getDate();
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dayOfWeek = getDay(date);
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const dayPromises = getPromisesForDate(date);
    const hasPromise = dayPromises.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            isSunday && styles.sundayText,
            isSaturday && styles.saturdayText,
            isToday && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}
        >
          {day}
        </Text>
        
        {/* 일정 도트 표시 */}
        {hasPromise && (
          <View style={styles.dotContainer}>
            {dayPromises.slice(0, 3).map((promise, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: Colors.schedule[promise.promiseColor as keyof typeof Colors.schedule] || Colors.primary }
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
            {format(currentDate, 'yyyy MMMM', { locale: ko })}
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
        <View style={styles.calendarGrid}>
          {calendarDays.map((item, index) => renderDayCell(item, index))}
        </View>

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
// 스타일
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

  // 날짜 셀
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  selectedCell: {
    backgroundColor: Colors.promisePrimary,
    borderRadius: BorderRadius.sm,
  },
  dayText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
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
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },

  // 일정 도트
  dotContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
