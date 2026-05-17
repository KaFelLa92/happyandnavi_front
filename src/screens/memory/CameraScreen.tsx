/**
 * =========================================
 * 추억일기 등록 카메라 UI 화면 (CameraScreen.tsx)
 * =========================================
 *
 * 추억일기 등록에서 카메라 촬영 시 사용하는 화면입니다.
 * 사진 / 동영상(5초 이내) 등록 가능합니다.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const MAX_VIDEO_SECONDS = 5;

type CameraMode = 'photo' | 'video';

export const CameraScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { date, mode: initialMode = 'photo' } = route.params as { date: string; mode: CameraMode };

  const [cameraPermission,    requestCameraPermission]    = useCameraPermissions();
  const [micPermission,       requestMicPermission]       = useMicrophonePermissions();
  const [facing,              setFacing]                  = useState<CameraType>('back');
  const [mode,                setMode]                    = useState<CameraMode>(initialMode);
  const [isRecording,         setIsRecording]             = useState(false);
  const [elapsed,             setElapsed]                 = useState(0);
  const [isCameraReady,       setIsCameraReady]           = useState(false);
  const [isBusy,              setIsBusy]                  = useState(false);

  const cameraRef   = useRef<CameraView>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current)    clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const requestPermissions = useCallback(async () => {
    const cam = await requestCameraPermission();
    const mic = await requestMicPermission();
    if (!cam.granted || !mic.granted) {
      Alert.alert('권한 필요', '카메라와 마이크 권한이 모두 필요해요.');
    }
  }, [requestCameraPermission, requestMicPermission]);

  const startElapsedTimer = useCallback(() => {
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        return next > MAX_VIDEO_SECONDS ? MAX_VIDEO_SECONDS : next;
      });
    }, 100);
  }, []);

  const stopElapsedTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current)    { clearTimeout(timerRef.current);  timerRef.current = null; }
    stopElapsedTimer();
    cameraRef.current?.stopRecording();
    setIsRecording(false);
  }, [stopElapsedTimer]);

  const handleCaptureDone = useCallback((uri: string, type: 'photo' | 'video') => {
    navigation.navigate('MemoryCreate', {
      date,
      capturedUri:  uri,
      capturedType: type,
    });
  }, [navigation, date]);

  const takePhoto = useCallback(async () => {
    if (!isCameraReady || isBusy) return;
    try {
      setIsBusy(true);
      const photo = await cameraRef.current!.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) handleCaptureDone(photo.uri, 'photo');
    } catch (e: any) {
      Alert.alert('오류', e.message || '사진 촬영 실패');
    } finally {
      setIsBusy(false);
    }
  }, [isCameraReady, isBusy, handleCaptureDone]);

  const startVideoRecording = useCallback(async () => {
    if (!isCameraReady || isBusy || isRecording) return;
    try {
      setIsRecording(true);
      setIsBusy(true);
      startElapsedTimer();

      timerRef.current = setTimeout(() => stopRecording(), MAX_VIDEO_SECONDS * 1000);

      const video = await cameraRef.current!.recordAsync({ maxDuration: MAX_VIDEO_SECONDS });

      stopElapsedTimer();
      setIsRecording(false);
      setIsBusy(false);

      if (video?.uri) handleCaptureDone(video.uri, 'video');
    } catch (e: any) {
      stopElapsedTimer();
      setIsRecording(false);
      setIsBusy(false);
      if (!String(e.message).includes('Recording was stopped')) {
        Alert.alert('오류', e.message || '영상 녹화 실패');
      }
    }
  }, [isCameraReady, isBusy, isRecording, startElapsedTimer, stopElapsedTimer, stopRecording, handleCaptureDone]);

  const handleShutter = useCallback(() => {
    if (mode === 'photo') {
      takePhoto();
    } else {
      if (isRecording) stopRecording();
      else startVideoRecording();
    }
  }, [mode, isRecording, takePhoto, stopRecording, startVideoRecording]);

  const toggleFacing = useCallback(() => {
    setFacing(f => f === 'back' ? 'front' : 'back');
  }, []);

  if (!cameraPermission || !micPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={64} color="#D1CCC5" />
        <Text style={styles.permissionTitle}>카메라 권한이 필요해요</Text>
        <Text style={styles.permissionSub}>카메라와 마이크 권한을 허용해주세요 🐾</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermissions}>
          <Text style={styles.permissionBtnText}>권한 허용하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progressPercent = elapsed / MAX_VIDEO_SECONDS;

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode={mode === 'video' ? 'video' : 'picture'}
        onCameraReady={() => setIsCameraReady(true)}
        videoQuality="720p"
      >
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recDot} />
            <Text style={styles.recTimer}>{elapsed.toFixed(1)}s / {MAX_VIDEO_SECONDS}s</Text>
          </View>
        )}
        {isRecording && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` as any }]} />
          </View>
        )}
      </CameraView>

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} disabled={isRecording}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleFacing} disabled={isRecording || isBusy}>
          <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.modeTabRow}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'photo' && styles.modeTabActive]}
            onPress={() => { if (!isRecording) setMode('photo'); }}
            disabled={isRecording}
          >
            <Text style={[styles.modeTabText, mode === 'photo' && styles.modeTabTextActive]}>📷 사진</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'video' && styles.modeTabActive]}
            onPress={() => { if (!isRecording) setMode('video'); }}
            disabled={isRecording}
          >
            <Text style={[styles.modeTabText, mode === 'video' && styles.modeTabTextActive]}>🎬 영상 (5초)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shutterRow}>
          <TouchableOpacity
            style={[
              styles.shutterOuter,
              mode === 'video' && styles.shutterOuterVideo,
              isRecording  && styles.shutterOuterRecording,
            ]}
            onPress={handleShutter}
            disabled={isBusy && !isRecording}
            activeOpacity={0.7}
          >
            {isBusy && !isRecording ? (
              <ActivityIndicator color="#FF6B6B" />
            ) : (
              <View style={[
                styles.shutterInner,
                mode === 'video' && styles.shutterInnerVideo,
                isRecording  && styles.shutterInnerStop,
              ]} />
            )}
          </TouchableOpacity>
          <Text style={styles.shutterHint}>
            {mode === 'photo' ? '탭하여 촬영' : isRecording ? '탭하여 중지' : '탭하여 녹화 시작 (최대 5초)'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#000000' },
  camera: { flex: 1 },
  recordingOverlay: { position: 'absolute', top: 20, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  recDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4444' },
  recTimer: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  progressBar:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressFill: { height: 4, backgroundColor: '#FF6B6B' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, backgroundColor: 'rgba(0,0,0,0.25)' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(253,251,247,0.95)', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20, paddingHorizontal: 24, paddingBottom: 8, alignItems: 'center', gap: 20 },
  modeTabRow:      { flexDirection: 'row', gap: 8 },
  modeTab:         { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0EBE1' },
  modeTabActive:   { backgroundColor: '#FFB5B5' },
  modeTabText:     { fontSize: 13, fontWeight: '600', color: '#A0938A' },
  modeTabTextActive: { color: '#FFFFFF' },
  shutterRow:  { alignItems: 'center', gap: 10, paddingBottom: 8 },
  shutterOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFB5B5', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  shutterOuterVideo:     { borderColor: '#FF6B6B' },
  shutterOuterRecording: { borderColor: '#FF4444', backgroundColor: '#FFF0F0' },
  shutterInner:          { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFB5B5' },
  shutterInnerVideo:     { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  shutterInnerStop:      { width: 28, height: 28, borderRadius: 6, backgroundColor: '#FF4444', borderColor: '#FF4444' },
  shutterHint: { fontSize: 11, color: '#A0938A', textAlign: 'center' },
  permissionContainer: { flex: 1, backgroundColor: '#FDFBF7', justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 40 },
  permissionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32', textAlign: 'center' },
  permissionSub:   { fontSize: 13, color: '#A0938A', textAlign: 'center' },
  permissionBtn:   { marginTop: 8, paddingHorizontal: 32, paddingVertical: 12, backgroundColor: '#FF6B6B', borderRadius: 24 },
  permissionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});

export default CameraScreen;