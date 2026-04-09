import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Slider } from '@/components/ui/Slider';
import { ActiveSoundState, Frequency, SoundConfig } from '@/types';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useSoundPreview } from '@/hooks/useSoundPreview';

interface SoundDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  sound: SoundConfig | null;
  /** 외부 상태 관리 (프리셋 에디터용) — 제공하면 useAudioStore 대신 사용 */
  externalState?: ActiveSoundState | null;
  onExternalUpdate?: (updates: Partial<ActiveSoundState>) => void;
  onExternalRemove?: () => void;
}

export function SoundDetailSheet({ visible, onClose, sound, externalState, onExternalUpdate, onExternalRemove }: SoundDetailSheetProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const FREQUENCY_OPTIONS = [
    t('frequency.continuous'), t('frequency.frequent'),
    t('frequency.occasional'), t('frequency.rare'),
  ];
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const updateSoundState = useAudioStore((s) => s.updateSoundState);
  const removeSound = useAudioStore((s) => s.removeSound);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const { previewingSoundId, togglePreview, stopPreview: stopSoundPreview } = useSoundPreview();

  // 중앙 fade-in/out 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 22, useNativeDriver: true }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    stopSoundPreview();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  }, [onClose, fadeAnim, scaleAnim, stopSoundPreview]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: layout.screenPaddingH,
        },
        dialog: {
          width: '100%',
          maxHeight: '82%',
          backgroundColor: themeColors.bgSecondary,
          borderRadius: layout.borderRadiusLg,
          padding: layout.screenPaddingH,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 10,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        name: {
          ...typography.h2,
          color: themeColors.textPrimary,
          flex: 1,
        },
        previewBtnRow: {
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        },
        previewBtn: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        previewBtnActive: {
          backgroundColor: 'rgba(255,255,255,0.22)',
          borderColor: 'rgba(255,255,255,0.35)',
        },
        closeBtn: {
          padding: spacing.xs,
        },
        closeText: {
          fontSize: 20,
          color: themeColors.textMuted,
        },
        section: {
          marginBottom: spacing.lg,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        sectionTitle: {
          ...typography.overline,
          color: themeColors.textSecondary,
          textTransform: 'uppercase',
        },
        proLabel: {
          ...typography.overline,
          color: themeColors.accent3,
        },
        hint: {
          ...typography.caption,
          color: themeColors.textMuted,
          marginTop: spacing.xs,
        },
        panLabels: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 2,
        },
        panLabel: {
          ...typography.caption,
          color: themeColors.textMuted,
        },
        actions: {
          flexDirection: 'row',
          gap: spacing.md,
          marginTop: spacing.lg,
        },
        removeBtn: {
          flex: 1,
          height: 48,
          borderRadius: layout.borderRadiusSm,
          backgroundColor: themeColors.glassLight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        removeText: {
          ...typography.button,
          color: themeColors.error,
        },
        doneBtn: {
          flex: 1,
          height: 48,
          borderRadius: layout.borderRadiusSm,
          backgroundColor: themeColors.accent1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        doneText: {
          ...typography.button,
          color: themeColors.white,
        },
      }),
    [themeColors],
  );

  if (!sound) return null;
  // 외부 상태가 제공되면 사용, 아니면 useAudioStore에서 조회
  const isExternal = !!externalState;
  const state = isExternal ? externalState : activeSounds.get(sound.id);
  if (!state) return null;

  const handleUpdate = (updates: Partial<ActiveSoundState>) => {
    if (isExternal && onExternalUpdate) onExternalUpdate(updates);
    else updateSoundState(sound.id, updates);
  };
  const handleRemove = () => {
    if (isExternal && onExternalRemove) { onExternalRemove(); handleClose(); }
    else { removeSound(sound.id); handleClose(); }
  };

  const FREQUENCY_VALUES: Frequency[] = ['continuous', 'frequent', 'occasional', 'rare'];
  const isContinuous = sound.type === 'continuous';
  const freqIndex = FREQUENCY_VALUES.indexOf(state.frequency);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* 백드롭 탭으로 닫기 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[styles.dialog, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.name}>{t(`sounds.${sound.id}`, { defaultValue: sound.name })}</Text>
              <Pressable style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {/* Centered Play Button */}
            <View style={styles.previewBtnRow}>
              <Pressable
                style={[styles.previewBtn, previewingSoundId === sound.id && styles.previewBtnActive]}
                onPress={() => togglePreview(sound.id)}
              >
                <MaterialIcons name={previewingSoundId === sound.id ? 'stop' : 'play-arrow'} size={28} color="#ffffff" />
              </Pressable>
            </View>

            {/* Volume Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('soundDetail.volumeRange')}</Text>
              <RangeSlider
                min={state.volumeMin}
                max={state.volumeMax}
                onMinChange={(v) => handleUpdate({ volumeMin: v })}
                onMaxChange={(v) => handleUpdate({ volumeMax: v })}
              />
            </View>

            {/* Frequency */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('soundDetail.frequency')}</Text>
              <SegmentedControl
                options={FREQUENCY_OPTIONS}
                selectedIndex={freqIndex >= 0 ? freqIndex : 0}
                onSelect={(i) => handleUpdate({ frequency: FREQUENCY_VALUES[i] })}
                disabled={isContinuous}
              />
              {isContinuous && (
                <Text style={styles.hint}>{t('soundDetail.continuousHint')}</Text>
              )}
            </View>

            {/* Pan (Premium) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('soundDetail.pan')}</Text>
                {!isPremium && <Text style={styles.proLabel}>Pro</Text>}
              </View>
              <Slider
                value={Math.round((state.pan + 1) * 50)}
                onValueChange={(v) => {
                  if (isPremium) handleUpdate({ pan: v / 50 - 1 });
                }}
                activeColor={isPremium ? themeColors.accent1 : themeColors.textMuted}
                showLabel={false}
              />
              <View style={styles.panLabels}>
                <Text style={styles.panLabel}>L</Text>
                <Text style={styles.panLabel}>C</Text>
                <Text style={styles.panLabel}>R</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={styles.removeBtn}
                onPress={handleRemove}
              >
                <Text style={styles.removeText}>{t('soundDetail.remove')}</Text>
              </Pressable>
              <Pressable style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneText}>{t('soundDetail.done')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
