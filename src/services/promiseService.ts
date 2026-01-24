/**
 * =========================================
 * 약속일기(일정) 서비스 (promiseService.ts)
 * =========================================
 * 
 * 약속일기/일정 CRUD 및 캘린더 데이터 조회 API를 담당합니다.
 */

import { API_ENDPOINTS, debugLog } from '../constants/config';
import { get, post, put, del } from './api';
import {
  Promise as PromiseType,
  CreatePromiseRequest,
  UpdatePromiseRequest,
  PromiseCalendarItem,
} from '../types';

// ============================================
// 일정 생성
// ============================================

/**
 * 일정 생성
 * 
 * @param request - 일정 데이터
 * @returns 생성된 일정
 */
export const createPromise = async (
  request: CreatePromiseRequest
): Promise<PromiseType> => {
  try {
    debugLog('일정 생성:', request.promiseTitle);
    
    const response = await post<PromiseType>(
      API_ENDPOINTS.PROMISE.BASE,
      request
    );
    
    if (response.success && response.data) {
      debugLog('일정 생성 완료:', response.data.promiseId);
      return response.data;
    }
    
    throw new Error(response.message || '일정 등록에 실패했습니다.');
  } catch (error: any) {
    debugLog('일정 생성 실패:', error.message);
    throw error;
  }
};

// ============================================
// 일정 조회
// ============================================

/**
 * 일정 상세 조회
 * 
 * @param promiseId - 일정 ID
 * @returns 일정 상세 정보
 */
export const getPromise = async (promiseId: number): Promise<PromiseType> => {
  try {
    debugLog('일정 상세 조회:', promiseId);
    
    const response = await get<PromiseType>(
      `${API_ENDPOINTS.PROMISE.BASE}/${promiseId}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || '일정을 찾을 수 없습니다.');
  } catch (error: any) {
    debugLog('일정 상세 조회 실패:', error.message);
    throw error;
  }
};

/**
 * 전체 일정 조회
 * 
 * @returns 모든 일정 목록
 */
export const getAllPromises = async (): Promise<PromiseType[]> => {
  try {
    debugLog('전체 일정 조회');
    
    const response = await get<PromiseType[]>(API_ENDPOINTS.PROMISE.BASE);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('전체 일정 조회 실패:', error.message);
    return [];
  }
};

/**
 * 월별 캘린더 일정 조회
 * 
 * @param year - 연도
 * @param month - 월 (1~12)
 * @returns 캘린더 일정 목록
 */
export const getCalendarData = async (
  year: number,
  month: number
): Promise<PromiseCalendarItem[]> => {
  try {
    debugLog('일정 캘린더 조회:', { year, month });
    
    const response = await get<PromiseCalendarItem[]>(
      API_ENDPOINTS.PROMISE.CALENDAR,
      { year, month }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('일정 캘린더 조회 실패:', error.message);
    return [];
  }
};

/**
 * 오늘 일정 조회
 * 
 * @returns 오늘 일정 목록
 */
export const getTodayPromises = async (): Promise<PromiseType[]> => {
  try {
    debugLog('오늘 일정 조회');
    
    const response = await get<PromiseType[]>(API_ENDPOINTS.PROMISE.TODAY);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('오늘 일정 조회 실패:', error.message);
    return [];
  }
};

/**
 * 다가오는 일정 조회
 * 
 * @param limit - 조회할 개수 (기본값: 5)
 * @returns 다가오는 일정 목록
 */
export const getUpcomingPromises = async (
  limit: number = 5
): Promise<PromiseType[]> => {
  try {
    debugLog('다가오는 일정 조회:', limit);
    
    const response = await get<PromiseType[]>(
      API_ENDPOINTS.PROMISE.UPCOMING,
      { limit }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('다가오는 일정 조회 실패:', error.message);
    return [];
  }
};

/**
 * 일정 검색
 * 
 * @param keyword - 검색 키워드
 * @returns 검색 결과 목록
 */
export const searchPromises = async (keyword: string): Promise<PromiseType[]> => {
  try {
    debugLog('일정 검색:', keyword);
    
    const response = await get<PromiseType[]>(
      API_ENDPOINTS.PROMISE.SEARCH,
      { keyword }
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error: any) {
    debugLog('일정 검색 실패:', error.message);
    throw error;
  }
};

// ============================================
// 일정 수정
// ============================================

/**
 * 일정 수정
 * 
 * @param promiseId - 일정 ID
 * @param request - 수정할 데이터
 * @returns 수정된 일정
 */
export const updatePromise = async (
  promiseId: number,
  request: UpdatePromiseRequest
): Promise<PromiseType> => {
  try {
    debugLog('일정 수정:', promiseId);
    
    const response = await put<PromiseType>(
      `${API_ENDPOINTS.PROMISE.BASE}/${promiseId}`,
      request
    );
    
    if (response.success && response.data) {
      debugLog('일정 수정 완료');
      return response.data;
    }
    
    throw new Error(response.message || '일정 수정에 실패했습니다.');
  } catch (error: any) {
    debugLog('일정 수정 실패:', error.message);
    throw error;
  }
};

// ============================================
// 일정 삭제
// ============================================

/**
 * 일정 삭제
 * 
 * @param promiseId - 일정 ID
 */
export const deletePromise = async (promiseId: number): Promise<void> => {
  try {
    debugLog('일정 삭제:', promiseId);
    
    const response = await del<void>(
      `${API_ENDPOINTS.PROMISE.BASE}/${promiseId}`
    );
    
    if (response.success) {
      debugLog('일정 삭제 완료');
      return;
    }
    
    throw new Error(response.message || '일정 삭제에 실패했습니다.');
  } catch (error: any) {
    debugLog('일정 삭제 실패:', error.message);
    throw error;
  }
};
