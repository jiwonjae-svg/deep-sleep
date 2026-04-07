import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { DebtTrend } from '@/types';
import { useSleepStore } from '@/stores/useSleepStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { calculateSleepDebt, generateRecoverySuggestion } from '@/services/SleepDebtService';

const GAUGE_SIZE = 80;
const GAUGE_STROKE = 8;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function getDebtColor(debtMinutes: number): string {
  if (debtMinutes <= 0) return '#22c55e';
  if (debtMinutes <= 60) return '#eab308';
  if (debtMinutes <= 120) return '#f97316';
  return '#ef4444';
}

const TREND_ICONS: Record<DebtTrend, string> = {
  increasing: 'trending-up',
  stable: 'trending-flat',
  decreasing: 'trending-down',
};

interface Props {
  onPress?: () => void;
}

export function SleepDebtCard({ onPress }: Props) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const records = useSleepStore((s) => s.records);
  const targetSleepHours = useSettingsStore((s) => s.settings.targetSleepHours);
  const targetSleepMinutes = targetSleepHours * 60;

  const debtState = useMemo(
    () => calculateSleepDebt(records, targetSleepMinutes),
    [records, targetSleepMinutes],
  );

  const debtHours = Math.floor(debtState.currentDebtMinutes / 60);
  const debtMins = debtState.currentDebtMinutes % 60;
  const color = getDebtColor(debtState.currentDebtMinutes);

  // Gauge progress: 0 debt = full, 300min+ debt = empty
  const maxDebtForGauge = 300;
  const progress = Math.max(0, 1 - debtState.currentDebtMinutes / maxDebtForGauge);

  const recoverySuggestion = useMemo(
    () => generateRecoverySuggestion(debtState.currentDebtMinutes, targetSleepMinutes),
    [debtState.currentDebtMinutes, targetSleepMinutes],
  );

  const recoveryText = useMemo(() => {
    if (!recoverySuggestion) return t('sleepDebt.noDebt', { defaultValue: '수면 부채가 없습니다!' });
    const [key, param] = recoverySuggestion.split(':');
    if (key === 'sleepDebt.recoverySoon') {
      return t('sleepDebt.recoverySoon', { min: param, defaultValue: `${param}분만 더 자면 해소됩니다` });
    }
    if (key === 'sleepDebt.recoveryWeek') {
      return t('sleepDebt.recoveryWeek', { min: param, defaultValue: `매일 ${param}분 일찍 자면 1주일 후 해소` });
    }
    return t('sleepDebt.recoveryGradual', { defaultValue: '점진적으로 수면 시간을 늘려보세요' });
  }, [recoverySuggestion, t]);

  if (records.length < 2) return null;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
      onPress={onPress}
    >
      <View style={styles.row}>
        {/* Gauge */}
        <View style={styles.gaugeWrapper}>
          <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={GAUGE_RADIUS}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={GAUGE_STROKE}
              fill="none"
            />
            <Circle
              cx={GAUGE_SIZE / 2}
              cy={GAUGE_SIZE / 2}
              r={GAUGE_RADIUS}
              stroke={color}
              strokeWidth={GAUGE_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${GAUGE_CIRCUMFERENCE}`}
              strokeDashoffset={`${GAUGE_CIRCUMFERENCE * (1 - progress)}`}
              rotation={-90}
              origin={`${GAUGE_SIZE / 2},${GAUGE_SIZE / 2}`}
            />
          </Svg>
          <View style={styles.gaugeCenter}>
            <Text style={[styles.gaugeValue, { color }]}>
              {debtState.currentDebtMinutes === 0 ? '✓' : `${debtHours}h`}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            {t('sleepDebt.title', { defaultValue: '수면 부채' })}
          </Text>
          <Text style={[styles.value, { color: themeColors.textPrimary }]}>
            {debtState.currentDebtMinutes === 0
              ? t('sleepDebt.none', { defaultValue: '없음' })
              : `${debtHours}${t('my.hourShort', { defaultValue: '시간' })} ${debtMins}${t('my.minShort', { defaultValue: '분' })}`}
          </Text>
          <View style={styles.trendRow}>
            <MaterialIcons
              name={TREND_ICONS[debtState.debtTrend] as any}
              size={16}
              color={debtState.debtTrend === 'decreasing' ? '#22c55e' : debtState.debtTrend === 'increasing' ? '#ef4444' : themeColors.textMuted}
            />
            <Text style={[styles.trendText, { color: themeColors.textMuted }]}>
              {t(`sleepDebt.trend_${debtState.debtTrend}`, { defaultValue: debtState.debtTrend })}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.recovery, { color: themeColors.textMuted }]}>
        {recoveryText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gaugeWrapper: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recovery: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
});
