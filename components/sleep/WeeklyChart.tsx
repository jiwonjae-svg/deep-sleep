import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme';
import { SleepRecord } from '@/stores/useSleepStore';
import { useTranslation } from 'react-i18next';

interface WeeklyChartProps {
  records: SleepRecord[];
}

export function WeeklyChart({ records }: WeeklyChartProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  // Build 7-day data (today → 6 days ago)
  const days: { label: string; score: number | null; tst: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNames = [
      t('my.sun'), t('my.mon'), t('my.tue'),
      t('my.wed'), t('my.thu'), t('my.fri'), t('my.sat'),
    ];
    const label = dayNames[d.getDay()];
    const record = records.find((r) => r.date === dateStr);
    days.push({
      label,
      score: record?.score ?? null,
      tst: record?.tst ?? 0,
    });
  }

  const maxScore = 100;
  const barMaxHeight = 120;

  // Compute weekly averages
  const validRecords = days.filter((d) => d.score !== null);
  const avgScore = validRecords.length > 0
    ? Math.round(validRecords.reduce((s, d) => s + (d.score ?? 0), 0) / validRecords.length)
    : null;
  const avgTst = validRecords.length > 0
    ? Math.round(validRecords.reduce((s, d) => s + d.tst, 0) / validRecords.length)
    : null;

  const getBarColor = (score: number) => {
    if (score >= 80) return themeColors.success;
    if (score >= 60) return themeColors.accent2;
    return themeColors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.textSecondary }]}>{t('my.weeklyTrend')}</Text>
        {avgScore !== null && (
          <Text style={[styles.avg, { color: themeColors.textMuted }]}>
            {t('my.avgScore')} {avgScore} · {Math.floor((avgTst ?? 0) / 60)}{t('my.hourShort')} {(avgTst ?? 0) % 60}{t('my.minShort')}
          </Text>
        )}
      </View>

      <View style={styles.chartRow}>
        {days.map((day, i) => {
          const barHeight = day.score !== null
            ? Math.max(8, (day.score / maxScore) * barMaxHeight)
            : 0;
          const isToday = i === 6;

          return (
            <View key={i} style={styles.barColumn}>
              {day.score !== null ? (
                <>
                  <Text style={[styles.barValue, { color: getBarColor(day.score) }]}>
                    {day.score}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getBarColor(day.score),
                        opacity: isToday ? 1 : 0.6,
                      },
                    ]}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.barValue, { color: 'transparent' }]}>-</Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: 8,
                        backgroundColor: themeColors.glassLight,
                      },
                    ]}
                  />
                </>
              )}
              <Text
                style={[
                  styles.dayLabel,
                  { color: isToday ? themeColors.textPrimary : themeColors.textMuted },
                  isToday && { fontWeight: '800' },
                ]}
              >
                {day.label}
              </Text>
            </View>
          );
        })}
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
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avg: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
