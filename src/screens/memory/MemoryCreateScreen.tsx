/**
 * =========================================
 * 추억일기 작성 화면 (MemoryCreateScreen.tsx)
 * =========================================
 *
 * 추억일기를 등록하는 화면입니다.
 * 사진은 필수, 코멘트/날씨/사용자기분/반려동물기분은 선택입니다.
 *
 * 260502 변경: 날씨, 사용자기분, 반려동물기분 입력 UI 추가
 */

import React, { useState, useRef, useEffect } from 'react'; // 🚨 useRef 추가
import {
  View, Text, StyleSheet, TouchableOpacity,ScrollView, Image, Alert,
  ActivityIndicator, Modal, Pressable, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 🚨 useSafeAreaInsets 추가
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '@constants/colors';
import { FontFamily, FontSize, FontWeight, Spacing, Shadow } from '@constants/typography';
import { Input, CustomAlert } from '@components/common';
import { createMemory } from '@services/memoryService';
import * as FileSystem from 'expo-file-system';

const MAX_VIDEO_SECONDS = 5;
const MAX_FILE_BYTES    = 100 * 1024 * 1024; // 100 MB

const WEATHER_OPTIONS = [
  { code: 1, label: '맑음', emoji: '☀️' }, { code: 2, label: '흐림', emoji: '☁️' },
  { code: 3, label: '비',   emoji: '🌧️' }, { code: 4, label: '눈',   emoji: '❄️' }, { code: 5, label: '바람', emoji: '💨' },
];
const MOOD_OPTIONS = [
  { code: 1, label: '매우 좋음', emoji: '😄' }, { code: 2, label: '좋음', emoji: '🙂' },
  { code: 3, label: '보통',     emoji: '😐' }, { code: 4, label: '나쁨', emoji: '😟' }, { code: 5, label: '매우 나쁨', emoji: '😢' },
];

// 동영상 길이 제한 검증 - duration 은 ms 단위
const validateVideoDuration = (durationMs?: number): { ok: boolean; reason?: string } => {
  if (!durationMs) return { ok: true }; // 알 수 없으면 통과 (백엔드에서 추가 검증 가능)
  if (durationMs > MAX_VIDEO_SECONDS * 1000) {
    return { ok: false, reason: `동영상은 최대 ${MAX_VIDEO_SECONDS}초까지 가능해요.` };
  }
  return { ok: true };
};

// 파일 크기 검증
const validateFileSize = async (uri: string): Promise<{ ok: boolean; reason?: string }> => {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if ((info as any).size && (info as any).size > MAX_FILE_BYTES) {
      const mb = Math.round((info as any).size / 1024 / 1024);
      return { ok: false, reason: `파일이 너무 커요 (${mb}MB).\n50MB 이하 파일을 사용해주세요.` };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
};

export const MemoryCreateScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { date } = route.params;
  const scrollViewRef = useRef<ScrollView>(null); // 스크롤뷰 조종용 리모컨 생성
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [comment,     setComment]   = useState('');
  const [weather,     setWeather]   = useState<number | null>(null);
  const [userMood,    setUserMood]  = useState<number | null>(null);
  const [petMood,     setPetMood]   = useState<number | null>(null);
  const [media,       setMedia]     = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [isLoading,   setIsLoading] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmHandler, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [alertCloseHandler,   setAlertOnClose]   = useState<(() => void) | undefined>(undefined);

  const triggerAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnConfirm(onConfirm ? () => onConfirm : undefined);
    setAlertOnClose(onClose ? () => onClose : undefined);
    setAlertVisible(true);
  };

  // 촬영 결과물 화면 반영
  useEffect(() => {
    const uri  = route.params?.capturedUri  as string | undefined;
    const type = route.params?.capturedType as 'photo' | 'video' | undefined;
    if (uri && type) {
      setMedia({ uri, type: type === 'video' ? 'video' : 'image' });
    }
  }, [route.params?.capturedUri]);

  const handleSave = async () => {
    if (!media) { triggerAlert('알림', '사진 또는 영상을 선택해주세요. 🐾'); return; }
    try {
      setIsLoading(true);
      await createMemory(
        {
          memoryDate: date,
          memoryComment: comment,
          memoryWeather: weather ?? undefined,
          userMood: userMood ?? undefined,
          petMood: petMood ?? undefined,
        },
        media.uri,
      );
      triggerAlert('완료', '추억이 기록되었습니다. 🐾', undefined, () => navigation.goBack());
    } catch (e: any) {
      triggerAlert('오류', e.message || '저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

 const pickMedia = async (source: 'camera' | 'gallery', mediaType: 'image' | 'video' | 'all') => {
     console.log(`\n📸 [MediaPicker] 시작 - source: ${source}, type: ${mediaType}`);

     // 서브 모달 닫기
     setIsSheetVisible(false);

     // 1. 권한 확인
     const { status } = source === 'camera'
       ? await ImagePicker.requestCameraPermissionsAsync()
       : await ImagePicker.requestMediaLibraryPermissionsAsync();

     if (status !== 'granted') {
       Alert.alert('권한 필요', '접근 권한이 필요합니다.');
       return;
     }

     try {
       // 2. 미디어 타입 분기 처리 (안드로이드 호환성 핵심!)
       let mediaTypesOption: any;
       if (mediaType === 'image') mediaTypesOption = ['images'];
       else if (mediaType === 'video') mediaTypesOption = ['videos'];
       else mediaTypesOption = ['images', 'videos']; // 갤러리는 둘 다 허용

       const launchOpts: ImagePicker.ImagePickerOptions = {
         mediaTypes: mediaTypesOption,
         allowsEditing: Platform.OS === 'ios',
         quality: 0.8,
         videoMaxDuration: MAX_VIDEO_SECONDS,
         videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
       };

       console.log(`📸 [MediaPicker] 실행 옵션:`, JSON.stringify(launchOpts, null, 2));

       // 3. 실행
       const result = await (source === 'camera'
         ? ImagePicker.launchCameraAsync(launchOpts)
         : ImagePicker.launchImageLibraryAsync(launchOpts));

       if (result.canceled || !result.assets?.[0]) return;

       const asset = result.assets[0];
       const isVideo = asset.type === 'video';

       // 4. 검증 (기존 로직 유지)
       if (isVideo) {
         const v = validateVideoDuration((asset as any).duration);
         if (!v.ok) { Alert.alert('영상 길이 초과', v.reason!); return; }
       }

       const f = await validateFileSize(asset.uri);
       if (!f.ok) { Alert.alert('파일 용량 초과', f.reason!); return; }

       // 5. 완료
       setMedia({ uri: asset.uri, type: isVideo ? 'video' : 'image' });

     } catch (e: any) {
       console.log(`❌ [MediaPicker] 에러 발생:`, e);
       Alert.alert('오류', e.message || '미디어 선택 실패');
     }
   };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#4A3B32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{date}의 기록</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color="#FF6B6B" /> : <Text style={styles.saveText}>저장</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: isMemoFocused ? 400 : 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 미디어 카드 */}
          <TouchableOpacity style={styles.mediaCard} onPress={() => setIsSheetVisible(true)} activeOpacity={0.9}>
            {media ? (
              media.type === 'image' ? (
                <Image source={{ uri: media.uri }} style={styles.previewMedia} />
              ) : (
                <View>
                  <Video
                    source={{ uri: media.uri }} style={styles.previewMedia}
                    resizeMode={ResizeMode.COVER}
                    isMuted shouldPlay={false} useNativeControls
                  />
                  <View style={styles.videoBadge}>
                    <Ionicons name="videocam" size={12} color="#fff" />
                    <Text style={styles.videoBadgeText}>동영상</Text>
                  </View>
                </View>
              )
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.iconCircle}><Ionicons name="camera" size={32} color="#D1CCC5" /></View>
                <Text style={styles.placeholderText}>오늘의 사진이나 영상을 올려주세요</Text>
                <Text style={styles.placeholderSub}>동영상은 {MAX_VIDEO_SECONDS}초 이내, 50MB 이하</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>오늘 날씨는 어땠나요?</Text>
          <View style={styles.chipRow}>
            {WEATHER_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.code} style={[styles.chip, weather === opt.code && styles.chipSelected]} onPress={() => setWeather(weather === opt.code ? null : opt.code)}>
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.chipText, weather === opt.code && styles.chipTextSelected]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>나와 반려동물의 기분은?</Text>
          <View style={styles.moodRow}>
            <View style={styles.moodGroup}>
              <Text style={styles.moodSubLabel}>나의 기분</Text>
              <View style={styles.chipRowSmall}>
                {MOOD_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt.code} style={[styles.moodChip, userMood === opt.code && styles.moodChipSelected]} onPress={() => setUserMood(opt.code)}>
                    <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.moodGroup}>
              <Text style={styles.moodSubLabel}>반려동물 기분</Text>
              <View style={styles.chipRowSmall}>
                {MOOD_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt.code} style={[styles.moodChip, petMood === opt.code && styles.moodChipSelected]} onPress={() => setPetMood(opt.code)}>
                    <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Input
            label="오늘의 이야기"
            placeholder="어떤 일이 있었나요?"
            value={comment} onChangeText={setComment}
            multiline numberOfLines={5}
            style={styles.memoInput}
            onFocus={() => {
              setIsMemoFocused(true); // 🚨 여백 늘리기
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
            onBlur={() => setIsMemoFocused(false)} // 🚨 입력 끝나면 여백 원래대로 복구
          />
        </ScrollView>
      </KeyboardAvoidingView>

        {/* ======================================== */}
        {/* 1단계: 갤러리 OR 카메라 선택 모달 */}
        {/* ======================================== */}
        <Modal visible={isSheetVisible} transparent animationType="fade">
          <Pressable style={styles.sheetOverlay} onPress={() => setIsSheetVisible(false)}>
            <View style={[styles.sheetCard, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.sheetHandle} />

              {/* 🚨 수정: 카메라 선택 시 서브 모달 띄우기 */}
              <TouchableOpacity
                  style={styles.sheetItem}
                  onPress={() => {
                    setIsSheetVisible(false);
                    navigation.navigate('Camera', { date, mode: 'photo' });
                  }}
                >
                  <Ionicons name="camera-outline" size={24} color="#4A3B32" />
                  <Text style={styles.sheetText}>카메라로 직접 촬영하기</Text>
                  {/* 🚨 추가: 두 모드 모두 지원한다는 안내 문구 */}
                  <Text style={styles.sheetHint}>사진 · 동영상(5초)</Text>
                </TouchableOpacity>

              {/* 🚨 수정: 갤러리는 기존처럼 한 번에 (사진/영상 모두 보임) */}
              <TouchableOpacity style={styles.sheetItem} onPress={() => pickMedia('gallery', 'all')}>
                <Ionicons name="images-outline" size={24} color="#4A3B32" />
                <Text style={styles.sheetText}>갤러리에서 선택하기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        <CustomAlert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={() => { setAlertVisible(false); alertCloseHandler?.(); setAlertOnClose(undefined); }} onConfirm={alertConfirmHandler} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  headerBtn:   { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FontFamily.diary, fontSize: 24, color: '#4A3B32' },
  saveText:    { fontFamily: FontFamily.diary, fontSize: 22, color: '#FF6B6B' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },

  mediaCard: {
    backgroundColor: '#FFFFFF', padding: 12, borderRadius: 20, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: '#F0EBE1',
    shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  previewMedia: { width: '100%', height: 300, borderRadius: 12 },
  videoBadge: {
    position: 'absolute', top: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  videoBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  placeholder: { height: 200, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDFBF7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  placeholderText: { fontSize: 14, color: '#A0938A', fontWeight: '500' },
  placeholderSub:  { fontSize: 11, color: '#D1CCC5', marginTop: 4 },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#A0938A', marginBottom: 12, marginLeft: 4 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xl },
  chip:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F0EBE1' },
  chipSelected: { backgroundColor: '#FFB5B5', borderColor: '#FFB5B5' },
  chipEmoji:    { fontSize: 14, marginRight: 4 },
  chipText:     { fontSize: 12, color: '#4A3B32' },
  chipTextSelected:{ color: '#FFFFFF', fontWeight: 'bold' },

  moodRow:    { marginBottom: Spacing.xl, gap: 16 },
  moodGroup:  { gap: 8 },
  moodSubLabel: { fontSize: 12, color: '#A0938A', marginLeft: 4 },
  chipRowSmall: { flexDirection: 'row', gap: 6 },
  moodChip:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1' },
  moodChipSelected: { backgroundColor: '#FFFBF0', borderColor: '#FFC85C' },
  moodEmoji: { fontSize: 20 },

  memoInput: { fontFamily: FontFamily.diary, fontSize: 20, minHeight: 120, textAlignVertical: 'top' },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetCard:    { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHandle:  { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5DED5', marginBottom: 20 },
  sheetItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  sheetText:    { fontSize: 16, fontWeight: '600', color: '#4A3B32', flex: 1 },
  sheetHint:    { fontSize: 11, color: '#A0938A' },
});

export default MemoryCreateScreen;
