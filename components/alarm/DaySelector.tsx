import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

const LABELS = ['월', '화', '수', '목', '금', '토', '일'];

interface DaySelectorProps {
  days: boolean[];
  onChange: (days: boolean[]) => void;
}

export function DaySelector({ days, onChange }: DaySelectorProps) {
  const toggle = (index: number) => {
    const next = [...days];
    next[index] = !next[index];
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {LABELS.map((label, i) => {
        const active = days[i];
        return (
          <Pressable
            key={i}
            onPress={() => toggle(i)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: colors.accent1,
  },
  label: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
});
