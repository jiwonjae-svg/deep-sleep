import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { colors, typography, spacing, layout } from '@/theme';

interface PresetCardProps {
  preset: Preset;
  onPress: () => void;
  onLongPress?: () => void;
}

export function PresetCard({ preset, onPress, onLongPress }: PresetCardProps) {
  const soundEmojis = preset.sounds
    .slice(0, 5)
    .map((s) => getSoundById(s.soundId)?.iconEmoji ?? '🔊');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.name}>{preset.name}</Text>
      <Text style={styles.description} numberOfLines={1}>
        {preset.description}
      </Text>
      <View style={styles.footer}>
        <View style={styles.icons}>
          {soundEmojis.map((emoji, i) => (
            <Text key={i} style={styles.emoji}>
              {emoji}
            </Text>
          ))}
        </View>
        <Text style={styles.meta}>
          · {preset.sounds.length}개 소리 · {preset.isDefault ? '기본' : '커스텀'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusMd,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  icons: {
    flexDirection: 'row',
    gap: 2,
  },
  emoji: {
    fontSize: 16,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
