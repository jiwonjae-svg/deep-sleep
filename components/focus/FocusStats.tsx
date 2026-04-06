import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '@/stores/useFocusStore';

const CHART_WIDTH = 280;
const BAR_MAX_HEIGHT = 60;
const BAR_WIDTH = 28;

const DAY_LABELS_KO = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function FocusStats() {
  const themeColors = useThemeColors();
  const { t, i18n } = useTranslation();
  const todayFocusMinutes = useFocusStore((s) => s.todayFocusMinutes);
  const records = useFocusStore((s) => s.records);

  const dayLabels = i18n.language === 'ko' ? DAY_LABELS_KO : DAY_LABELS_EN;

  // Build 7-day chart data
  const chartData = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const weeklyStats = records.filter((r) => r.date >= cutoffStr);

    const data: { date: string; minutes: number; dayIdx: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0
      const record = weeklyStats.find((r) => r.date === dateStr);
      data.push({
        date: dateStr,
        minutes: record?.totalFocusMinutes ?? 0,
        dayIdx,
      });
    }

    return data;
  }, [records]);

  const maxMinutes = Math.max(60, ...chartData.map((d) => d.minutes));
  const totalWeekMinutes = chartData.reduce((s, d) => s + d.minutes, 0);

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}${t('my.hourShort', { defaultValue: '시간' })} ${m}${t('my.minShort', { defaultValue: '분' })}` : `${m}${t('my.minShort', { defaultValue: '분' })}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>
        {t('focus.stats', { defaultValue: '집중 통계' })}
      </Text>

      {/* Today summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {formatDuration(todayFocusMinutes)}
          </Text>
          <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
            {t('focus.today', { defaultValue: '오늘' })}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>
            {formatDuration(totalWeekMinutes)}
          </Text>
          <Text style={[styles.summaryLabel, { color: themeColors.textMuted }]}>
            {t('focus.thisWeek', { defaultValue: '이번 주' })}
          </Text>
        </View>
      </View>

      {/* Weekly bar chart */}
      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={BAR_MAX_HEIGHT}>
          {chartData.map((d, i) => {
            const barHeight = maxMinutes > 0 ? (d.minutes / maxMinutes) * BAR_MAX_HEIGHT : 0;
            const x = i * (BAR_WIDTH + 12);
            return (
              <Rect
                key={d.date}
                x={x}
                y={BAR_MAX_HEIGHT - barHeight}
                width={BAR_WIDTH}
                height={Math.max(2, barHeight)}
                rx={4}
                fill={d.minutes > 0 ? themeColors.accent1 : 'rgba(255,255,255,0.08)'}
              />
            );
          })}
        </Svg>
        <View style={styles.dayLabelsRow}>
          {chartData.map((d, i) => (
            <Text
              key={d.date}
              style={[styles.dayLabel, { color: themeColors.textMuted, width: BAR_WIDTH, marginRight: i < 6 ? 12 : 0 }]}
            >
              {dayLabels[d.dayIdx]}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 24,
  },
  summaryItem: {
    gap: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabelsRow: {
    flexDirection: 'row',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
