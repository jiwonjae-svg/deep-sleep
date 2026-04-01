import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlarm } from '@/hooks/useAlarm';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { TimePicker } from '@/components/alarm/TimePicker';
import { DaySelector } from '@/components/alarm/DaySelector';
import { Toggle } from '@/components/ui/Toggle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { Alarm, MathDifficulty } from '@/types';

const FADE_LABELS = ['꺼짐', '1분', '3분', '5분'];
const FADE_VALUES = [0, 1, 3, 5];

const SNOOZE_LABELS = ['3분', '5분', '10분'];
const SNOOZE_VALUES = [3, 5, 10];

const MATH_LABELS = ['쉬움', '보통', '어려움'];
const MATH_VALUES: MathDifficulty[] = ['easy', 'medium', 'hard'];

export default function AlarmEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addAlarm, updateAlarm, deleteAlarm } = useAlarm();
  const alarms = useAlarmStore((s) => s.alarms);
  const themeColors = useThemeColors();

  const existingAlarm = params.id ? alarms.find((a) => a.id === params.id) : undefined;
  const isNew = !existingAlarm;

  // State
  const [hour, setHour] = useState(existingAlarm?.time.hour ?? 7);
  const [minute, setMinute] = useState(existingAlarm?.time.minute ?? 0);
  const [days, setDays] = useState<boolean[]>(
    existingAlarm?.days ?? [false, false, false, false, false, false, false],
  );
  const [useSpecificDate, setUseSpecificDate] = useState(!!existingAlarm?.specificDate);
  const [specificDate, setSpecificDate] = useState(existingAlarm?.specificDate ?? '');
  const [label, setLabel] = useState(existingAlarm?.label ?? '');
  const [fadeInIdx, setFadeInIdx] = useState(
    FADE_VALUES.indexOf(existingAlarm?.fadeInMinutes ?? 0),
  );
  const [snoozeIdx, setSnoozeIdx] = useState(
    SNOOZE_VALUES.indexOf(existingAlarm?.snoozeMinutes ?? 5),
  );
  const [mathDismiss, setMathDismiss] = useState(existingAlarm?.mathDismiss ?? false);
  const [mathIdx, setMathIdx] = useState(
    MATH_VALUES.indexOf((existingAlarm?.mathDifficulty as MathDifficulty) ?? 'easy'),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        header: { paddingHorizontal: layout.screenPaddingH, height: layout.headerHeight, justifyContent: 'center' },
        title: { ...typography.h1, color: themeColors.textPrimary },
        content: { paddingHorizontal: layout.screenPaddingH, gap: spacing.md, paddingBottom: spacing['4xl'] },
        sectionTitle: { ...typography.bodyMedium, color: themeColors.textSecondary, marginTop: spacing.sm },
        hint: { ...typography.caption, color: themeColors.textMuted },
        input: { backgroundColor: themeColors.bgSecondary, borderRadius: layout.borderRadiusSm, borderWidth: 1, borderColor: themeColors.glassBorder, padding: layout.cardPadding, ...typography.body, color: themeColors.textPrimary },
        toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
        buttonGroup: { gap: spacing.md, marginTop: spacing.xl },
        modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
        modeBtn: { flex: 1, paddingVertical: 10, borderRadius: layout.borderRadiusSm, backgroundColor: themeColors.bgSecondary, alignItems: 'center', borderWidth: 1, borderColor: themeColors.glassBorder },
        modeBtnActive: { backgroundColor: themeColors.accent1, borderColor: themeColors.accent1 },
        modeBtnText: { ...typography.bodyMedium, color: themeColors.textSecondary },
        modeBtnTextActive: { color: themeColors.white },
      }),
    [themeColors],
  );

  const handleSave = async () => {
    const now = Date.now();
    const alarmData: Alarm = {
      id: existingAlarm?.id ?? `alarm_${now}`,
      time: { hour, minute },
      days: useSpecificDate ? [false, false, false, false, false, false, false] : days,
      specificDate: useSpecificDate && specificDate ? specificDate : null,
      enabled: existingAlarm?.enabled ?? true,
      soundId: existingAlarm?.soundId ?? 'rain-light',
      label: label.trim(),
      fadeInMinutes: FADE_VALUES[fadeInIdx] ?? 0,
      snoozeMinutes: SNOOZE_VALUES[snoozeIdx] ?? 5,
      mathDismiss,
      mathDifficulty: MATH_VALUES[mathIdx] ?? 'easy',
      notificationId: existingAlarm?.notificationId ?? null,
    };

    if (isNew) {
      await addAlarm(alarmData);
    } else {
      await updateAlarm(existingAlarm.id, alarmData);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existingAlarm) return;
    Alert.alert('알람 삭제', '이 알람을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteAlarm(existingAlarm.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isNew ? '알람 추가' : '알람 편집'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Time picker */}
          <TimePicker hour={hour} minute={minute} onHourChange={setHour} onMinuteChange={setMinute} />

          {/* Schedule mode */}
          <Text style={styles.sectionTitle}>일정</Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeBtn, !useSpecificDate && styles.modeBtnActive]}
              onPress={() => setUseSpecificDate(false)}
            >
              <Text style={[styles.modeBtnText, !useSpecificDate && styles.modeBtnTextActive]}>요일 반복</Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, useSpecificDate && styles.modeBtnActive]}
              onPress={() => setUseSpecificDate(true)}
            >
              <Text style={[styles.modeBtnText, useSpecificDate && styles.modeBtnTextActive]}>특정 날짜</Text>
            </Pressable>
          </View>

          {/* Days or Date */}
          {useSpecificDate ? (
            <>
              <TextInput
                style={styles.input}
                value={specificDate}
                onChangeText={setSpecificDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeColors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={styles.hint}>예: 2025-01-31</Text>
            </>
          ) : (
            <>
              <DaySelector days={days} onChange={setDays} />
            </>
          )}

          {/* Label */}
          <Text style={styles.sectionTitle}>라벨</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="알람 이름"
            placeholderTextColor={themeColors.textMuted}
            maxLength={30}
          />

          {/* Fade in */}
          <Text style={styles.sectionTitle}>페이드인</Text>
          <SegmentedControl
            options={FADE_LABELS}
            selectedIndex={fadeInIdx}
            onSelect={setFadeInIdx}
          />

          {/* Snooze */}
          <Text style={styles.sectionTitle}>스누즈</Text>
          <SegmentedControl
            options={SNOOZE_LABELS}
            selectedIndex={snoozeIdx}
            onSelect={setSnoozeIdx}
          />

          {/* Math dismiss */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>수학 문제 해제</Text>
              <Text style={styles.hint}>알람 해제 시 수학 문제를 풀어야 합니다</Text>
            </View>
            <Toggle value={mathDismiss} onValueChange={setMathDismiss} />
          </View>

          {mathDismiss && (
            <>
              <Text style={styles.sectionTitle}>문제 난이도</Text>
              <SegmentedControl
                options={MATH_LABELS}
                selectedIndex={mathIdx}
                onSelect={setMathIdx}
              />
            </>
          )}

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <Button title="저장" variant="primary" onPress={handleSave} />
            <Button title="취소" variant="ghost" onPress={() => router.back()} />
            {!isNew && (
              <Button title="삭제" variant="ghost" onPress={handleDelete} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


