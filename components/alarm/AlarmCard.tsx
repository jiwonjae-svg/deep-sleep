import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Toggle } from '@/components/ui/Toggle';
import { Alarm } from '@/types';
import { useThemeColors, typography, spacing, layout } from '@/theme';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function AlarmCard({ alarm, onToggle, onPress }: AlarmCardProps) {
  const themeColors = useThemeColors();
  const timeStr = `${String(alarm.time.hour).padStart(2, '0')}:${String(alarm.time.minute).padStart(2, '0')}`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          padding: layout.cardPadding,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          gap: spacing.sm,
        },
        top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        time: { ...typography.display, color: themeColors.textPrimary },
        days: { flexDirection: 'row', gap: spacing.sm },
        day: { ...typography.overline, color: themeColors.textMuted },
        dayActive: { color: themeColors.accent2 },
        disabled: { opacity: 0.4 },
        label: { ...typography.caption, color: themeColors.textSecondary },
      }),
    [themeColors],
  );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <Text style={[styles.time, !alarm.enabled && styles.disabled]}>{timeStr}</Text>
        <Toggle value={alarm.enabled} onValueChange={onToggle} />
      </View>

      <View style={styles.days}>
        {alarm.days.map((active, i) => (
          <Text
            key={i}
            style={[styles.day, active && styles.dayActive, !alarm.enabled && styles.disabled]}
          >
            {DAY_LABELS[i]}
          </Text>
        ))}
      </View>

      {alarm.label ? (
        <Text style={styles.label} numberOfLines={1}>{alarm.label}</Text>
      ) : null}
    </Pressable>
  );
}
