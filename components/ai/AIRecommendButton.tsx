import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface AIRecommendButtonProps {
  isPremium: boolean;
  onPress: () => void;
}

export function AIRecommendButton({ isPremium, onPress }: AIRecommendButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.label}>AI 추천</Text>
      {!isPremium && <Text style={styles.lock}>🔒</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.buttonSmall,
    color: colors.textPrimary,
  },
  lock: {
    fontSize: 12,
  },
});
