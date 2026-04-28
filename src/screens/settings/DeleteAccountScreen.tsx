/**
 * =========================================
 * 회원 탈퇴 화면 (DeleteAccountScreen.tsx)
 * =========================================
 *
 */

 import React, { useState } from 'react';
 import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { Ionicons } from '@expo/vector-icons';
 import { Colors } from '@constants/colors';
 import { FontSize, FontWeight, Spacing, BorderRadius } from '@constants/typography';
 import { Input, Button } from '@components/common';
 import { useAuth } from '@context/AuthContext';
 import { deleteAccount } from '@services/userService';

 export const DeleteAccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
   const { user, logout } = useAuth();
   const isNormal = user?.signupType === 1;
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   const handleDelete = () => {
     Alert.alert(
       '회원 탈퇴',
       '모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?',
       [
         { text: '취소', style: 'cancel' },
         {
           text: '탈퇴', style: 'destructive', onPress: async () => {
             try {
               setIsLoading(true);
               await deleteAccount(isNormal ? password : undefined);
               await logout();
             } catch (e: any) {
               Alert.alert('오류', e.message || '탈퇴 실패');
               setIsLoading(false);
             }
           },
         },
       ]
     );
   };

   return (
     <SafeAreaView style={styles.container}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>회원 탈퇴</Text>
         <View style={styles.headerBtn} />
       </View>

       <View style={styles.content}>
         <View style={styles.warningBox}>
           <Ionicons name="warning-outline" size={32} color={Colors.error} />
           <Text style={styles.warningTitle}>정말 탈퇴하시겠습니까?</Text>
           <Text style={styles.warningDesc}>
             {'탈퇴 시 모든 추억일기와 약속일기가\n영구적으로 삭제됩니다.'}
           </Text>
         </View>

         {isNormal && (
           <Input
             label="비밀번호 확인"
             placeholder="현재 비밀번호를 입력해주세요"
             value={password}
             onChangeText={setPassword}
             secureTextEntry
           />
         )}

         <Button
           title="회원 탈퇴"
           onPress={handleDelete}
           loading={isLoading}
           style={styles.deleteBtn}
           textStyle={styles.deleteBtnText}
         />
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
   warningBox: {
     alignItems: 'center', backgroundColor: '#FFF5F5',
     borderRadius: BorderRadius.xl, padding: Spacing.xxl, marginBottom: Spacing.xxl,
   },
   warningTitle: {
     fontSize: FontSize.xl, fontWeight: FontWeight.bold,
     color: Colors.error, marginTop: Spacing.md,
   },
   warningDesc: {
     fontSize: FontSize.md, color: Colors.textSecondary,
     textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22,
   },
   deleteBtn: { marginTop: Spacing.xl, backgroundColor: Colors.error },
   deleteBtnText: { color: '#fff' },
 });

 export default DeleteAccountScreen;