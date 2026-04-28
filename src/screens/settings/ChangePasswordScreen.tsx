/**
 * =========================================
 * 비밀번호 변경 화면 (ChangePasswordScreen.tsx)
 * =========================================
 *
 */

 import React, { useState } from 'react';
 import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing } from '@constants/typography';
 import { Input, Button } from '@components/common';
 import { changePassword } from '@services/userService';

 export const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
   const [current, setCurrent] = useState('');
   const [next, setNext] = useState('');
   const [confirm, setConfirm] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   const handleSave = async () => {
     if (!current || !next || !confirm) { Alert.alert('알림', '모든 항목을 입력해주세요.'); return; }
     if (next !== confirm) { Alert.alert('알림', '새 비밀번호가 일치하지 않습니다.'); return; }
     if (next.length < 8) { Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.'); return; }
     try {
       setIsLoading(true);
       await changePassword({ currentPassword: current, newPassword: next });
       Alert.alert('완료', '비밀번호가 변경되었습니다.', [
         { text: '확인', onPress: () => navigation.goBack() },
       ]);
     } catch (e: any) {
       Alert.alert('오류', e.message || '변경 실패');
     } finally {
       setIsLoading(false);
     }
   };

   return (
     <SafeAreaView style={styles.container}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>비밀번호 변경</Text>
         <View style={styles.headerBtn} />
       </View>

       <View style={styles.content}>
         <Input label="현재 비밀번호" placeholder="현재 비밀번호" value={current} onChangeText={setCurrent} secureTextEntry />
         <Input label="새 비밀번호" placeholder="8자 이상" value={next} onChangeText={setNext} secureTextEntry />
         <Input label="새 비밀번호 확인" placeholder="새 비밀번호 재입력" value={confirm} onChangeText={setConfirm} secureTextEntry />
         <Button title="변경" onPress={handleSave} loading={isLoading} style={styles.saveBtn} />
       </View>
     </SafeAreaView>
   );
 };

 const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: Colors.background },
   header: {
     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
     paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
   },
   headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
   headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
   content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
   saveBtn: { marginTop: Spacing.xl },
 });

 export default ChangePasswordScreen;