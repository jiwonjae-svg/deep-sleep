import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors, typography, spacing } from '@/theme';

const LABELS = ['월', '화', '수', '목', '금', '토', '일'];

interface DaySelectorProps {
  days: boolean[];
  onChange: (days: boolean[]) => void;
}

export function DaySelector({ days, onChange }: DaySelectorProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
        btn: { flex: 1, maxWidth: 40, aspectRatio: 1, borderRadius: 20, backgroundColor: themeColors.glassLight, alignItems: 'center', justifyContent: 'center' },
        btnActive: { backgroundColor: themeColors.accent1 },
        label: { ...typography.buttonSmall, color: themeColors.textSecondary },
        labelActive: { color: '#ffffff' },
      }),
    [themeColors],
  );

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
