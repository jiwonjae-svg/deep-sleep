import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAudioStore } from '@/stores/useAudioStore';
import { getSoundById } from '@/data/sounds';
import { colors, typography, spacing, layout } from '@/theme';

interface ActiveSoundsBarProps {
  onSoundPress: (soundId: string) => void;
  onPlayPress: () => void;
}

export function ActiveSoundsBar({ onSoundPress, onPlayPress }: ActiveSoundsBarProps) {
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const soundIds = Array.from(activeSounds.keys());

  if (soundIds.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.iconRow}>
          <Text style={styles.label}>활성: </Text>
          {soundIds.map((id) => {
            const meta = getSoundById(id);
            return (
              <Pressable key={id} onPress={() => onSoundPress(id)} style={styles.iconBtn}>
                <Text style={styles.icon}>{meta?.iconEmoji ?? '🔊'}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Pressable style={styles.playBtn} onPress={onPlayPress}>
        <Text style={styles.playIcon}>{isPlaying ? '■' : '▶'}</Text>
        <Text style={styles.playLabel}>{isPlaying ? '정지' : '재생'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent1,
    borderRadius: layout.borderRadiusSm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  playIcon: {
    color: colors.white,
    fontSize: 12,
  },
  playLabel: {
    ...typography.buttonSmall,
    color: colors.white,
  },
});
