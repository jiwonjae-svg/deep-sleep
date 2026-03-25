import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '@/theme';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Slider } from '@/components/ui/Slider';
import { BottomSheet } from '@/components/ui/BottomSheet';
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
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const updateSoundState = useAudioStore((s) => s.updateSoundState);
  const removeSound = useAudioStore((s) => s.removeSound);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (!sound) return null;

  const state = activeSounds.get(sound.id);
  if (!state) return null;

  const isContinuous = sound.type === 'continuous';
  const freqIndex = FREQUENCY_VALUES.indexOf(state.frequency);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{sound.iconEmoji}</Text>
        <Text style={styles.name}>{sound.name}</Text>
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
          value={Math.round((state.pan + 1) * 50)} // -1~1 → 0~100
          onValueChange={(v) => {
            if (isPremium) {
              updateSoundState(sound.id, { pan: (v / 50) - 1 });
            }
          }}
          activeColor={isPremium ? colors.accent1 : colors.textMuted}
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
            onClose();
          }}
        >
          <Text style={styles.removeText}>🗑️ 제거</Text>
        </Pressable>
        <Pressable style={styles.doneBtn} onPress={onClose}>
          <Text style={styles.doneText}>✓ 완료</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 32 },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  proLabel: {
    ...typography.overline,
    color: colors.accent3,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  panLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  panLabel: {
    ...typography.caption,
    color: colors.textMuted,
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
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    ...typography.button,
    color: colors.error,
  },
  doneBtn: {
    flex: 1,
    height: 48,
    borderRadius: layout.borderRadiusSm,
    backgroundColor: colors.accent1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    ...typography.button,
    color: colors.white,
  },
});
