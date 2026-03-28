import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAudioStore } from '@/stores/useAudioStore';
import { getSoundById } from '@/data/sounds';
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';

interface ActiveSoundsBarProps {
  onSoundPress: (soundId: string) => void;
  onPlayPress: () => void;
}

export function ActiveSoundsBar({ onSoundPress, onPlayPress }: ActiveSoundsBarProps) {
  const themeColors = useThemeColors();
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const soundIds = Array.from(activeSounds.keys());

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.bgSecondary,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: themeColors.glassBorder,
          paddingVertical: spacing.sm,
          paddingHorizontal: layout.screenPaddingH,
          gap: spacing.md,
        },
        scroll: { flex: 1 },
        chipRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        chip: {
          backgroundColor: themeColors.accent1,
          borderRadius: layout.borderRadiusSm,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        },
        chipText: {
          ...typography.caption,
          color: themeColors.white,
          fontWeight: '600',
        },
        playBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.accent1,
          borderRadius: layout.borderRadiusSm,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          gap: spacing.xs,
        },
        playIcon: {
          fontSize: 12,
          color: themeColors.white,
        },
        playLabel: {
          ...typography.buttonSmall,
          color: themeColors.white,
        },
      }),
    [themeColors],
  );

  if (soundIds.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.chipRow}>
          {soundIds.map((id) => {
            const meta = getSoundById(id);
            return (
              <Pressable key={id} onPress={() => onSoundPress(id)}>
                <View style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {meta?.name ?? id}
                  </Text>
                </View>
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
