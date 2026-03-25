import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface TimePickerProps {
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}

export function TimePicker({ hour, minute, onHourChange, onMinuteChange }: TimePickerProps) {
  return (
    <View style={styles.container}>
      {/* Hour */}
      <View style={styles.column}>
        <Pressable onPress={() => onHourChange((hour + 1) % 24)} style={styles.arrow}>
          <Text style={styles.arrowText}>▲</Text>
        </Pressable>
        <Text style={styles.value}>{String(hour).padStart(2, '0')}</Text>
        <Pressable onPress={() => onHourChange((hour - 1 + 24) % 24)} style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </Pressable>
      </View>

      <Text style={styles.colon}>:</Text>

      {/* Minute */}
      <View style={styles.column}>
        <Pressable onPress={() => onMinuteChange((minute + 1) % 60)} style={styles.arrow}>
          <Text style={styles.arrowText}>▲</Text>
        </Pressable>
        <Text style={styles.value}>{String(minute).padStart(2, '0')}</Text>
        <Pressable onPress={() => onMinuteChange((minute - 1 + 60) % 60)} style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  column: {
    alignItems: 'center',
  },
  arrow: {
    padding: spacing.sm,
  },
  arrowText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: 'monospace',
    fontSize: 56,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 68,
  },
  colon: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: -4,
  },
});
