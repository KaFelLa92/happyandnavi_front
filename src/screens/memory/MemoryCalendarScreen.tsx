/**
 * =========================================
 * 추억일기 캘린더 화면 (MemoryCalendarScreen.tsx)
 * =========================================
 * 
 * 추억일기의 메인 화면입니다.
 * 월별 캘린더에 등록된 추억의 썸네일이 표시됩니다.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Colors } from '@constants/colors';
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '@constants/typography';
import { LoadingSpinner, EmptyState } from '@components/common';
import { getCalendarData } from '@services/memoryService';
import { MemoryCalendarItem } from '@types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - Spacing.lg * 2 - Spacing.xs * 6) / 7;

// ============================================
// 타입 정의
// ============================================

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  memory?: MemoryCalendarItem;
}

// ============================================
// 컴포넌트
// ============================================

export const MemoryCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // ========================================
  // 상태
  // ========================================
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<MemoryCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setIsRefreshing(false);
    }
  }, [currentDate]);

  useEffect(() => {
    setIsLoading(true);
    loadCalendarData();
  }, [loadCalendarData]);

  // ========================================
  // 새로고침
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
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // ========================================
  // 캘린더 데이터 생성
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
      }));

    const calendarDays: CalendarDay[] = days.map((date) => {
      const day = date.getDate();
      const memory = calendarData.find((item) => item.day === day);
      
      return {
        date,
        day,
        isCurrentMonth: true,
        memory,
      };
    });

    return [...emptyDays, ...calendarDays];
  };

  // ========================================
  // 날짜 셀 렌더링
  // ========================================

  const renderDayCell = (item: CalendarDay, index: number) => {
    const { date, day, isCurrentMonth, memory } = item;
    const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    const handlePress = () => {
      if (!isCurrentMonth) return;
      
      if (memory) {
        navigation.navigate('MemoryDetail', { memoryId: memory.memoryId });
      } else {
        navigation.navigate('MemoryCreate', { date: format(date, 'yyyy-MM-dd') });
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday && styles.todayCell,
        ]}
        onPress={handlePress}
        disabled={!isCurrentMonth}
        activeOpacity={0.7}
      >
        {memory ? (
          // 추억이 있는 경우 - 썸네일 표시
          <View style={styles.memoryCell}>
            <Image
              source={{ uri: memory.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.dayOverlay}>
              <Text style={styles.dayTextOnImage}>{day}</Text>
            </View>
          </View>
        ) : (
          // 추억이 없는 경우 - 날짜만 표시
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.inactiveDayText,
              isSunday && styles.sundayText,
              isSaturday && styles.saturdayText,
              isToday && styles.todayText,
            ]}
          >
            {day > 0 ? day : ''}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // ========================================
  // 렌더링
  // ========================================

  if (isLoading) {
    return <LoadingSpinner fullScreen message="추억을 불러오는 중..." />;
  }

  const calendarDays = generateCalendarDays();

  return (
    <SafeAreaView style={styles.container}>
      {/* ======== 헤더 ======== */}
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>추억일기</Text>
        </View>
      </View>

      {/* ======== 캘린더 영역 ======== */}
      <View style={styles.calendarContainer}>
        {/* 월 네비게이션 */}
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
      </View>

      {/* ======== 추가 버튼 ======== */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('MemoryCreate')}
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
    backgroundColor: Colors.memoryPrimary,
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
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xxs,
  },
  todayCell: {
    backgroundColor: Colors.primaryLight,
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

  // 추억 썸네일
  memoryCell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  dayOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dayTextOnImage: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  // 추가 버튼
  addButton: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.memorySecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
});

export default MemoryCalendarScreen;
