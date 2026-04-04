import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useSleepStore, MorningSurvey } from '@/stores/useSleepStore';
import { startSleepTracking, stopSleepTracking } from '@/services/SleepTrackingService';
import { WeeklyChart } from '@/components/sleep/WeeklyChart';
import { SoundInsights } from '@/components/sleep/SoundInsights';

export default function MyScreen() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const isTracking = useSleepStore((s) => s.isTracking);
  const records = useSleepStore((s) => s.records);
  const addSurvey = useSleepStore((s) => s.addSurvey);

  const [surveyRecordId, setSurveyRecordId] = useState<string | null>(null);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Partial<MorningSurvey>>({});

  const latestRecord = records.length > 0 ? records[0] : null;
  const recentRecords = records.slice(0, 7);

  const handleTrackingToggle = useCallback(async () => {
    if (isTracking) {
      const record = await stopSleepTracking();
      if (record) {
        setSurveyRecordId(record.id);
        setSurveyStep(1);
        setSurveyData({});
      }
    } else {
      const started = await startSleepTracking();
      if (!started) {
        Alert.alert(t('my.sensorUnavailable'), t('my.sensorUnavailableDesc'));
      }
    }
  }, [isTracking, t]);

  const handleSurveyAnswer = useCallback((key: string, value: string | number) => {
    const updated = { ...surveyData, [key]: value };
    setSurveyData(updated);
    if (surveyStep < 4) {
      setSurveyStep(surveyStep + 1);
    } else {
      // Complete survey
      if (surveyRecordId) {
        addSurvey(surveyRecordId, updated as MorningSurvey);
      }
      setSurveyRecordId(null);
      setSurveyStep(0);
    }
  }, [surveyData, surveyStep, surveyRecordId, addSurvey]);

  const skipSurvey = useCallback(() => {
    setSurveyRecordId(null);
    setSurveyStep(0);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return themeColors.success;
    if (score >= 60) return themeColors.accent2;
    return themeColors.error;
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}${t('my.hourShort')} ${m}${t('my.minShort')}` : `${m}${t('my.minShort')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('my.title')}</Text>

        {/* Survey overlay */}
        {surveyRecordId && surveyStep > 0 && (
          <View style={[styles.surveyCard, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.glassBorder }]}>
            <View style={styles.surveyHeader}>
              <Text style={[styles.surveyTitle, { color: themeColors.textPrimary }]}>{t('my.morningSurvey')}</Text>
              <Pressable onPress={skipSurvey}>
                <Text style={{ color: themeColors.textMuted, fontSize: 12 }}>{t('common.skip')}</Text>
              </Pressable>
            </View>

            {surveyStep === 1 && (
              <View>
                <Text style={[styles.surveyQuestion, { color: themeColors.textSecondary }]}>{t('my.surveyQ1')}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => handleSurveyAnswer('satisfaction', n)}>
                      <MaterialIcons
                        name={n <= (surveyData.satisfaction ?? 0) ? 'star' : 'star-border'}
                        size={36}
                        color={themeColors.accent2}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {surveyStep === 2 && (
              <View>
                <Text style={[styles.surveyQuestion, { color: themeColors.textSecondary }]}>{t('my.surveyQ2')}</Text>
                <View style={styles.optionCol}>
                  {(['instant', 'under15', 'under30', 'over60'] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      style={[styles.optionBtn, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
                      onPress={() => handleSurveyAnswer('solPerception', opt)}
                    >
                      <Text style={{ color: themeColors.textPrimary, fontSize: 13 }}>{t(`my.sol_${opt}`)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {surveyStep === 3 && (
              <View>
                <Text style={[styles.surveyQuestion, { color: themeColors.textSecondary }]}>{t('my.surveyQ3')}</Text>
                <View style={styles.optionCol}>
                  {(['0', '1-2', '3-4', '5+'] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      style={[styles.optionBtn, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
                      onPress={() => handleSurveyAnswer('awakeningsPerception', opt)}
                    >
                      <Text style={{ color: themeColors.textPrimary, fontSize: 13 }}>{t(`my.awk_${opt}`)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {surveyStep === 4 && (
              <View>
                <Text style={[styles.surveyQuestion, { color: themeColors.textSecondary }]}>{t('my.surveyQ4')}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} onPress={() => handleSurveyAnswer('freshness', n)}>
                      <MaterialIcons
                        name={n <= (surveyData.freshness ?? 0) ? 'star' : 'star-border'}
                        size={36}
                        color={themeColors.accent2}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Sleep Score Card */}
        <View style={[styles.scoreCard, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.glassBorder }]}>
          {latestRecord ? (
            <>
              <Text style={[styles.scoreLabel, { color: themeColors.textMuted }]}>{t('my.lastSleepScore')}</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(latestRecord.score) }]}>
                {latestRecord.score}
              </Text>
              <Text style={[styles.scoreDate, { color: themeColors.textMuted }]}>{latestRecord.date}</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="bedtime" size={48} color={themeColors.textMuted} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>{t('my.noRecords')}</Text>
            </>
          )}
        </View>

        {/* Tracking Button */}
        <Pressable
          style={[
            styles.trackingBtn,
            {
              backgroundColor: isTracking ? 'rgba(255,107,107,0.15)' : `${themeColors.accent1}20`,
              borderColor: isTracking ? themeColors.error : themeColors.accent1,
            },
          ]}
          onPress={handleTrackingToggle}
        >
          <MaterialIcons
            name={isTracking ? 'stop' : 'bedtime'}
            size={24}
            color={isTracking ? themeColors.error : themeColors.accent1}
          />
          <Text
            style={[
              styles.trackingBtnText,
              { color: isTracking ? themeColors.error : themeColors.accent1 },
            ]}
          >
            {isTracking ? t('my.stopTracking') : t('my.startTracking')}
          </Text>
        </Pressable>

        {/* Sleep Metrics */}
        {latestRecord && (
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
              <MaterialIcons name="schedule" size={20} color={themeColors.accent1} />
              <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{formatDuration(latestRecord.tst)}</Text>
              <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>{t('my.totalSleepTime')}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
              <MaterialIcons name="speed" size={20} color={themeColors.accent2} />
              <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{latestRecord.se}%</Text>
              <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>{t('my.sleepEfficiency')}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
              <MaterialIcons name="hourglass-bottom" size={20} color={themeColors.success} />
              <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{formatDuration(latestRecord.sol)}</Text>
              <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>{t('my.sleepOnset')}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
              <MaterialIcons name="notifications-active" size={20} color={themeColors.warning} />
              <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{latestRecord.awakenings}</Text>
              <Text style={[styles.metricLabel, { color: themeColors.textMuted }]}>{t('my.awakenings')}</Text>
            </View>
          </View>
        )}

        {/* Weekly Trend Chart */}
        {records.length >= 2 && (
          <WeeklyChart records={records} />
        )}

        {/* Sound-Sleep Insights */}
        {records.length >= 3 && (
          <SoundInsights records={records} />
        )}

        {/* Noise Events Summary for latest record */}
        {latestRecord?.noiseEvents && latestRecord.noiseEvents.length > 0 && (
          <View style={[styles.noiseCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('my.noiseReport')}</Text>
            <View style={styles.noiseRow}>
              <MaterialIcons name="volume-up" size={20} color={themeColors.warning} />
              <Text style={[styles.noiseText, { color: themeColors.textPrimary }]}>
                {t('my.noiseDetected', { count: latestRecord.noiseEvents.length })}
              </Text>
            </View>
            <Text style={[styles.noiseDetail, { color: themeColors.textMuted }]}>
              {t('my.noiseAvgAmp', {
                value: Math.round(
                  latestRecord.noiseEvents.reduce((s, e) => s + e.amplitude, 0) /
                  latestRecord.noiseEvents.length * 100
                ),
              })}
            </Text>
          </View>
        )}

        {/* Sounds Used in Latest Record */}
        {latestRecord?.soundsPlayed && latestRecord.soundsPlayed.length > 0 && (
          <View style={[styles.soundsUsedCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('my.soundsUsed')}</Text>
            <View style={styles.soundChips}>
              {latestRecord.soundsPlayed.map((id) => (
                <View key={id} style={[styles.soundChip, { backgroundColor: `${themeColors.accent1}20`, borderColor: `${themeColors.accent1}40` }]}>
                  <Text style={[styles.soundChipText, { color: themeColors.accent1 }]}>
                    {t(`sounds.${id}`, { defaultValue: id })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent History */}
        {recentRecords.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('my.recentHistory')}</Text>
            {recentRecords.map((record) => (
              <View
                key={record.id}
                style={[styles.historyItem, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
              >
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyDate, { color: themeColors.textPrimary }]}>{record.date}</Text>
                  <Text style={[styles.historyDuration, { color: themeColors.textMuted }]}>
                    {formatDuration(record.tst)} · {t('my.efficiency')} {record.se}%
                  </Text>
                </View>
                <View style={[styles.historyScore, { backgroundColor: `${getScoreColor(record.score)}20` }]}>
                  <Text style={[styles.historyScoreText, { color: getScoreColor(record.score) }]}>
                    {record.score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  // Score card
  scoreCard: {
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
  },
  scoreDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  // Tracking button
  trackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 9999,
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  trackingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 6,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // History
  historySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  historyLeft: {
    flex: 1,
    gap: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyDuration: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyScore: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyScoreText: {
    fontSize: 18,
    fontWeight: '800',
  },
  // Survey
  surveyCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  surveyQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  optionCol: {
    gap: 8,
  },
  optionBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  // Noise card
  noiseCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  noiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noiseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noiseDetail: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 28,
  },
  // Sounds used
  soundsUsedCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  soundChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundChip: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  soundChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
