import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { SnoringEvent, SnoringIntensity } from '@/types';

interface Props {
  events: SnoringEvent[];
  trackingStart: number;
  trackingEnd: number;
}

const BAR_HEIGHT = 40;
const CHART_WIDTH = 280;
const INTENSITY_COLORS: Record<SnoringIntensity, string> = {
  light: '#22c55e',
  moderate: '#eab308',
  heavy: '#ef4444',
};

export function SnoringTimeline({ events, trackingStart, trackingEnd }: Props) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const totalDuration = trackingEnd - trackingStart;
  if (totalDuration <= 0 || events.length === 0) return null;

  const startH = new Date(trackingStart).getHours();
  const endH = new Date(trackingEnd).getHours();
  const hours: string[] = [];
  let h = startH;
  while (h !== endH) {
    hours.push(`${String(h).padStart(2, '0')}`);
    h = (h + 1) % 24;
  }
  hours.push(`${String(endH).padStart(2, '0')}`);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>
        {t('snoring.timeline', { defaultValue: '코골이 타임라인' })}
      </Text>

      <Svg width={CHART_WIDTH} height={BAR_HEIGHT + 20} style={styles.chart}>
        {/* Background */}
        <Rect x={0} y={0} width={CHART_WIDTH} height={BAR_HEIGHT} rx={6} fill="rgba(255,255,255,0.05)" />

        {/* Snoring bars */}
        {events.map((evt, idx) => {
          const offsetMs = evt.timestamp - trackingStart;
          const x = (offsetMs / totalDuration) * CHART_WIDTH;
          const w = Math.max(2, (evt.durationSec * 1000 / totalDuration) * CHART_WIDTH);
          const color = INTENSITY_COLORS[evt.intensity];
          return (
            <Rect
              key={idx}
              x={Math.min(x, CHART_WIDTH - w)}
              y={0}
              width={w}
              height={BAR_HEIGHT}
              rx={2}
              fill={color}
              opacity={0.7}
            />
          );
        })}
      </Svg>

      {/* Time labels */}
      <View style={styles.timeRow}>
        {hours.filter((_, i) => i % 2 === 0 || hours.length <= 6).map((label, i) => (
          <Text key={i} style={[styles.timeLabel, { color: themeColors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  chart: {
    alignSelf: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
