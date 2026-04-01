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
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Slider } from '@/components/ui/Slider';
import { ActiveSoundState, Frequency, SoundConfig } from '@/types';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

interface SoundDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  sound: SoundConfig | null;
}

const FREQUENCY_OPTIONS = ['연속', '자주', '가끔', '드물게'];
const FREQUENCY_VALUES: Frequency[] = ['continuous', 'frequent', 'occasional', 'rare'];

export function SoundDetailSheet({ visible, onClose, sound }: SoundDetailSheetProps) {
  const themeColors = useThemeColors();
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const updateSoundState = useAudioStore((s) => s.updateSoundState);
  const removeSound = useAudioStore((s) => s.removeSound);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

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
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  }, [onClose, fadeAnim, scaleAnim]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: themeColors.overlay,
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
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        },
        name: {
          ...typography.h2,
          color: themeColors.textPrimary,
          flex: 1,
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
  const state = activeSounds.get(sound.id);
  if (!state) return null;

  const isContinuous = sound.type === 'continuous';
  const freqIndex = FREQUENCY_VALUES.indexOf(state.frequency);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* 백드롭 탭으로 닫기 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[styles.dialog, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.name}>{sound.name}</Text>
              <Pressable style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {/* Volume Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>음량 범위</Text>
              <RangeSlider
                min={state.volumeMin}
                max={state.volumeMax}
                onMinChange={(v) => updateSoundState(sound.id, { volumeMin: v })}
                onMaxChange={(v) => updateSoundState(sound.id, { volumeMax: v })}
              />
            </View>

            {/* Frequency */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>빈도</Text>
              <SegmentedControl
                options={FREQUENCY_OPTIONS}
                selectedIndex={freqIndex >= 0 ? freqIndex : 0}
                onSelect={(i) => updateSoundState(sound.id, { frequency: FREQUENCY_VALUES[i] })}
                disabled={isContinuous}
              />
              {isContinuous && (
                <Text style={styles.hint}>연속 소리는 항상 연속 재생됩니다</Text>
              )}
            </View>

            {/* Pan (Premium) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>팬 (좌/우)</Text>
                {!isPremium && <Text style={styles.proLabel}>Pro</Text>}
              </View>
              <Slider
                value={Math.round((state.pan + 1) * 50)}
                onValueChange={(v) => {
                  if (isPremium) updateSoundState(sound.id, { pan: v / 50 - 1 });
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
                onPress={() => {
                  removeSound(sound.id);
                  handleClose();
                }}
              >
                <Text style={styles.removeText}>🗑️ 제거</Text>
              </Pressable>
              <Pressable style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneText}>완료</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
