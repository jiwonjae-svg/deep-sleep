import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { CustomAlarmSound } from '@/types';

// 기본 알람 소리 5개 (아직 에셋 미추가 — ID 기반 매핑)
const DEFAULT_ALARM_SOUNDS = [
  { id: 'alarm-classic', nameKey: 'alarm-classic' },
  { id: 'alarm-gentle', nameKey: 'alarm-gentle' },
  { id: 'alarm-birds', nameKey: 'alarm-birds' },
  { id: 'alarm-chime', nameKey: 'alarm-chime' },
  { id: 'alarm-melody', nameKey: 'alarm-melody' },
];

const FADE_MS = 300;
const FADE_STEP_MS = 30;
const PREVIEW_VOLUME = 0.7;

interface AlarmSoundModalProps {
  visible: boolean;
  selected: string;
  onSelect: (soundId: string) => void;
  onClose: () => void;
}

export function AlarmSoundModal({
  visible,
  selected,
  onSelect,
  onClose,
}: AlarmSoundModalProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const customSounds = useAlarmStore((s) => s.customAlarmSounds);
  const addCustomAlarmSound = useAlarmStore((s) => s.addCustomAlarmSound);
  const removeCustomAlarmSound = useAlarmStore((s) => s.removeCustomAlarmSound);

  const [tempSelected, setTempSelected] = useState(selected);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // 프리뷰 사운드 관리
  const soundRef = useRef<Audio.Sound | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playLockRef = useRef(false);

  useEffect(() => {
    if (visible) setTempSelected(selected);
  }, [visible, selected]);

  // 모달 닫힐 때 프리뷰 정지
  useEffect(() => {
    if (!visible) {
      stopPreviewImmediate();
    }
  }, [visible]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => { stopPreviewImmediate(); };
  }, []);

  const clearFadeTimer = () => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const stopPreviewImmediate = async () => {
    clearFadeTimer();
    setPlayingSoundId(null);
    const sound = soundRef.current;
    soundRef.current = null;
    if (sound) {
      try { sound.setOnPlaybackStatusUpdate(null); } catch {}
      try { await sound.stopAsync(); } catch {}
      try { await sound.unloadAsync(); } catch {}
    }
  };

  /** 페이드아웃 후 정지 */
  const stopPreviewWithFade = useCallback(async () => {
    clearFadeTimer();
    const sound = soundRef.current;
    if (!sound) {
      setPlayingSoundId(null);
      return;
    }

    // 현재 볼륨 취득
    let currentVol = PREVIEW_VOLUME;
    try {
      const st = await sound.getStatusAsync();
      if ('isLoaded' in st && st.isLoaded) currentVol = st.volume;
    } catch {}

    // UI 즉시 업데이트
    setPlayingSoundId(null);
    soundRef.current = null;

    // 페이드아웃
    const steps = FADE_MS / FADE_STEP_MS;
    const decrement = currentVol / steps;
    let step = 0;

    await new Promise<void>((resolve) => {
      fadeTimerRef.current = setInterval(() => {
        step++;
        const vol = Math.max(0, currentVol - step * decrement);
        sound.setVolumeAsync(vol).catch(() => {});
        if (step >= steps) {
          clearFadeTimer();
          resolve();
        }
      }, FADE_STEP_MS);
    });

    try { sound.setOnPlaybackStatusUpdate(null); } catch {}
    try { await sound.stopAsync(); } catch {}
    try { await sound.unloadAsync(); } catch {}
  }, []);

  /** 재생 토글 (연타 방지 + 페이드인/아웃) */
  const handlePlayToggle = useCallback(async (soundId: string) => {
    if (playLockRef.current) return;
    playLockRef.current = true;
    setTimeout(() => { playLockRef.current = false; }, 300);

    // 같은 소리 재생 중이면 정지
    if (playingSoundId === soundId) {
      await stopPreviewWithFade();
      return;
    }

    // 다른 소리 재생 중이면 즉시 정지
    await stopPreviewImmediate();

    // 새 소리 재생 시도
    // TODO: 기본 알람 소리 에셋이 추가되면 여기서 로드
    // 현재는 사용자 커스텀 소리만 실제 재생 가능
    const customSound = customSounds.find((s) => s.id === soundId);
    if (!customSound) {
      // 기본 소리 — 에셋 미추가 상태이므로 소리 없음 (향후 추가)
      setPlayingSoundId(soundId);
      setTimeout(() => setPlayingSoundId(null), 2000);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: customSound.uri },
        { shouldPlay: true, isLooping: true, volume: 0 },
      );
      soundRef.current = sound;
      setPlayingSoundId(soundId);

      // 페이드인
      const steps = FADE_MS / FADE_STEP_MS;
      const increment = PREVIEW_VOLUME / steps;
      let step = 0;
      clearFadeTimer();
      fadeTimerRef.current = setInterval(() => {
        step++;
        const vol = Math.min(PREVIEW_VOLUME, step * increment);
        sound.setVolumeAsync(vol).catch(() => {});
        if (step >= steps) clearFadeTimer();
      }, FADE_STEP_MS);
    } catch {
      setPlayingSoundId(null);
    }
  }, [playingSoundId, customSounds, stopPreviewWithFade]);

  /** 사용자 소리 추가 */
  const handleAddCustomSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const newSound: CustomAlarmSound = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        uri: file.uri,
        addedAt: Date.now(),
      };
      await addCustomAlarmSound(newSound);
    } catch {}
  };

  /** 사용자 소리 삭제 */
  const handleDeleteSound = (soundId: string) => {
    const sound = customSounds.find((s) => s.id === soundId);
    if (!sound) return;
    Alert.alert(t('alarms.deleteSound'), t('alarms.deleteSoundConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (playingSoundId === soundId) await stopPreviewImmediate();
          if (tempSelected === soundId) setTempSelected(DEFAULT_ALARM_SOUNDS[0].id);
          await removeCustomAlarmSound(soundId);
        },
      },
    ]);
  };

  const handleConfirm = () => {
    stopPreviewImmediate();
    onSelect(tempSelected);
    onClose();
  };

  const isCustomSelected = customSounds.some((s) => s.id === tempSelected);

  const allSounds = [
    ...DEFAULT_ALARM_SOUNDS.map((s) => ({
      id: s.id,
      name: t(`alarms.defaultSounds.${s.nameKey}`),
      isCustom: false,
    })),
    ...customSounds.map((s) => ({
      id: s.id,
      name: s.name,
      isCustom: true,
    })),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.glassBorder }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('alarms.selectSound')}</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={true} indicatorStyle="white">
            {allSounds.map((item) => {
              const isSelected = item.id === tempSelected;
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.option,
                    isSelected && { backgroundColor: themeColors.glassMedium, borderWidth: 1, borderColor: themeColors.glassBorderActive },
                  ]}
                  onPress={() => setTempSelected(item.id)}
                >
                  {/* 체크 아이콘 */}
                  {isSelected ? (
                    <MaterialIcons name="check-circle" size={20} color={themeColors.accent1} />
                  ) : (
                    <View style={[styles.radioCircle, { borderColor: themeColors.glassBorder }]} />
                  )}

                  {/* 재생 버튼 */}
                  <Pressable
                    style={[styles.playBtn, { backgroundColor: playingSoundId === item.id ? themeColors.accent1 : 'rgba(255,255,255,0.08)' }]}
                    onPress={() => handlePlayToggle(item.id)}
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name={playingSoundId === item.id ? 'pause' : 'play-arrow'}
                      size={18}
                      color="#ffffff"
                    />
                  </Pressable>

                  {/* 소리 이름 */}
                  <Text
                    style={[styles.optionLabel, { color: isSelected ? themeColors.textPrimary : themeColors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 사용자 소리 추가 버튼 */}
          <Pressable style={[styles.addBtn, { borderColor: themeColors.glassBorder }]} onPress={handleAddCustomSound}>
            <MaterialIcons name="add" size={20} color={themeColors.textSecondary} />
            <Text style={[styles.addBtnText, { color: themeColors.textSecondary }]}>{t('alarms.addCustomSound')}</Text>
          </Pressable>

          {/* 저장 + 삭제 버튼 */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.confirmBtn, { backgroundColor: themeColors.accent1, flex: 1 }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>{t('common.save')}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.deleteBtn,
                { opacity: isCustomSelected ? 1 : 0.3, borderColor: themeColors.glassBorder },
              ]}
              onPress={() => isCustomSelected && handleDeleteSound(tempSelected)}
              disabled={!isCustomSelected}
            >
              <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
            </Pressable>
          </View>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelText, { color: themeColors.textMuted }]}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 10,
    marginBottom: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  confirmBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 9999,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
  },
});
