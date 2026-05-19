/**
 * =========================================
 * 공통 알림창 컴포넌트 (CustomAlert.tsx)
 * =========================================
 *
 * 앱 전체에서 사용되는 일관된 스타일의 알림창 컴포넌트입니다.
 *
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '@constants/colors';
import { FontFamily, BorderRadius, Spacing } from '@constants/typography';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void; // 선택 시 확인 버튼 동작 (Confirm 모드용)
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Pressable로 감싸서 카드 내부 클릭 시에는 안 닫히게 방지 */}
        <Pressable style={styles.alertCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  alertCard: {
    width: '80%', backgroundColor: '#FFFDF9', borderRadius: 20,
    padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1',
    elevation: 5, shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  title: { fontFamily: FontFamily.diary, fontSize: 22, color: '#4A3B32', marginBottom: Spacing.sm, textAlign: 'center' },
  message: { fontSize: 14, color: '#A0938A', textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  button: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#F0EBE1' },
  cancelButtonText: { color: '#A0938A', fontWeight: 'bold', fontSize: 14 },
  confirmButton: { backgroundColor: '#FF6B6B' },
  confirmButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});