import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useThemeColors, typography, spacing } from '@/theme';
import { useTranslation } from 'react-i18next';

interface AIRecommendButtonProps {
  isPremium: boolean;
  onPress: () => void;
}

export function AIRecommendButton({ isPremium, onPress }: AIRecommendButtonProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        btn: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.glassLight,
          borderRadius: 20,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          gap: spacing.xs,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        icon: { fontSize: 16 },
        label: { ...typography.buttonSmall, color: themeColors.textPrimary },
        lock: { fontSize: 12 },
      }),
    [themeColors],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.label}>{t('ai.recommendTitle')}</Text>
      {!isPremium && <Text style={styles.lock}>🔒</Text>}
    </Pressable>
  );
}
