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
// 추억일기 생성
// ============================================

/**
 * 추억일기 생성
 * 
 * multipart/form-data 형식으로 이미지와 함께 전송합니다.
 * 
 * @param request - 추억일기 데이터
 * @param imageUri - 이미지 파일 URI
 * @returns 생성된 추억일기
 */
export const createMemory = async (
  request: CreateMemoryRequest,
  imageUri: string
): Promise<Memory> => {
  try {
    debugLog('추억일기 생성:', request.memoryDate);
    
    // FormData 생성
    const formData = new FormData();
    
    // JSON 데이터를 Blob으로 추가
    formData.append('data', JSON.stringify(request));
    
    // 이미지 파일 추가
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    const response = await postFormData<Memory>(
      API_ENDPOINTS.MEMORY.BASE,
      formData
    );
    
    if (response.success && response.data) {
      debugLog('추억일기 생성 완료:', response.data.memoryId);
      return response.data;
    }
    
    throw new Error(response.message || '추억일기 등록에 실패했습니다.');
  } catch (error: any) {
    debugLog('추억일기 생성 실패:', error.message);
    throw error;
  }
};

// ============================================
// 추억일기 조회
// ============================================

/**
 * 추억일기 상세 조회
 * 
 * @param memoryId - 추억일기 ID
 * @returns 추억일기 상세 정보
 */
export const getMemory = async (memoryId: number): Promise<Memory> => {
  try {
    debugLog('추억일기 상세 조회:', memoryId);
    
    const response = await get<Memory>(
      `${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '추억일기를 찾을 수 없습니다.');
  } catch (error: any) {
    debugLog('추억일기 상세 조회 실패:', error.message);
    throw error;
  }
};

/**
 * 추억일기 목록 조회 (페이징)
 * 
 * @param page - 페이지 번호 (0부터 시작)
 * @param size - 페이지 크기
 * @returns 페이징된 추억일기 목록
 */
export const getMemories = async (
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Memory>> => {
  try {
    debugLog('추억일기 목록 조회:', { page, size });
    
    const response = await get<PageResponse<Memory>>(
      API_ENDPOINTS.MEMORY.BASE,
      { page, size }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '추억일기 목록을 가져올 수 없습니다.');
  } catch (error: any) {
    debugLog('추억일기 목록 조회 실패:', error.message);
    throw error;
  }
};

/**
 * 월별 캘린더 데이터 조회
 * 
 * 캘린더 UI에 표시할 썸네일 데이터를 반환합니다.
 * 
 * @param year - 연도
 * @param month - 월 (1~12)
 * @returns 캘린더 아이템 목록
 */
export const getCalendarData = async (
  year: number,
  month: number
): Promise<MemoryCalendarItem[]> => {
  try {
    debugLog('추억일기 캘린더 조회:', { year, month });
    
    const response = await get<MemoryCalendarItem[]>(
      API_ENDPOINTS.MEMORY.CALENDAR,
      { year, month }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // 데이터가 없는 경우 빈 배열 반환
    return [];
  } catch (error: any) {
    debugLog('추억일기 캘린더 조회 실패:', error.message);
    return [];
  }
};

/**
 * 연도별 추억일기 조회
 * 
 * @param year - 연도
 * @returns 해당 연도의 추억일기 목록
 */
export const getMemoriesByYear = async (year: number): Promise<Memory[]> => {
  try {
    debugLog('연도별 추억일기 조회:', year);
    
    const response = await get<Memory[]>(
      `${API_ENDPOINTS.MEMORY.YEAR}/${year}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('연도별 추억일기 조회 실패:', error.message);
    return [];
  }
};

/**
 * 추억일기 검색
 * 
 * @param keyword - 검색 키워드
 * @returns 검색 결과 목록
 */
export const searchMemories = async (keyword: string): Promise<Memory[]> => {
  try {
    debugLog('추억일기 검색:', keyword);
    
    const response = await get<Memory[]>(
      API_ENDPOINTS.MEMORY.SEARCH,
      { keyword }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
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
 * @param memoryId - 추억일기 ID
 * @param request - 수정할 데이터
 * @param imageUri - 새 이미지 URI (선택)
 * @returns 수정된 추억일기
 */
export const updateMemory = async (
  memoryId: number,
  request: UpdateMemoryRequest,
  imageUri?: string
): Promise<Memory> => {
  try {
    debugLog('추억일기 수정:', memoryId);
    
    // FormData 생성
    const formData = new FormData();
    
    // JSON 데이터 추가
    formData.append('data', JSON.stringify(request));
    
    // 새 이미지가 있는 경우 추가
    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }
    
    const response = await putFormData<Memory>(
      `${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`,
      formData
    );
    
    if (response.success && response.data) {
      debugLog('추억일기 수정 완료');
      return response.data;
    }
    
    throw new Error(response.message || '추억일기 수정에 실패했습니다.');
  } catch (error: any) {
    debugLog('추억일기 수정 실패:', error.message);
    throw error;
  }
};

// ============================================
// 추억일기 삭제
// ============================================

/**
 * 추억일기 삭제
 * 
 * @param memoryId - 추억일기 ID
 */
export const deleteMemory = async (memoryId: number): Promise<void> => {
  try {
    debugLog('추억일기 삭제:', memoryId);
    
    const response = await del<void>(
      `${API_ENDPOINTS.MEMORY.BASE}/${memoryId}`
    );
    
    if (response.success) {
      debugLog('추억일기 삭제 완료');
      return;
    }
    
    throw new Error(response.message || '추억일기 삭제에 실패했습니다.');
  } catch (error: any) {
    debugLog('추억일기 삭제 실패:', error.message);
    throw error;
  }
};
