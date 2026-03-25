import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '@/theme';

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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusMd,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.accent1,
    borderWidth: 2,
    backgroundColor: colors.glassMedium,
  },
  badge: {
    backgroundColor: colors.accent3,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.overline,
    color: colors.black,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  price: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  period: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subtext: {
    ...typography.caption,
    color: colors.accent2,
  },
});
