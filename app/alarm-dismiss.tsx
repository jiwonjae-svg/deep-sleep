import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useAlarm } from '@/hooks/useAlarm';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { MathProblemView } from '@/components/alarm/MathProblem';
import { MascotImage } from '@/components/common/MascotImage';
import { Button } from '@/components/ui/Button';
import { generateMathProblem } from '@/utils/mathProblem';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { MathDifficulty } from '@/types';

export default function AlarmDismissScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ alarmId?: string }>();
  const { snooze } = useAlarm();
  const alarms = useAlarmStore((s) => s.alarms);
  const themeColors = useThemeColors();

  const alarm = alarms.find((a) => a.id === params.alarmId) ?? alarms[0];

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

  // 진동
  useEffect(() => {
    const id = setInterval(() => Vibration.vibrate([500, 500]), 1500);
    return () => {
      clearInterval(id);
      Vibration.cancel();
    };
  }, []);

  // 현재 시각
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 수학 문제 없으면 스와이프 모드
  const translateX = useSharedValue(0);

  const dismiss = () => {
    Vibration.cancel();
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

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleWrong = () => {
    Vibration.vibrate(300);
    setProblem(generateMathProblem((alarm?.mathDifficulty as MathDifficulty) ?? 'easy'));
  };

  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Time */}
      <Text style={styles.time}>{timeStr}</Text>

      {/* Mascot */}
      <MascotImage pose="alarm" size={150} />

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
          <Animated.View style={[styles.swipeArea, swipeStyle]}>
            <Text style={styles.swipeText}>← 밀어서 해제 →</Text>
          </Animated.View>
        </GestureDetector>
      )}

      {/* Snooze */}
      <View style={styles.snoozeArea}>
        <Button
          title={`${alarm?.snoozeMinutes ?? 5}분 스누즈`}
          variant="secondary"
          onPress={async () => {
            if (alarm) {
              await snooze(alarm, alarm.snoozeMinutes);
            }
            Vibration.cancel();
            router.back();
          }}
        />
      </View>
    </View>
  );
}


