/**
 * =========================================
 * 프로필 수정 화면 (EditProfileScreen.tsx)
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
 import { useAuth } from '@context/AuthContext';
 import { updateMyInfo } from '@services/userService';

 export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
   const { user, updateUser } = useAuth();
   const [userName, setUserName] = useState(user?.userName || '');
   const [phone, setPhone] = useState(user?.phone || '');
   const [isLoading, setIsLoading] = useState(false);

   const handleSave = async () => {
     if (!userName.trim()) { Alert.alert('알림', '반려동물 이름을 입력해주세요.'); return; }
     try {
       setIsLoading(true);
       const updated = await updateMyInfo({ userName, phone });
       updateUser(updated);
       Alert.alert('완료', '프로필이 수정되었습니다.', [
         { text: '확인', onPress: () => navigation.goBack() },
       ]);
     } catch (e: any) {
       Alert.alert('오류', e.message || '수정 실패');
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
         <Text style={styles.headerTitle}>프로필 수정</Text>
         <View style={styles.headerBtn} />
       </View>

       <View style={styles.content}>
         <View style={styles.avatarContainer}>
           <Text style={styles.avatarEmoji}>🐾</Text>
         </View>
         <Input label="반려동물 이름" placeholder="이름 입력" value={userName} onChangeText={setUserName} />
         <Input label="연락처" placeholder="010-0000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
         <Button title="저장" onPress={handleSave} loading={isLoading} style={styles.saveBtn} />
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
   avatarContainer: { alignItems: 'center', marginBottom: Spacing.xxl },
   avatarEmoji: { fontSize: 72 },
   saveBtn: { marginTop: Spacing.xl },
 });

 export default EditProfileScreen;