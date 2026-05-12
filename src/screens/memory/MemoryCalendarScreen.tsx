/**
 * =========================================
 * 추억일기 캘린더 화면 (MemoryCalendarScreen.tsx)
 * =========================================
 * 
 * 추억일기의 메인 화면입니다.
 * 월별 캘린더에 등록된 추억의 썸네일이 표시됩니다.
 */

import { API_BASE_URL } from '../../constants/config';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameDay, isToday as dateFnsIsToday, isAfter, isBefore, startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { Spacing } from '@constants/typography';
import { LoadingSpinner } from '@components/common';
import { getCalendarData } from '@services/memoryService';
import { MemoryCalendarItem } from '@types';
import { FontFamily } from '@constants/typography';

const { width } = Dimensions.get('window');
const CELL_W = (width - Spacing.lg * 2 - Spacing.lg * 2 - 10) / 7;

interface CalendarDay {
  date: Date; day: number; isCurrentMonth: boolean;
  isFuture: boolean; memory?: MemoryCalendarItem;
}

const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|mov|m4v|avi|webm|mkv)(\?|$)/i.test(url);
};

const getImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http') && !path.includes('localhost')) return path;
  const match = path.match(/(\/profile\/.*|\/memory\/.*)/);
  if (match && match[1]) return `${API_BASE_URL}/uploads${match[1]}`;
  return path;
};

