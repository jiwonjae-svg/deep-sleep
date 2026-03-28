import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors, typography, spacing, layout } from '@/theme';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  subtext?: string;
  recommended?: boolean;
  selected: boolean;
  onPress: () => void;
}

export function PlanCard({
  title,
  price,
  period,
  subtext,
  recommended = false,
  selected,
  onPress,
}: PlanCardProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          padding: spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          gap: spacing.xs,
        },
        cardSelected: { borderColor: themeColors.accent1, borderWidth: 2, backgroundColor: themeColors.glassMedium },
        badge: { backgroundColor: themeColors.accent3, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
        badgeText: { ...typography.overline, color: '#000000' },
        title: { ...typography.bodyMedium, color: themeColors.textPrimary },
        price: { ...typography.h2, color: themeColors.textPrimary },
        period: { ...typography.caption, color: themeColors.textSecondary },
        subtext: { ...typography.caption, color: themeColors.accent2 },
      }),
    [themeColors],
  );

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {recommended && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>★ 추천</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>{period}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </Pressable>
  );
}
