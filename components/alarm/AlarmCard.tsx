import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Toggle } from '@/components/ui/Toggle';
import { Alarm } from '@/types';
import { colors, typography, spacing, layout } from '@/theme';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function AlarmCard({ alarm, onToggle, onPress }: AlarmCardProps) {
  const timeStr = `${String(alarm.time.hour).padStart(2, '0')}:${String(alarm.time.minute).padStart(2, '0')}`;

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusMd,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    ...typography.display,
    color: colors.textPrimary,
  },
  days: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  day: {
    ...typography.overline,
    color: colors.textMuted,
  },
  dayActive: {
    color: colors.accent2,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
