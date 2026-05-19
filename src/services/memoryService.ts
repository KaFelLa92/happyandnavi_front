/**
 * =========================================
 * 추억일기 서비스 (memoryService.ts)
 * =========================================
 * 
 * 추억일기 CRUD 및 캘린더 데이터 조회 API를 담당합니다.
 */

import { API_ENDPOINTS, debugLog } from '../constants/config';
import { get, del, postFormData, putFormData } from './api';
import {
  Memory,
  CreateMemoryRequest,
  UpdateMemoryRequest,
  MemoryCalendarItem,
  PageResponse,
} from '../types';

// ============================================
// FormData 헬퍼: undefined/null이 아닌 필드만 append
// ============================================

const appendIfDefined = (formData: FormData, key: string, value: any) => {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, String(value));
};

// ============================================
// MIME 타입 헬퍼
// ============================================
/**
 * URI에서 MIME 타입 추출
 * @param uri    파일 URI
 * @param kind   'image' | 'video'
 */
const resolveMimeType = (uri: string, kind: 'image' | 'video'): string => {
  const ext = (uri.split('/').pop() ?? '').split('.').pop()?.toLowerCase() ?? '';

  if (kind === 'video') {
    const videoMimes: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
    };
    return videoMimes[ext] ?? 'video/mp4';
  }

  const imageMimes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  };
  return imageMimes[ext] ?? 'image/jpeg';
};

/**
 * URI에서 파일명 추출 (없으면 기본값)
 */
const resolveFilename = (uri: string, kind: 'image' | 'video'): string => {
  const basename = uri.split('/').pop();
  if (basename && basename.includes('.')) return basename;
  return kind === 'video' ? 'memory_video.mp4' : 'memory_image.jpg';
};

// ============================================
// 추억일기 생성
// ============================================

/**
 * 추억일기 생성
 *
 * multipart/form-data 평면 필드로 전송합니다.
 * 사진 또는 동영상(최대 5초) 모두 지원합니다.
 *
 * @param request   추억일기 데이터
 * @param mediaUri  사진/동영상 파일 URI
 * @param mediaType 'image' | 'video' (기본: 'image')
 * @returns 생성된 추억일기
 */
export const createMemory = async (data: any, uri: string) => {
  const formData = new FormData();

  // 필수 값
  formData.append('memoryDate', data.memoryDate);

  // 선택 값 (값이 있을 때만 append)
  if (data.memoryComment) formData.append('memoryComment', data.memoryComment);
  if (data.memoryWeather) formData.append('memoryWeather', String(data.memoryWeather));
  if (data.userMood) formData.append('userMood', String(data.userMood));
  if (data.petMood) formData.append('petMood', String(data.petMood));

  // 미디어 파일 파싱
  const filename = uri.split('/').pop() || 'media.jpg';
  let type = 'image/jpeg';
  if (filename.toLowerCase().endsWith('.mp4')) type = 'video/mp4';
  else if (filename.toLowerCase().endsWith('.mov')) type = 'video/quicktime';
  else if (filename.toLowerCase().endsWith('.png')) type = 'image/png';

  formData.append('image', {
    uri: uri,
    name: filename,
    type: type,
  } as any);

  // 전송
  const response = await postFormData(API_ENDPOINTS.MEMORY.BASE, formData);
  return response;
};

// ============================================
// 추억일기 조회
// ============================================

export const getMemory = async (memoryId: number): Promise<Memory> => {
  try {
    debugLog('추억일기 상세 조회:', memoryId);
    const response = await get<Memory>(`${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`);
    if (response.success && response.data) return response.data;
    throw new Error(response.message || '추억일기를 찾을 수 없습니다.');
  } catch (error: any) {
    debugLog('추억일기 상세 조회 실패:', error.message);
    throw error;
  }
};

export const getMemories = async (
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<Memory>> => {
  try {
    debugLog('추억일기 목록 조회:', { page, size });
    const response = await get<PageResponse<Memory>>(API_ENDPOINTS.MEMORY.BASE, { page, size });
    if (response.success && response.data) return response.data;
    throw new Error(response.message || '추억일기 목록을 가져올 수 없습니다.');
  } catch (error: any) {
    debugLog('추억일기 목록 조회 실패:', error.message);
    throw error;
  }
};

export const getCalendarData = async (
  year: number,
  month: number,
): Promise<MemoryCalendarItem[]> => {
  try {
    debugLog('추억일기 캘린더 조회:', { year, month });
    const response = await get<MemoryCalendarItem[]>(
      API_ENDPOINTS.MEMORY.CALENDAR, { year, month },
    );
    if (response.success && response.data) return response.data;
    return [];
  } catch (error: any) {
    debugLog('추억일기 캘린더 조회 실패:', error.message);
    return [];
  }
};

export const getMemoriesByYear = async (year: number): Promise<Memory[]> => {
  try {
    debugLog('연도별 추억일기 조회:', year);
    const response = await get<Memory[]>(`${API_ENDPOINTS.MEMORY.YEAR}/${year}`);
    if (response.success && response.data) return response.data;
    return [];
  } catch (error: any) {
    debugLog('연도별 추억일기 조회 실패:', error.message);
    return [];
  }
};

export const searchMemories = async (keyword: string): Promise<Memory[]> => {
  try {
    debugLog('추억일기 검색:', keyword);
    const response = await get<Memory[]>(API_ENDPOINTS.MEMORY.SEARCH, { keyword });
    if (response.success && response.data) return response.data;
    return [];
  } catch (error: any) {
    debugLog('추억일기 검색 실패:', error.message);
    throw error;
  }
};

// ============================================
// 추억일기 수정
// ============================================

/**
 * 추억일기 수정
 *
 * 260508: mediaType 파라미터 추가 (동영상 수정 미지원 — 정책상 미디어 변경 불가)
 * ⚠️ 수정 시 미디어 파일 변경은 정책상 불가 (코멘트/날씨/기분만 수정)
 */
export const updateMemory = async (memoryId: number, data: any) => {
  const formData = new FormData();

  // 수정 필드들 (값이 있을 때만 append)
  if (data.memoryDate) formData.append('memoryDate', data.memoryDate);
  if (data.memoryComment) formData.append('memoryComment', data.memoryComment);
  if (data.memoryWeather) formData.append('memoryWeather', String(data.memoryWeather));
  if (data.userMood) formData.append('userMood', String(data.userMood));
  if (data.petMood) formData.append('petMood', String(data.petMood));

  const response = await putFormData(`${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`, formData);
  return response;
};

// ============================================
// 추억일기 삭제
// ============================================

export const deleteMemory = async (memoryId: number): Promise<void> => {
  try {
    debugLog('추억일기 삭제:', memoryId);
    const response = await del<void>(`${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`);
    if (response.success) { debugLog('추억일기 삭제 완료'); return; }
    throw new Error(response.message || '추억일기 삭제에 실패했습니다.');
  } catch (error: any) {
    debugLog('추억일기 삭제 실패:', error.message);
    throw error;
  }
};
