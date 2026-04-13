import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, Image, Pressable, ScrollView } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { getSoundAsset } from '@/data/soundAssets';
import { useAlarm } from '@/hooks/useAlarm';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSleepStore, MorningSurvey } from '@/stores/useSleepStore';
import { MathProblemView } from '@/components/alarm/MathProblem';
import { Button } from '@/components/ui/Button';
import { generateMathProblem } from '@/utils/mathProblem';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { MathDifficulty } from '@/types';

export default function AlarmDismissScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ alarmId?: string }>();
  const { snooze } = useAlarm();
  const alarms = useAlarmStore((s) => s.alarms);
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const alarm = alarms.find((a) => a.id === params.alarmId) ?? alarms[0];

  // Morning survey state (10.6)
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [satisfaction, setSatisfaction] = useState(3);
  const [solPerception, setSolPerception] = useState<'instant' | 'under15' | 'under30' | 'over60'>('under15');
  const [awakeningsPerception, setAwakeningsPerception] = useState<'0' | '1-2' | '3-4' | '5+'>('0');
  const [freshness, setFreshness] = useState(3);

  const sleepRecords = useSleepStore((s) => s.records);
  const addSurvey = useSleepStore((s) => s.addSurvey);

  const [mathMode, setMathMode] = useState(alarm?.mathDismiss ?? false);
  const [problem, setProblem] = useState(
    generateMathProblem((alarm?.mathDifficulty as MathDifficulty) ?? 'easy'),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, padding: layout.screenPaddingH },
        time: { fontFamily: 'monospace', fontSize: 60, fontWeight: '700', color: themeColors.textPrimary, letterSpacing: 4 },
        label: { ...typography.h3, color: themeColors.textSecondary },
        mathArea: { width: '100%', alignItems: 'center' },
        swipeArea: { width: '100%', height: 80, backgroundColor: themeColors.glassLight, borderRadius: layout.borderRadiusPill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColors.glassBorder },
        swipeText: { ...typography.bodyMedium, color: themeColors.textSecondary },
        snoozeArea: { width: '100%', alignItems: 'center', marginTop: spacing.lg },
      }),
    [themeColors],
  );

  // 알람 화면 표시 중 화면 꺼짐 방지
  useEffect(() => {
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, []);

  // 알람 페이드인 오디오
  const alarmSoundRef = useRef<Audio.Sound | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fadeInMinutes = alarm?.fadeInMinutes ?? 0;
    if (fadeInMinutes <= 0) return; // 페이드인 비활성

    let cancelled = false;
    const FADE_DURATION_MS = fadeInMinutes * 60 * 1000;
    const FADE_STEP_MS = 500; // 0.5초 간격
    const startTime = Date.now();

    (async () => {
      try {
        // 알람의 soundId 또는 기본 사운드 사용
        const source = getSoundAsset(alarm?.soundId ?? 'singing-bowl')
          ?? require('@/assets/sounds/singing-bowl-1.mp3');
        const { sound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: false, isLooping: true, volume: 0 },
        );
        if (cancelled) { await sound.unloadAsync(); return; }
        alarmSoundRef.current = sound;
        await sound.playAsync();

        // 페이드인: 볼륨 0→1 로 서서히 증가
        fadeIntervalRef.current = setInterval(async () => {
          const elapsed = Date.now() - startTime;
          const vol = Math.min(1, elapsed / FADE_DURATION_MS);
          try { await sound.setVolumeAsync(vol); } catch {}
          if (vol >= 1 && fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }, FADE_STEP_MS);
      } catch {}
    })();

    return () => {
      cancelled = true;
      if (fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
      if (alarmSoundRef.current) {
        alarmSoundRef.current.stopAsync().catch(() => {});
        alarmSoundRef.current.unloadAsync().catch(() => {});
        alarmSoundRef.current = null;
      }
    };
  }, [alarm?.fadeInMinutes]);

  // 진동 (알람에서 진동 설정이 꺼져 있으면 건너뜀)
  useEffect(() => {
    if (alarm && alarm.vibration === false) return;
    const id = setInterval(() => Vibration.vibrate([500, 500]), 1500);
    return () => {
      clearInterval(id);
      Vibration.cancel();
    };
  }, [alarm]);

  // 현재 시각
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 수학 문제 없으면 스와이프 모드
  const translateX = useSharedValue(0);

  const swipeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const dismiss = () => {
    Vibration.cancel();
    // 알람 페이드인 오디오 정리
    if (fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
    if (alarmSoundRef.current) {
      alarmSoundRef.current.stopAsync().catch(() => {});
      alarmSoundRef.current.unloadAsync().catch(() => {});
      alarmSoundRef.current = null;
    }
    // Stop sleep timer if alarm-sync mode
    const timerState = useTimerStore.getState();
    if (timerState.isActive && timerState.isAlarmSync) {
      timerState.cancelTimer();
    }
    // 수면 기록이 있으면 아침 설문 표시 (10.6)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = sleepRecords.find((r) => r.date === todayStr && !r.survey);
    if (todayRecord) {
      setShowSurvey(true);
    } else {
      router.back();
    }
  };

  const submitSurvey = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = sleepRecords.find((r) => r.date === todayStr && !r.survey);
    if (todayRecord) {
      const survey: MorningSurvey = { satisfaction, solPerception, awakeningsPerception, freshness };
      addSurvey(todayRecord.id, survey);
    }
    router.back();
  };

  const skipSurvey = () => {
    router.back();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 150) {
        runOnJS(dismiss)();
      } else {
        translateX.value = withSpring(0);
      }
    });



  const handleWrong = () => {
    Vibration.vibrate(300);
    setProblem(generateMathProblem((alarm?.mathDifficulty as MathDifficulty) ?? 'easy'));
  };

  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Time */}
      <Text style={styles.time}>{timeStr}</Text>

      {/* Alarm icon */}
      <Image source={require('@/assets/images/logo/main_logo.png')} style={{ width: 120, height: 120 }} resizeMode="contain" />

      {alarm?.label && <Text style={styles.label}>{alarm.label}</Text>}

      {/* Content */}
      {mathMode ? (
        <View style={styles.mathArea}>
          <MathProblemView
            problem={problem}
            onSolved={dismiss}
            onWrong={handleWrong}
          />
        </View>
      ) : (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.swipeArea, swipeAnimatedStyle]}>
            <Text style={styles.swipeText}>{t('alarms.swipeToDismiss')}</Text>
          </Animated.View>
        </GestureDetector>
      )}

      {/* Snooze */}
      <View style={styles.snoozeArea}>
        <Button
          title={t('alarms.snoozeBtn', { min: alarm?.snoozeMinutes ?? 5 })}
          variant="secondary"
          onPress={async () => {
            if (alarm) {
              await snooze(alarm, alarm.snoozeMinutes);
            }
            Vibration.cancel();
            if (fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
            if (alarmSoundRef.current) {
              alarmSoundRef.current.stopAsync().catch(() => {});
              alarmSoundRef.current.unloadAsync().catch(() => {});
              alarmSoundRef.current = null;
            }
            router.back();
          }}
        />
      </View>

      {/* Morning Survey Overlay (10.6) */}
      {showSurvey && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.bgPrimary, padding: layout.screenPaddingH, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }]}>
          <Text style={{ ...typography.h2, color: themeColors.textPrimary, textAlign: 'center' }}>
            {t('my.surveyTitle')}
          </Text>
          <Text style={{ ...typography.body, color: themeColors.textSecondary, textAlign: 'center' }}>
            {t('my.surveySubtitle')}
          </Text>

          {surveyStep === 0 && (
            <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
              <Text style={{ ...typography.bodyMedium, color: themeColors.textPrimary }}>{t('my.surveyQ1')}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Pressable key={v} onPress={() => setSatisfaction(v)}>
                    <Text style={{ fontSize: 32 }}>{v <= satisfaction ? '⭐' : '☆'}</Text>
                  </Pressable>
                ))}
              </View>
              <Button title={t('common.next')} variant="primary" onPress={() => setSurveyStep(1)} />
            </View>
          )}

          {surveyStep === 1 && (
            <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
              <Text style={{ ...typography.bodyMedium, color: themeColors.textPrimary }}>{t('my.surveyQ2')}</Text>
              {(['instant', 'under15', 'under30', 'over60'] as const).map((opt) => (
                <Pressable
                  key={opt}
                  style={{ backgroundColor: solPerception === opt ? themeColors.accent1 : 'rgba(255,255,255,0.08)', borderRadius: 12, padding: spacing.md, width: '100%', alignItems: 'center' }}
                  onPress={() => setSolPerception(opt)}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>{t(`my.sol_${opt}`)}</Text>
                </Pressable>
              ))}
              <Button title={t('common.next')} variant="primary" onPress={() => setSurveyStep(2)} />
            </View>
          )}

          {surveyStep === 2 && (
            <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
              <Text style={{ ...typography.bodyMedium, color: themeColors.textPrimary }}>{t('my.surveyQ3')}</Text>
              {(['0', '1-2', '3-4', '5+'] as const).map((opt) => (
                <Pressable
                  key={opt}
                  style={{ backgroundColor: awakeningsPerception === opt ? themeColors.accent1 : 'rgba(255,255,255,0.08)', borderRadius: 12, padding: spacing.md, width: '100%', alignItems: 'center' }}
                  onPress={() => setAwakeningsPerception(opt)}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>{t(`my.awk_${opt}`)}</Text>
                </Pressable>
              ))}
              <Button title={t('common.next')} variant="primary" onPress={() => setSurveyStep(3)} />
            </View>
          )}

          {surveyStep === 3 && (
            <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
              <Text style={{ ...typography.bodyMedium, color: themeColors.textPrimary }}>{t('my.surveyQ4')}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Pressable key={v} onPress={() => setFreshness(v)}>
                    <Text style={{ fontSize: 32 }}>{v <= freshness ? '⭐' : '☆'}</Text>
                  </Pressable>
                ))}
              </View>
              <Button title={t('my.surveySubmit')} variant="primary" onPress={submitSurvey} />
            </View>
          )}

          <Pressable onPress={skipSurvey}>
            <Text style={{ ...typography.bodyMedium, color: themeColors.textMuted }}>{t('common.skip')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}


