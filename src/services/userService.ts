/**
 * =========================================
 * 사용자 서비스 (userService.ts)
 * =========================================
 * 
 * 사용자 정보 조회, 수정, 설정 변경 등 사용자 관련 API를 담당합니다.
 */

import { API_ENDPOINTS, debugLog } from '../constants/config';
import { get, put, del } from './api';
import { User } from '../types';
import { saveUserInfo } from './authService';

// ============================================
// 사용자 정보 조회
// ============================================

/**
 * 내 정보 조회
 * 
 * @returns 현재 로그인한 사용자 정보
 */
export const getMyInfo = async (): Promise<User> => {
  try {
    debugLog('내 정보 조회');
    
    const response = await get<User>(API_ENDPOINTS.USER.ME);
    
    if (response.success && response.data) {
      // 로컬 저장소에도 업데이트
      await saveUserInfo(response.data);
      return response.data;
    }
    
    throw new Error(response.message || '사용자 정보를 가져올 수 없습니다.');
  } catch (error: any) {
    debugLog('내 정보 조회 실패:', error.message);
    throw error;
  }
};

// ============================================
// 사용자 정보 수정
// ============================================

/**
 * 사용자 정보 수정 요청 타입
 */
interface UpdateUserRequest {
  userName?: string;
  phone?: string;
}

/**
 * 사용자 정보 수정
 * 
 * @param request - 수정할 정보 (반려동물 이름, 연락처)
 * @returns 수정된 사용자 정보
 */
export const updateMyInfo = async (request: UpdateUserRequest): Promise<User> => {
  try {
    debugLog('사용자 정보 수정:', request);
    
    const response = await put<User>(API_ENDPOINTS.USER.UPDATE, request);
    
    if (response.success && response.data) {
      // 로컬 저장소에도 업데이트
      await saveUserInfo(response.data);
      debugLog('사용자 정보 수정 완료');
      return response.data;
    }
    
    throw new Error(response.message || '정보 수정에 실패했습니다.');
  } catch (error: any) {
    debugLog('사용자 정보 수정 실패:', error.message);
    throw error;
  }
};

// ============================================
// 비밀번호 변경
// ============================================

/**
 * 비밀번호 변경 요청 타입
 */
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경
 * 
 * @param request - 현재 비밀번호, 새 비밀번호
 */
export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  try {
    debugLog('비밀번호 변경 시도');
    
    const response = await put<void>(API_ENDPOINTS.USER.PASSWORD, request);
    
    if (response.success) {
      debugLog('비밀번호 변경 완료');
      return;
    }
    
    throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
  } catch (error: any) {
    debugLog('비밀번호 변경 실패:', error.message);
    throw error;
  }
};

// ============================================
// 설정 변경
// ============================================

/**
 * 알림 설정 변경 요청 타입
 */
interface UpdateSettingsRequest {
  scheduleSet: number; // 1: 켜짐, 0: 꺼짐
}

/**
 * 알림 설정 변경
 * 
 * @param scheduleSet - 알림 설정 (1: 켜짐, 0: 꺼짐)
 */
export const updateNotificationSettings = async (scheduleSet: number): Promise<void> => {
  try {
    debugLog('알림 설정 변경:', scheduleSet);
    
    const response = await put<void>(
      API_ENDPOINTS.USER.SETTINGS,
      { scheduleSet }
    );
    
    if (response.success) {
      debugLog('알림 설정 변경 완료');
      return;
    }
    
    throw new Error(response.message || '설정 변경에 실패했습니다.');
  } catch (error: any) {
    debugLog('알림 설정 변경 실패:', error.message);
    throw error;
  }
};

// ============================================
// 회원 탈퇴
// ============================================

/**
 * 회원 탈퇴 요청 타입
 */
interface DeleteAccountRequest {
  password?: string; // 일반 회원만 필요
}

/**
 * 회원 탈퇴
 * 
 * @param password - 비밀번호 (일반 회원의 경우 필요)
 */
export const deleteAccount = async (password?: string): Promise<void> => {
  try {
    debugLog('회원 탈퇴 시도');
    
    // DELETE 요청에 body를 포함하기 위해 axios를 직접 사용
    const response = await del<void>(API_ENDPOINTS.USER.DELETE);
    
    if (response.success) {
      debugLog('회원 탈퇴 완료');
      return;
    }
    
    throw new Error(response.message || '회원 탈퇴에 실패했습니다.');
  } catch (error: any) {
    debugLog('회원 탈퇴 실패:', error.message);
    throw error;
  }
};
