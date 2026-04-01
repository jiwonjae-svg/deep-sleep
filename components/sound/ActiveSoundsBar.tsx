import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAudioStore } from '@/stores/useAudioStore';
import { getSoundById } from '@/data/sounds';
import { useThemeColors } from '@/theme';
import { spacing } from '@/theme';

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
          backgroundColor: 'rgba(11,15,25,0.8)',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(255,255,255,0.15)',
          paddingVertical: spacing.sm,
          paddingHorizontal: 24,
          gap: spacing.md,
        },
        scroll: { flex: 1 },
        chipRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        chip: {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          paddingVertical: 5,
          paddingHorizontal: spacing.sm,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        },
        chipText: {
          fontSize: 11,
          fontWeight: '600',
          color: '#ffffff',
          letterSpacing: 0.3,
        },
        playBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.accent1,
          borderRadius: 9999,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          gap: spacing.xs,
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
        },
        playIcon: {
          fontSize: 11,
          color: '#ffffff',
        },
        playLabel: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.5,
          color: '#ffffff',
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
                    {meta?.iconEmoji} {meta?.name ?? id}
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
