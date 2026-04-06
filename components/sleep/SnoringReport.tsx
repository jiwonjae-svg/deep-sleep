import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { SnoringRecord, SnoringIntensity } from '@/types';

interface Props {
  record: SnoringRecord;
}

const INTENSITY_COLORS: Record<SnoringIntensity, string> = {
  light: '#22c55e',
  moderate: '#eab308',
  heavy: '#ef4444',
};

export function SnoringReport({ record }: Props) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const heavyCount = record.events.filter((e) => e.intensity === 'heavy').length;
  const moderateCount = record.events.filter((e) => e.intensity === 'moderate').length;
  const lightCount = record.events.filter((e) => e.intensity === 'light').length;

  const worstHour = useMemo(() => {
    if (record.events.length === 0) return null;
    const hourBuckets: Record<number, number> = {};
    for (const evt of record.events) {
      const h = new Date(evt.timestamp).getHours();
      hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
    }
    let maxH = 0;
    let maxCount = 0;
    for (const [h, c] of Object.entries(hourBuckets)) {
      if (c > maxCount) {
        maxH = Number(h);
        maxCount = c;
      }
    }
    return `${String(maxH).padStart(2, '0')}:00`;
  }, [record.events]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <View style={styles.header}>
        <MaterialIcons name="mic" size={20} color={themeColors.accent2} />
        <Text style={[styles.title, { color: themeColors.textSecondary }]}>
          {t('snoring.report', { defaultValue: '코골이 리포트' })}
        </Text>
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {record.totalSnoringMinutes}
          </Text>
          <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
            {t('snoring.totalMinutes', { defaultValue: '분 (총 시간)' })}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {record.events.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
            {t('snoring.eventCount', { defaultValue: '회' })}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.intensityBadge, { backgroundColor: `${INTENSITY_COLORS[record.avgIntensity]}20` }]}>
            <Text style={[styles.intensityText, { color: INTENSITY_COLORS[record.avgIntensity] }]}>
              {t(`snoring.intensity_${record.avgIntensity}`, { defaultValue: record.avgIntensity })}
            </Text>
          </View>
          <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
            {t('snoring.avgIntensity', { defaultValue: '평균 강도' })}
          </Text>
        </View>
      </View>

      {/* Intensity breakdown */}
      <View style={styles.breakdownRow}>
        {heavyCount > 0 && (
          <View style={[styles.chip, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
            <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.chipText, { color: '#ef4444' }]}>
              {t('snoring.heavy', { defaultValue: '심함' })} {heavyCount}
            </Text>
          </View>
        )}
        {moderateCount > 0 && (
          <View style={[styles.chip, { backgroundColor: 'rgba(234,179,8,0.15)' }]}>
            <View style={[styles.dot, { backgroundColor: '#eab308' }]} />
            <Text style={[styles.chipText, { color: '#eab308' }]}>
              {t('snoring.moderate', { defaultValue: '보통' })} {moderateCount}
            </Text>
          </View>
        )}
        {lightCount > 0 && (
          <View style={[styles.chip, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
            <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.chipText, { color: '#22c55e' }]}>
              {t('snoring.light', { defaultValue: '약함' })} {lightCount}
            </Text>
          </View>
        )}
      </View>

      {worstHour && (
        <Text style={[styles.insight, { color: themeColors.textMuted }]}>
          {t('snoring.worstTime', { time: worstHour, defaultValue: `가장 심한 시간대: ${worstHour}` })}
        </Text>
      )}

      <Text style={[styles.disclaimer, { color: themeColors.textMuted }]}>
        {t('snoring.disclaimer', { defaultValue: '이 기능은 정보 제공 목적이며 의료 진단 도구가 아닙니다.' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  intensityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  insight: {
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 9,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
