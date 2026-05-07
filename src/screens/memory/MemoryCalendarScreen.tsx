/**
 * =========================================
 * 추억일기 캘린더 화면 (MemoryCalendarScreen.tsx)
 * =========================================
 * 
 * 추억일기의 메인 화면입니다.
 * 월별 캘린더에 등록된 추억의 썸네일이 표시됩니다.
 */

import { API_BASE_URL } from '../../constants/config';
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isSameDay, isToday as dateFnsIsToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Colors } from '@constants/colors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@constants/typography';
import { LoadingSpinner } from '@components/common';
import { getCalendarData } from '@services/memoryService';
import { MemoryCalendarItem } from '@types';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - Spacing.lg * 2 - Spacing.xs * 6) / 7;

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  memory?: MemoryCalendarItem;
}

export const MemoryCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<MemoryCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

   const getImageUrl = (path?: string) => {
       if (!path) return undefined;

       // 1. 구글/카카오 프사 등 정상적인 외부 인터넷 주소는 그대로 통과
       if (path.startsWith('http') && !path.includes('localhost')) {
         return path;
       }

       // 2. 정규식을 사용하여 진짜 경로('/profile/...' 또는 '/memory/...')만 쏙 뽑아냅니다.
       // 앞에 http://localhost:8080/uploads/uploads/ 가 몇 개가 붙어있든 다 무시합니다!
       const match = path.match(/(\/profile\/.*|\/memory\/.*)/);

       if (match && match[1]) {
         // 3. 현재 노트북 IP(API_BASE_URL) + /uploads + 진짜 경로 조립
         return `${API_BASE_URL}/uploads${match[1]}`;
       }

       return path; // 매칭 안 될 경우를 대비한 안전 장치
     };

/*
  const getImageUrl = (path?: string) => {
      if (!path) return undefined;
      if (path.startsWith('http') && !path.includes('localhost')) {
        return path;
      }
      const cleanPath = path.replace(/http:\/\/localhost:\d+/g, '');
      return `${API_BASE_URL}/uploads${cleanPath}`;
    };
*/

  // ========================================
  // 데이터 로딩 (useFocusEffect: 화면 복귀 시 자동 재로딩)
  // ========================================
  const loadCalendarData = useCallback(async () => {
    try {
      const year  = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data  = await getCalendarData(year, month);
      setCalendarData(data);
    } catch (error) {
      console.error('캘린더 데이터 로딩 실패:', error);
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
  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end   = endOfMonth(currentDate);
    const days  = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);

    const emptyDays: CalendarDay[] = Array(startDayOfWeek).fill(null).map((_, i) => ({
      date: new Date(start.getFullYear(), start.getMonth(), -startDayOfWeek + i + 1),
      day: -startDayOfWeek + i + 1,
      isCurrentMonth: false,
    }));

    const calDays: CalendarDay[] = days.map(date => {
      const day = date.getDate();
      const memory = calendarData.find(item => item.day === day);
      return { date, day, isCurrentMonth: true, memory };
    });

    return [...emptyDays, ...calDays];
  };

  // ========================================
  // 날짜 셀 클릭 처리
  //  - 추억 있는 날: 바로 상세 이동
  //  - 빈 날 (당일): 1번 클릭 → 선택, 2번 클릭 → 등록 이동
  //  - 빈 날 (비당일): 선택만 (등록 불가)
  // ========================================
  const handleDayPress = (item: CalendarDay) => {
    if (!item.isCurrentMonth) return;

    if (item.memory) {
      navigation.navigate('MemoryDetail', { memoryId: item.memory.memoryId });
      setSelectedDate(null);
      return;
    }

    const isTodayCell = dateFnsIsToday(item.date);
    const alreadySelected = selectedDate && isSameDay(item.date, selectedDate);

    if (isTodayCell && alreadySelected) {
      // 당일 두번 클릭 → 등록
      navigation.navigate('MemoryCreate', { date: format(item.date, 'yyyy-MM-dd') });
      setSelectedDate(null);
      return;
    }

    // 당일이든 아니든 첫 클릭은 선택
    setSelectedDate(alreadySelected ? null : item.date);
  };

  // ========================================
  // 셀 렌더링
  // ========================================
  const renderDayCell = (item: CalendarDay, index: number) => {
    const { date, day, isCurrentMonth, memory } = item;
    const todayCell  = dateFnsIsToday(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dow        = getDay(date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          todayCell && styles.todayCell,
          isSelected && !memory && styles.selectedCell,
        ]}
        onPress={() => handleDayPress(item)}
        disabled={!isCurrentMonth}
        activeOpacity={0.7}
      >
        {memory ? (
                  <View style={styles.memoryCell}>
                    <Image
                      source={{ uri: getImageUrl(memory.thumbnailUrl) }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                      onLoad={() => console.log('✅ [Calendar 성공] 썸네일 로드 완료!')}
                      onError={(e) => console.log('❌ [Calendar 에러] 썸네일 로드 실패 원인:', e.nativeEvent.error)}
                    />
                    {/* ... 텍스트 오버레이 생략 ... */}
                  </View>
                ): (
          <Text style={[
            styles.dayText,
            !isCurrentMonth && styles.inactiveDayText,
            dow === 0 && styles.sundayText,
            dow === 6 && styles.saturdayText,
            todayCell && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}>
            {day > 0 ? day : ''}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen message="추억을 불러오는 중..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>추억일기</Text>
        </View>
      </View>

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
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={[
              styles.weekDayText,
              i === 0 && styles.sundayText,
              i === 6 && styles.saturdayText,
            ]}>{d}</Text>
          ))}
        </View>

        {/* 날짜 그리드 */}
        <View style={styles.calendarGrid}>
          {generateCalendarDays().map((item, index) => renderDayCell(item, index))}
        </View>
      </View>

      {/* + 버튼: 항상 오늘 날짜로 등록 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('MemoryCreate', {
          date: format(new Date(), 'yyyy-MM-dd'),
        })}
      >
        <Ionicons name="add" size={28} color={Colors.textLight} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingVertical: Spacing.md },
  titleBadge: {
    backgroundColor: Colors.memoryPrimary,
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
    width: CELL_SIZE, height: CELL_SIZE,
    justifyContent: 'center', alignItems: 'center', marginVertical: Spacing.xxs,
  },
  todayCell:    { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm },
  selectedCell: { backgroundColor: Colors.memorySecondary, borderRadius: BorderRadius.sm },
  dayText:          { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  inactiveDayText:  { color: Colors.textDisabled },
  sundayText:       { color: Colors.calendar.sunday },
  saturdayText:     { color: Colors.calendar.saturday },
  todayText:        { color: Colors.primary, fontWeight: FontWeight.bold },
  selectedDayText:  { color: Colors.white, fontWeight: FontWeight.bold },
  memoryCell: {
    width: CELL_SIZE - 4, height: CELL_SIZE - 4,
    borderRadius: BorderRadius.sm, overflow: 'hidden',
  },
  thumbnail: { width: '100%', height: '100%' },
  dayOverlay: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4,
  },
  dayTextOnImage: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addButton: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.memorySecondary,
    justifyContent: 'center', alignItems: 'center', ...Shadow.lg,
  },
});

export default MemoryCalendarScreen;
