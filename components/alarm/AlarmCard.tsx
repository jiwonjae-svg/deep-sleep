import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Toggle } from '@/components/ui/Toggle';
import { Alarm } from '@/types';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
}

export function AlarmCard({ alarm, onToggle, onPress }: AlarmCardProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const DAY_LABELS = t('alarms.days', { returnObjects: true }) as string[];
  const timeStr = `${String(alarm.time.hour).padStart(2, '0')}:${String(alarm.time.minute).padStart(2, '0')}`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 32,
          padding: layout.cardPadding,
          borderWidth: 1,
          borderColor: alarm.enabled ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)',
          gap: spacing.sm,
        },
        top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        time: {
          fontSize: 32,
          fontWeight: '900',
          color: '#ffffff',
        },
        days: { flexDirection: 'row', gap: spacing.sm },
        day: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        },
        dayActive: { color: themeColors.accent2 },
        disabled: { opacity: 0.4 },
        label: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
      }),
    [themeColors, alarm.enabled],
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
