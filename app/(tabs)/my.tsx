import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useSleepStore, MorningSurvey } from '@/stores/useSleepStore';
import { startSleepTracking, stopSleepTracking } from '@/services/SleepTrackingService';
import { WeeklyChart } from '@/components/sleep/WeeklyChart';
import { SoundInsights } from '@/components/sleep/SoundInsights';
import { CoachingCard } from '@/components/sleep/CoachingCard';
import { SleepReportCard } from '@/components/sleep/SleepReport';
import { SnoringReport } from '@/components/sleep/SnoringReport';
import { SnoringTimeline } from '@/components/sleep/SnoringTimeline';
import { SleepDebtCard } from '@/components/sleep/SleepDebtCard';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useBreathingStore } from '@/stores/useBreathingStore';
import { Toggle } from '@/components/ui/Toggle';
import { OptionModal, OptionItem } from '@/components/ui/OptionModal';
import { analyzeSleepPattern, generateCoachingTips, generateMonthlyReport } from '@/services/SleepCoachingService';

export default function MyScreen() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const isTracking = useSleepStore((s) => s.isTracking);
  const records = useSleepStore((s) => s.records);
  const snoringRecords = useSleepStore((s) => s.snoringRecords);
  const addSurvey = useSleepStore((s) => s.addSurvey);
  const deleteRecord = useSleepStore((s) => s.deleteRecord);

  const [surveyRecordId, setSurveyRecordId] = useState<string | null>(null);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Partial<MorningSurvey>>({});
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [sleepGoalModalVisible, setSleepGoalModalVisible] = useState(false);

  const { settings, updateSettings } = useSettingsStore();

  const SLEEP_GOAL_OPTIONS: OptionItem<string>[] = [
    { value: '6', label: `6${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '6.5', label: `6.5${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '7', label: `7${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '7.5', label: `7.5${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '8', label: `8${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '8.5', label: `8.5${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '9', label: `9${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '9.5', label: `9.5${t('settings.hoursUnit', { defaultValue: '시간' })}` },
    { value: '10', label: `10${t('settings.hoursUnit', { defaultValue: '시간' })}` },
  ];

  const latestRecord = records.length > 0 ? records[0] : null;
  const recentRecords = records.slice(0, 5);
  const latestSnoring = snoringRecords.length > 0 ? snoringRecords[0] : null;
  const breathingRecords = useBreathingStore((s) => s.records);
  const todayBreathingCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return breathingRecords.filter((r) => r.date === today).length;
  }, [breathingRecords]);
  const todayBreathingSec = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return breathingRecords.filter((r) => r.date === today).reduce((s, r) => s + r.totalDurationSec, 0);
  }, [breathingRecords]);

  // Phase 4: AI coaching & report
  const sleepPattern = useMemo(() => analyzeSleepPattern(records), [records]);
  const coachingTips = useMemo(() => generateCoachingTips(records, sleepPattern), [records, sleepPattern]);
  const monthlyReport = useMemo(() => generateMonthlyReport(records), [records]);

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

  const handleDeleteRecord = useCallback((recordId: string, date: string) => {
    Alert.alert(
      t('my.deleteRecordTitle', { defaultValue: '수면 기록 삭제' }),
      t('my.deleteRecordMsg', { date, defaultValue: `${date} 기록을 삭제하시겠습니까?` }),
      [
        { text: t('common.cancel', { defaultValue: '취소' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: '삭제' }),
          style: 'destructive',
          onPress: () => deleteRecord(recordId),
        },
      ],
    );
  }, [deleteRecord, t]);

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

        {/* Auto Sleep Tracking Toggle */}
        <View style={[styles.settingRow, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
          <MaterialIcons name="bedtime" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.settingRowLabel, { color: themeColors.textPrimary }]}>
            {t('settings.autoSleepTracking', { defaultValue: '재생 시 수면 추적 자동 시작' })}
          </Text>
          <Toggle
            value={settings.autoSleepTracking}
            onValueChange={(v) => updateSettings({ autoSleepTracking: v })}
          />
        </View>

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

        {/* Sleep Debt */}
        <SleepDebtCard />

        {/* Target Sleep Hours */}
        <Pressable
          style={[styles.settingRow, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
          onPress={() => setSleepGoalModalVisible(true)}
        >
          <MaterialIcons name="hotel" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.settingRowLabel, { color: themeColors.textPrimary, flex: 1 }]}>
            {t('settings.targetSleepHours', { defaultValue: '목표 수면 시간' })}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', marginRight: 4 }}>
            {settings.targetSleepHours}{t('settings.hoursUnit', { defaultValue: '시간' })}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
        </Pressable>

        {/* Breathing */}
        <View style={[styles.breathingCard, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
          <View style={styles.breathingHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
                {t('breathing.title', { defaultValue: '호흡 가이드' })}
              </Text>
              {todayBreathingCount > 0 && (
                <Text style={[styles.breathingStats, { color: themeColors.textMuted }]}>
                  {t('my.breathingToday', {
                    count: todayBreathingCount,
                    seconds: todayBreathingSec,
                    defaultValue: `오늘 ${todayBreathingCount}회 · ${Math.floor(todayBreathingSec / 60)}분 ${todayBreathingSec % 60}초`,
                  })}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.breathingBtn, { borderColor: themeColors.accent1 }]}
              onPress={() => router.push('/breathing')}
            >
              <MaterialIcons name="self-improvement" size={18} color={themeColors.accent1} />
              <Text style={[styles.breathingBtnText, { color: themeColors.accent1 }]}>
                {t('breathing.start', { defaultValue: '시작' })}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.breathingDesc, { color: themeColors.textMuted }]}>
            {t('my.breathingDesc', { defaultValue: '호흡 패턴을 따라하며 긴장을 풀고 수면에 들어가세요. 4-7-8, 박스 호흡 등의 다양한 패턴을 제공합니다.' })}
          </Text>
        </View>

        {/* Sound-Sleep Insights */}
        {records.length >= 3 && (
          <SoundInsights records={records} />
        )}

        {/* AI Sleep Coaching */}
        {coachingTips.length > 0 && (
          <CoachingCard tips={coachingTips} />
        )}

        {/* Monthly Sleep Report */}
        {monthlyReport && (
          <SleepReportCard report={monthlyReport} />
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

        {latestSnoring && latestSnoring.events.length > 0 && (
          <SnoringReport record={latestSnoring} />
        )}

        {latestSnoring && latestSnoring.events.length > 0 && latestRecord && (
          <SnoringTimeline
            events={latestSnoring.events}
            trackingStart={latestRecord.trackingStart}
            trackingEnd={latestRecord.trackingEnd}
          />
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
              <Pressable
                key={record.id}
                style={[styles.historyItem, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
                onLongPress={() => handleDeleteRecord(record.id, record.date)}
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
              </Pressable>
            ))}
            {records.length > 5 && (
              <Pressable
                style={[styles.viewAllBtn, { borderColor: themeColors.glassBorder }]}
                onPress={() => setHistoryModalVisible(true)}
              >
                <Text style={[styles.viewAllBtnText, { color: themeColors.accent1 }]}>
                  {t('my.viewAll', { defaultValue: '전체 보기' })} ({records.length})
                </Text>
                <MaterialIcons name="chevron-right" size={18} color={themeColors.accent1} />
              </Pressable>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Full History Modal */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                {t('my.allRecords', { defaultValue: '전체 수면 기록' })}
              </Text>
              <Pressable onPress={() => setHistoryModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={themeColors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              renderItem={({ item: record }) => (
                <Pressable
                  style={[styles.historyItem, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}
                  onLongPress={() => handleDeleteRecord(record.id, record.date)}
                >
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyDate, { color: themeColors.textPrimary }]}>{record.date}</Text>
                    <Text style={[styles.historyDuration, { color: themeColors.textMuted }]}>
                      {formatDuration(record.tst)} · {t('my.efficiency')} {record.se}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.historyScore, { backgroundColor: `${getScoreColor(record.score)}20` }]}>
                      <Text style={[styles.historyScoreText, { color: getScoreColor(record.score) }]}>
                        {record.score}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteRecord(record.id, record.date)}
                      hitSlop={8}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={themeColors.textMuted} />
                    </Pressable>
                  </View>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: themeColors.textMuted, textAlign: 'center', marginTop: 40 }]}>
                  {t('my.noRecords')}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Sleep Goal Modal */}
      <OptionModal
        visible={sleepGoalModalVisible}
        title={t('settings.targetSleepHours', { defaultValue: '목표 수면 시간' })}
        options={SLEEP_GOAL_OPTIONS}
        selected={String(settings.targetSleepHours)}
        onSelect={(v) => updateSettings({ targetSleepHours: parseFloat(v) })}
        onClose={() => setSleepGoalModalVisible(false)}
      />
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
  // Breathing card
  breathingCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  breathingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breathingStats: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  breathingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  breathingBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breathingDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 10,
  },
  // Setting row (inline toggle / selector)
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  settingRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  // View All button
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Full History Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