export const MemoryCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentDate,  setCurrentDate]  = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<MemoryCalendarItem[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const loadCalendarData = useCallback(async () => {
    try {
      const data = await getCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1);
      setCalendarData(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentDate]);

  useFocusEffect(useCallback(() => { setIsLoading(true); loadCalendarData(); }, [loadCalendarData]));

  // 오늘 작성된 추억이 있는가?
  const todayMemory = useMemo(() => {
    const todayDay = new Date().getDate();
    const cur = currentDate;
    const isShowingThisMonth = cur.getFullYear() === new Date().getFullYear()
      && cur.getMonth() === new Date().getMonth();
    if (!isShowingThisMonth) return null;
    return calendarData.find(item => item.day === todayDay) ?? null;
  }, [calendarData, currentDate]);

  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDow = getDay(start);

    const empty: CalendarDay[] = Array(startDow).fill(null).map((_, i) => ({
      date: new Date(start.getFullYear(), start.getMonth(), -startDow + i + 1),
      day: -startDow + i + 1, isCurrentMonth: false, isFuture: false,
    }));

    const days: CalendarDay[] = eachDayOfInterval({ start, end }).map(date => {
      const day = date.getDate();
      const memory = calendarData.find(item => item.day === day);
      return {
        date, day, isCurrentMonth: true, memory,
        isFuture: isAfter(startOfDay(date), today),
      };
    });
    const combined = [...empty, ...days];

    // 마지막 줄이 가운데 정렬되는 현상 방지! (7의 배수가 되도록 투명한 빈 칸 채우기)
    const remainder = combined.length % 7;
    if (remainder > 0) {
      const fillCount = 7 - remainder;
      for (let i = 0; i < fillCount; i++) {
        combined.push({
          date: new Date(end.getFullYear(), end.getMonth(), end.getDate() + i + 1),
          day: -1, // 음수를 주어 화면에 숫자 없이 투명하게 렌더링되도록 함
          isCurrentMonth: false,
          isFuture: true,
        });
      }
    }

    return combined;
  };

  // ========================================
  // 날짜 클릭 — UX 분기
  // ========================================
  const handleDayPress = (item: CalendarDay) => {
    if (!item.isCurrentMonth) return;

    // 1️⃣ 미래 날짜: 비활성
    if (item.isFuture) {
      // 살짝만 안내 (alert 까진 X)
      return;
    }

    // 2️⃣ 추억이 있는 날: 상세로
    if (item.memory) {
      navigation.navigate('MemoryDetail', { memoryId: item.memory.memoryId });
      setSelectedDate(null);
      return;
    }

    // 3️⃣ 오늘인데 추억 없음: 두 번 탭 → 작성
    if (dateFnsIsToday(item.date)) {
      const alreadySelected = selectedDate && isSameDay(item.date, selectedDate);
      if (alreadySelected) {
        navigation.navigate('MemoryCreate', { date: format(item.date, 'yyyy-MM-dd') });
        setSelectedDate(null);
      } else {
        setSelectedDate(item.date);
      }
      return;
    }

    // 4️⃣ 과거 + 추억 없음: 핵심 정책 안내
    Alert.alert(
      '추억일기 안내 🐾',
      '추억일기는 그 날에만 작성할 수 있어요.\n오늘의 소중한 순간을 기록해보세요!',
      [{ text: '확인' }],
    );
  };

  // ========================================
  // FAB 클릭 - 오늘 작성 안내
  // ========================================
  const handleFabPress = () => {
    if (todayMemory) {
      Alert.alert(
        '오늘의 추억 🐾',
        '오늘 작성된 추억일기가 있어요!\n다시 보시겠어요?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '보기',
            onPress: () => navigation.navigate('MemoryDetail', { memoryId: todayMemory.memoryId }),
          },
        ],
      );
      return;
    }
    navigation.navigate('MemoryCreate', { date: todayStr });
  };

  if (isLoading) return <LoadingSpinner fullScreen message="추억을 불러오는 중..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>추억일기</Text>
      </View>

      {/* 오늘 작성 안 했을 때 분기 배너 */}
      {!todayMemory && (
        <TouchableOpacity
          style={styles.todayBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MemoryCreate', { date: todayStr })}
        >
          <View style={styles.bannerIconBg}>
            <Ionicons name="heart" size={18} color="#FF6B6B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>오늘의 추억을 아직 기록하지 않으셨어요</Text>
            <Text style={styles.bannerSub}>지금 바로 기록해볼까요? 🐾</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      )}

      {/* 캘린더 카드 — 화면 꽉 채움 */}
      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => { setCurrentDate(subMonths(currentDate, 1)); setSelectedDate(null); }}
          >
            <Ionicons name="chevron-back" size={20} color="#4A3B32" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => { setCurrentDate(addMonths(currentDate, 1)); setSelectedDate(null); }}
          >
            <Ionicons name="chevron-forward" size={20} color="#4A3B32" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text
              key={i}
              style={[
                styles.weekDayText,
                i === 0 && { color: '#FF6B6B' }, i === 6 && { color: '#4FC3F7' },
              ]}
            >{d}</Text>
          ))}
        </View>

        {/* 그리드 - flex: 1 로 남은 공간 꽉 채움 */}
        <View style={styles.calendarGrid}>
          {generateCalendarDays().map((item, idx) => {
            const isSelected = selectedDate && isSameDay(item.date, selectedDate);
            const isVideo    = isVideoUrl(item.memory?.thumbnailUrl);
            const dow = getDay(item.date);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  dateFnsIsToday(item.date) && styles.todayCell,
                  isSelected && !item.memory && styles.selectedCell,
                ]}
                onPress={() => handleDayPress(item)}
                disabled={!item.isCurrentMonth || item.isFuture}
                activeOpacity={0.7}
              >
                {item.memory ? (
                  <View style={styles.memoryCell}>
                    <Image
                      source={{ uri: getImageUrl(item.memory.thumbnailUrl) }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    {/* 동영상이면 ▶ 오버레이 */}
                    {isVideo && (
                      <View style={styles.videoOverlay}>
                        <Ionicons name="play" size={14} color="#FFF" />
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={[
                    styles.dayText,
                    !item.isCurrentMonth && styles.inactiveDayText,
                    item.isFuture && styles.futureDayText,
                    dow === 0 && !item.isFuture && { color: '#FF6B6B' },
                    dow === 6 && !item.isFuture && { color: '#4FC3F7' },
                    dateFnsIsToday(item.date) && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}>
                    {item.day > 0 ? item.day : ''}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FAB - 오늘 작성 안내 */}
      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Ionicons
          name={todayMemory ? 'eye' : 'add'}
          size={28}
          color="#FFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.xs },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: '#4A3B32' },

  // 분기 배너
  todayBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: '#FFF5F5',
    borderRadius: 16, paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderWidth: 1, borderColor: '#FFD5D5',
  },
  bannerIconBg: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: '#4A3B32' },
  bannerSub:   { fontSize: 11, color: '#A0938A', marginTop: 2 },

  // 캘린더 카드
  calendarCard: {
    flex: 1,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
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

  weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.xs },
  weekDayText: {
    width: CELL_W, textAlign: 'center',
    fontSize: 12, fontWeight: 'bold', color: '#A0938A',
  },

  calendarGrid: {
    flex: 1,
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-around', alignContent: 'space-around',
  },
  dayCell: {
    width: CELL_W, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
    marginVertical: 2, borderRadius: 12,
  },
  todayCell:    { backgroundColor: '#FFFBF0' },
  selectedCell: { backgroundColor: '#FFC85C' },

  dayText:        { fontSize: 14, color: '#4A3B32', fontWeight: '500' },
  inactiveDayText:{ color: '#E5DED5' },
  futureDayText:  { color: '#E5DED5' }, // 미래는 비활성 색
  todayText:      { color: '#FFB5B5', fontWeight: 'bold' },
  selectedDayText:{ color: '#FFF', fontWeight: 'bold' },

  memoryCell: {
    width: CELL_W - 4, height: CELL_W - 4,
    borderRadius: 10, overflow: 'hidden',
  },
  thumbnail: { width: '100%', height: '100%' },
  videoOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});

export default MemoryCalendarScreen;
