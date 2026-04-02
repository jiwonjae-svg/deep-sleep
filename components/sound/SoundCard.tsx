import React, { useMemo } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme';
import { spacing } from '@/theme';
import { SoundConfig } from '@/types';
import { useTranslation } from 'react-i18next';

interface SoundCardProps {
  sound: SoundConfig;
  active: boolean;
  isPremium: boolean;
  isLocked: boolean;
  volume?: number;
  onPress: () => void;
  onLongPress?: () => void;
  categoryColor: string;
}

export function SoundCard({
  sound,
  active,
  isPremium,
  isLocked,
  onPress,
  onLongPress,
  categoryColor,
}: SoundCardProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.md,
        },
        iconBox: {
          width: '100%',
          aspectRatio: 1,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        },
        iconBoxActive: {
          borderWidth: 2,
          borderColor: categoryColor,
          backgroundColor: 'rgba(255,255,255,0.18)',
        },
        emoji: {
          fontSize: 28,
        },
        lockOverlay: {
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: 11,
        },
        label: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          textAlign: 'center',
          color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
        },
      }),
    [themeColors, active, categoryColor],
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : isLocked ? 0.55 : 1 }]}
    >
      <View style={[styles.iconBox, active && styles.iconBoxActive]}>
        <Text style={styles.emoji}>{sound.iconEmoji}</Text>
        {isLocked && !active && <Text style={styles.lockOverlay}>🔒</Text>}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {t(`sounds.${sound.id}`, { defaultValue: sound.name })}
      </Text>
    </Pressable>
  );
}
