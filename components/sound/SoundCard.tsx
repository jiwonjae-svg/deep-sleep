import React, { useMemo } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme';
import { typography, layout, spacing } from '@/theme';
import { SoundConfig } from '@/types';

interface SoundCardProps {
  sound: SoundConfig;
  active: boolean;
  isPremium: boolean;
  isLocked: boolean;
  volume?: number; // 0–100 current average volume
  onPress: () => void;
  onLongPress?: () => void;
  categoryColor: string;
}

export function SoundCard({
  sound,
  active,
  isPremium,
  isLocked,
  volume,
  onPress,
  onLongPress,
  categoryColor,
}: SoundCardProps) {
  const themeColors = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: layout.borderRadiusMd,
          backgroundColor: active ? themeColors.glassMedium : themeColors.glassLight,
          paddingVertical: spacing.md,
          paddingHorizontal: layout.cardPadding,
          borderWidth: 1,
          borderColor: active ? categoryColor : 'transparent',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        name: {
          ...typography.bodyMedium,
          color: active ? themeColors.textPrimary : themeColors.textSecondary,
          flex: 1,
        },
        checkDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: themeColors.accent2,
          marginLeft: spacing.sm,
        },
        lockIcon: {
          fontSize: 13,
          marginLeft: spacing.sm,
        },
        premiumLabel: {
          ...typography.overline,
          color: themeColors.accent3,
          fontSize: 10,
          marginTop: spacing.xs,
        },
      }),
    [themeColors, active],
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.75 : isLocked ? 0.55 : 1 },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {sound.name}
        </Text>
        {active && <View style={styles.checkDot} />}
        {isLocked && !active && <Text style={styles.lockIcon}>🔒</Text>}
      </View>

      {sound.isPremium && !active && (
        <Text style={styles.premiumLabel}>★ Premium</Text>
      )}
    </Pressable>
  );
}
