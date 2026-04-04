import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { MonthlyReport } from '@/services/SleepCoachingService';
import { getSoundById } from '@/data/sounds';

interface SleepReportProps {
  report: MonthlyReport;
}

export function SleepReportCard({ report }: SleepReportProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}${t('my.hourShort')} ${m}${t('my.minShort')}` : `${m}${t('my.minShort')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return themeColors.success;
    if (score >= 60) return themeColors.accent2;
    return themeColors.error;
  };

  const topSound = report.topSoundId ? getSoundById(report.topSoundId) : null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <View style={styles.header}>
        <MaterialIcons name="assessment" size={18} color={themeColors.accent2} />
        <Text style={[styles.title, { color: themeColors.textSecondary }]}>{t('report.title')}</Text>
      </View>

      {/* Score overview */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: getScoreColor(report.avgScore) }]}>{report.avgScore}</Text>
          <Text style={[styles.scoreLabel, { color: themeColors.textMuted }]}>{t('report.avgScore')}</Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>{formatDuration(report.avgTst)}</Text>
          <Text style={[styles.scoreLabel, { color: themeColors.textMuted }]}>{t('report.avgSleep')}</Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>{report.avgSe}%</Text>
          <Text style={[styles.scoreLabel, { color: themeColors.textMuted }]}>{t('report.avgEfficiency')}</Text>
        </View>
      </View>

      {/* Stats rows */}
      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <MaterialIcons name="nights-stay" size={16} color={themeColors.textMuted} />
          <Text style={[styles.statText, { color: themeColors.textPrimary }]}>
            {t('report.totalNights', { count: report.totalNights })}
          </Text>
        </View>

        {report.scoreChange !== null && (
          <View style={styles.statRow}>
            <MaterialIcons
              name={report.scoreChange >= 0 ? 'arrow-upward' : 'arrow-downward'}
              size={16}
              color={report.scoreChange >= 0 ? themeColors.success : themeColors.error}
            />
            <Text style={[styles.statText, { color: themeColors.textPrimary }]}>
              {report.scoreChange >= 0
                ? t('report.scoreUp', { diff: report.scoreChange })
                : t('report.scoreDown', { diff: Math.abs(report.scoreChange) })
              }
            </Text>
          </View>
        )}

        {report.bestDay && (
          <View style={styles.statRow}>
            <MaterialIcons name="emoji-events" size={16} color={themeColors.accent2} />
            <Text style={[styles.statText, { color: themeColors.textPrimary }]}>
              {t('report.bestDay', { date: report.bestDay.date, score: report.bestDay.score })}
            </Text>
          </View>
        )}

        {topSound && (
          <View style={styles.statRow}>
            <MaterialIcons name="music-note" size={16} color={themeColors.accent1} />
            <Text style={[styles.statText, { color: themeColors.textPrimary }]}>
              {t('report.topSound', { sound: t(`sounds.${topSound.id}`, { defaultValue: topSound.name }) })}
            </Text>
          </View>
        )}
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
    gap: 16,
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
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsSection: {
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
