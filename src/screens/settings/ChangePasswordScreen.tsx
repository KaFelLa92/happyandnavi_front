/**
 * =========================================
 * 비밀번호 변경 화면 (ChangePasswordScreen.tsx)
 * =========================================
 *
 */

 import React, { useState } from 'react';
 import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Spacing } from '@constants/typography';
 import { Input, Button } from '@components/common';
 import { changePassword } from '@services/userService';

 export const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
   const [current, setCurrent] = useState('');
   const [next,    setNext]    = useState('');
   const [confirm, setConfirm] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   const handleSave = async () => {
     if (!current || !next || !confirm) { Alert.alert('알림', '모든 항목을 입력해주세요.'); return; }
     if (next !== confirm) { Alert.alert('알림', '새 비밀번호가 일치하지 않습니다.'); return; }
     if (next.length < 8)  { Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.'); return; }
     try {
       setIsLoading(true);
       await changePassword({ currentPassword: current, newPassword: next });
       Alert.alert('완료', '비밀번호가 변경되었습니다. 🔒', [
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
       {/* 헤더 */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color="#4A3B32" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>비밀번호 변경</Text>
         <View style={styles.headerBtn} />
       </View>

       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         {/* 안내 카드 */}
         <View style={styles.infoCard}>
           <View style={styles.infoIconBg}>
             <Ionicons name="lock-closed-outline" size={24} color="#4FC3F7" />
           </View>
           <Text style={styles.infoText}>{'안전한 비밀번호로 계정을\n보호하세요.'}</Text>
         </View>

         {/* 입력 카드 */}
         <View style={styles.formCard}>
           <Input
             label="현재 비밀번호"
             placeholder="현재 비밀번호를 입력해주세요"
             value={current}
             onChangeText={setCurrent}
             secureTextEntry
           />
           <Input
             label="새 비밀번호"
             placeholder="8자 이상 입력해주세요"
             value={next}
             onChangeText={setNext}
             secureTextEntry
           />
           <Input
             label="새 비밀번호 확인"
             placeholder="새 비밀번호를 다시 입력해주세요"
             value={confirm}
             onChangeText={setConfirm}
             secureTextEntry
           />
         </View>

         <Button
           title="비밀번호 변경"
           onPress={handleSave}
           loading={isLoading}
           style={styles.saveBtn}
         />
       </ScrollView>
     </SafeAreaView>
   );
 };

 const styles = StyleSheet.create({
   container:     { flex: 1, backgroundColor: '#FDFBF7' },
   header: {
     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
     paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
   },
   headerBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
   headerTitle:   { fontSize: 17, fontWeight: 'bold', color: '#4A3B32' },
   scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

   infoCard: {
     flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
     backgroundColor: '#EFF9FF', borderRadius: 20, padding: Spacing.xl,
     marginBottom: Spacing.xl, borderWidth: 1, borderColor: '#B3E5FC',
   },
   infoIconBg: {
     width: 52, height: 52, borderRadius: 26,
     backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
   },
   infoText: { flex: 1, fontSize: 14, color: '#4A3B32', lineHeight: 22 },

   formCard: {
     backgroundColor: '#FFFFFF', borderRadius: 20, padding: Spacing.lg,
     borderWidth: 1, borderColor: '#F0EBE1', marginBottom: Spacing.xl,
     shadowColor: '#4A3B32', shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
   },
   saveBtn: { backgroundColor: '#4FC3F7', borderRadius: 16 },
 });

 export default ChangePasswordScreen;

