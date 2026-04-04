import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { SleepRecord } from '@/stores/useSleepStore';
import { getSoundById } from '@/data/sounds';
import { useTranslation } from 'react-i18next';

interface SoundInsightsProps {
  records: SleepRecord[];
}

interface SoundCorrelation {
  soundId: string;
  avgScore: number;
  count: number;
}

export function SoundInsights({ records }: SoundInsightsProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const insights = useMemo(() => {
    // Only consider records with sound data
    const withSounds = records.filter((r) => r.soundsPlayed && r.soundsPlayed.length > 0);
    const withoutSounds = records.filter((r) => !r.soundsPlayed || r.soundsPlayed.length === 0);

    if (withSounds.length < 2) return null;

    // Compute average score per sound
    const soundScoreMap = new Map<string, { total: number; count: number }>();
    for (const record of withSounds) {
      for (const soundId of record.soundsPlayed!) {
        const existing = soundScoreMap.get(soundId) ?? { total: 0, count: 0 };
        existing.total += record.score;
        existing.count++;
        soundScoreMap.set(soundId, existing);
      }
    }

    const correlations: SoundCorrelation[] = [];
    soundScoreMap.forEach((val, soundId) => {
      if (val.count >= 2) {
        correlations.push({
          soundId,
          avgScore: Math.round(val.total / val.count),
          count: val.count,
        });
      }
    });

    correlations.sort((a, b) => b.avgScore - a.avgScore);

    const avgWithSound = withSounds.length > 0
      ? Math.round(withSounds.reduce((s, r) => s + r.score, 0) / withSounds.length)
      : null;
    const avgWithoutSound = withoutSounds.length > 0
      ? Math.round(withoutSounds.reduce((s, r) => s + r.score, 0) / withoutSounds.length)
      : null;

    // Noise insight
    const withNoise = records.filter((r) => r.noiseEvents && r.noiseEvents.length > 0);
    const avgNoiseCount = withNoise.length > 0
      ? Math.round(withNoise.reduce((s, r) => s + (r.noiseEvents?.length ?? 0), 0) / withNoise.length)
      : 0;

    return {
      topSounds: correlations.slice(0, 3),
      avgWithSound,
      avgWithoutSound,
      soundDiff: avgWithSound && avgWithoutSound ? avgWithSound - avgWithoutSound : null,
      avgNoiseCount,
      totalRecords: records.length,
    };
  }, [records]);

  if (!insights || insights.topSounds.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>{t('my.soundInsights')}</Text>

      {/* Sound vs No-Sound comparison */}
      {insights.soundDiff !== null && (
        <View style={[styles.insightRow, { backgroundColor: `${insights.soundDiff > 0 ? themeColors.success : themeColors.error}10` }]}>
          <MaterialIcons
            name={insights.soundDiff > 0 ? 'trending-up' : 'trending-down'}
            size={18}
            color={insights.soundDiff > 0 ? themeColors.success : themeColors.error}
          />
          <Text style={[styles.insightText, { color: themeColors.textPrimary }]}>
            {insights.soundDiff > 0
              ? t('my.soundBetter', { diff: insights.soundDiff })
              : t('my.soundWorse', { diff: Math.abs(insights.soundDiff) })
            }
          </Text>
        </View>
      )}

      {/* Top performing sounds */}
      {insights.topSounds.length > 0 && (
        <View style={styles.topSoundsSection}>
          <Text style={[styles.subTitle, { color: themeColors.textMuted }]}>{t('my.bestSounds')}</Text>
          {insights.topSounds.map((item, i) => {
            const soundInfo = getSoundById(item.soundId);
            return (
              <View key={item.soundId} style={styles.soundRow}>
                <Text style={[styles.rank, { color: themeColors.accent1 }]}>#{i + 1}</Text>
                <Text style={[styles.soundName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {soundInfo ? t(`sounds.${soundInfo.id}`, { defaultValue: soundInfo.name }) : item.soundId}
                </Text>
                <View style={styles.soundStats}>
                  <Text style={[styles.soundScore, { color: themeColors.success }]}>{item.avgScore}</Text>
                  <Text style={[styles.soundCount, { color: themeColors.textMuted }]}>({item.count}{t('my.timesUsed')})</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Noise events insight */}
      {insights.avgNoiseCount > 0 && (
        <View style={[styles.insightRow, { backgroundColor: `${themeColors.warning}10` }]}>
          <MaterialIcons name="volume-up" size={18} color={themeColors.warning} />
          <Text style={[styles.insightText, { color: themeColors.textPrimary }]}>
            {t('my.noiseInsight', { count: insights.avgNoiseCount })}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 14,
  },
  insightText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  topSoundsSection: {
    gap: 4,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rank: {
    fontSize: 12,
    fontWeight: '800',
    width: 24,
  },
  soundName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  soundStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soundScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  soundCount: {
    fontSize: 10,
    fontWeight: '600',
  },
});
