import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';

interface PresetCardProps {
  preset: Preset;
  onPress: () => void;
  onLongPress?: () => void;
}

export function PresetCard({ preset, onPress, onLongPress }: PresetCardProps) {
  const themeColors = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          padding: layout.cardPadding,
          // 테두리 없음
          gap: spacing.sm,
        },
        name: {
          ...typography.h3,
          color: themeColors.textPrimary,
        },
        description: {
          ...typography.body,
          color: themeColors.textSecondary,
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginTop: spacing.xs,
        },
        chip: {
          backgroundColor: themeColors.accent1,
          borderRadius: layout.borderRadiusSm,
          paddingVertical: 3,
          paddingHorizontal: spacing.sm,
        },
        chipText: {
          ...typography.caption,
          color: themeColors.white,
          fontWeight: '600',
          fontSize: 11,
        },
        meta: {
          ...typography.caption,
          color: themeColors.textMuted,
        },
      }),
    [themeColors],
  );

  const soundNames = preset.sounds.slice(0, 4).map((s) => getSoundById(s.soundId)?.name ?? s.soundId);
  const extra = preset.sounds.length - 4;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.name}>{preset.name}</Text>
      {!!preset.description && (
        <Text style={styles.description} numberOfLines={1}>
          {preset.description}
        </Text>
      )}
      <View style={styles.footer}>
        {soundNames.map((name, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        ))}
        {extra > 0 && <Text style={styles.meta}>+{extra}</Text>}
      </View>
    </Pressable>
  );
}
