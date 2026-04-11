import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlarm } from '@/hooks/useAlarm';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { TimePicker } from '@/components/alarm/TimePicker';
import { DaySelector } from '@/components/alarm/DaySelector';
import { Toggle } from '@/components/ui/Toggle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { Alarm, MathDifficulty, SmartAlarmConfig } from '@/types';
import { SmartAlarmConfigView } from '@/components/alarm/SmartAlarmConfig';
import { AlarmSoundModal } from '@/components/alarm/AlarmSoundModal';

const FADE_VALUES = [0, 1, 3, 5];
const SNOOZE_VALUES = [3, 5, 10];
const MATH_VALUES: MathDifficulty[] = ['easy', 'medium', 'hard'];

function SimpleCalendar({ selectedDate, onSelectDate }: { selectedDate: string; onSelectDate: (d: string) => void }) {
  const today = new Date();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const WEEKDAY_LABELS = t('alarms.calendarWeekdays', { returnObjects: true }) as string[];

  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate) { const [y] = selectedDate.split('-'); return parseInt(y, 10) || today.getFullYear(); }
    return today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) { const parts = selectedDate.split('-'); return parseInt(parts[1], 10) - 1 || today.getMonth(); }
    return today.getMonth();
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={calStyles.container}>
      <View style={calStyles.header}>
        <Pressable onPress={goToPrevMonth} style={calStyles.navBtn}>
          <MaterialIcons name="chevron-left" size={24} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <Text style={calStyles.monthLabel}>{t('alarms.calendarFormat', { year: viewYear, month: viewMonth + 1 })}</Text>
        <Pressable onPress={goToNextMonth} style={calStyles.navBtn}>
          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <View style={calStyles.weekRow}>
        {WEEKDAY_LABELS.map((d) => (
          <Text key={d} style={calStyles.weekDay}>{d}</Text>
        ))}
      </View>
      <View style={calStyles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={calStyles.cell} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;
          return (
            <Pressable
              key={dateStr}
              style={calStyles.cell}
              onPress={() => !isPast && onSelectDate(dateStr)}
              disabled={isPast}
            >
              <View style={calStyles.cellCircle}>
                {isSelected && <View style={[calStyles.cellCircleBg, { backgroundColor: themeColors.accent1 }]} />}
                {isToday && !isSelected && <View style={calStyles.cellCircleTodayRing} />}
                <Text style={[calStyles.cellText, isSelected && calStyles.cellTextSelected, isPast && calStyles.cellTextPast]}>
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellCircle: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  cellCircleBg: { position: 'absolute', width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
  cellCircleTodayRing: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cellText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  cellTextSelected: { color: '#ffffff', fontWeight: '800' },
  cellTextPast: { color: 'rgba(255,255,255,0.2)' },
});

export default function AlarmEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const { addAlarm, updateAlarm, deleteAlarm } = useAlarm();
  const alarms = useAlarmStore((s) => s.alarms);

  const FADE_LABELS = t('alarms.fadeLabels', { returnObjects: true }) as string[];
  const SNOOZE_LABELS = t('alarms.snoozeLabels', { returnObjects: true }) as string[];
  const MATH_LABELS = t('alarms.mathLabels', { returnObjects: true }) as string[];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 22, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateClose = useCallback((cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(cb);
  }, [fadeAnim, scaleAnim]);

  const existingAlarm = params.id ? alarms.find((a) => a.id === params.id) : undefined;
  const isNew = !existingAlarm;

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
  const [smartAlarm, setSmartAlarm] = useState<SmartAlarmConfig | null>(
    existingAlarm?.smartAlarm ?? null,
  );
  const [soundId, setSoundId] = useState(existingAlarm?.soundId ?? 'alarm-classic');
  const [vibration, setVibration] = useState(existingAlarm?.vibration ?? true);
  const [soundModalVisible, setSoundModalVisible] = useState(false);

  const handleSave = async () => {
    const now = Date.now();
    const alarmData: Alarm = {
      id: existingAlarm?.id ?? `alarm_${now}`,
      time: { hour, minute },
      days: useSpecificDate ? [false, false, false, false, false, false, false] : days,
      specificDate: useSpecificDate && specificDate ? specificDate : null,
      enabled: existingAlarm?.enabled ?? true,
      soundId,
      vibration,
      label: label.trim(),
      fadeInMinutes: FADE_VALUES[fadeInIdx] ?? 0,
      snoozeMinutes: SNOOZE_VALUES[snoozeIdx] ?? 5,
      mathDismiss,
      mathDifficulty: MATH_VALUES[mathIdx] ?? 'easy',
      smartAlarm,
      notificationId: existingAlarm?.notificationId ?? null,
    };

    if (isNew) {
      await addAlarm(alarmData);
    } else {
      await updateAlarm(existingAlarm.id, alarmData);
    }
    animateClose(() => router.back());
  };

  const handleDelete = () => {
    if (!existingAlarm) return;
    Alert.alert(t('alarms.deleteAlarmTitle'), t('alarms.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAlarm(existingAlarm.id);
          animateClose(() => router.back());
        },
      },
    ]);
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} onResponderRelease={() => animateClose(() => router.back())} />
      <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isNew ? t('alarms.addTitle') : t('alarms.editTitle')}</Text>

          {/* Time picker */}
          <TimePicker hour={hour} minute={minute} onHourChange={setHour} onMinuteChange={setMinute} />

          {/* Schedule mode */}
          <Text style={styles.sectionTitle}>{t('alarms.schedule')}</Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeBtn, !useSpecificDate && styles.modeBtnActive, !useSpecificDate && { backgroundColor: themeColors.accent1, borderColor: themeColors.accent1 }]}
              onPress={() => setUseSpecificDate(false)}
            >
              <Text style={[styles.modeBtnText, !useSpecificDate && styles.modeBtnTextActive]}>{t('alarms.repeatDays')}</Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, useSpecificDate && styles.modeBtnActive, useSpecificDate && { backgroundColor: themeColors.accent1, borderColor: themeColors.accent1 }]}
              onPress={() => setUseSpecificDate(true)}
            >
              <Text style={[styles.modeBtnText, useSpecificDate && styles.modeBtnTextActive]}>{t('alarms.specificDate')}</Text>
            </Pressable>
          </View>

          {useSpecificDate ? (
            <SimpleCalendar selectedDate={specificDate} onSelectDate={setSpecificDate} />
          ) : (
            <DaySelector days={days} onChange={setDays} />
          )}

          {/* Label */}
          <Text style={styles.sectionTitle}>{t('alarms.label')}</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder={t('alarms.labelPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={30}
          />

          {/* Alarm Sound */}
          <Text style={styles.sectionTitle}>{t('alarms.alarmSound')}</Text>
          <Pressable style={styles.soundRow} onPress={() => setSoundModalVisible(true)}>
            <MaterialIcons name="music-note" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.soundName} numberOfLines={1}>
              {soundId.startsWith('custom_')
                ? (useAlarmStore.getState().customAlarmSounds.find((s) => s.id === soundId)?.name ?? soundId)
                : t(`alarms.defaultSounds.${soundId}`, { defaultValue: soundId })}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
          </Pressable>

          {/* Vibration */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{t('alarms.vibration')}</Text>
            </View>
            <Toggle value={vibration} onValueChange={setVibration} />
          </View>

          {/* Fade in */}
          <Text style={styles.sectionTitle}>{t('alarms.fadeIn')}</Text>
          <SegmentedControl
            options={FADE_LABELS}
            selectedIndex={fadeInIdx}
            onSelect={setFadeInIdx}
          />

          {/* Snooze */}
          <Text style={styles.sectionTitle}>{t('alarms.snooze')}</Text>
          <SegmentedControl
            options={SNOOZE_LABELS}
            selectedIndex={snoozeIdx}
            onSelect={setSnoozeIdx}
          />

          {/* Math dismiss */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{t('alarms.mathDismiss')}</Text>
              <Text style={styles.hint}>{t('alarms.mathDismissDesc')}</Text>
            </View>
            <Toggle value={mathDismiss} onValueChange={setMathDismiss} />
          </View>

          {mathDismiss && (
            <>
              <Text style={styles.sectionTitle}>{t('alarms.difficulty')}</Text>
              <SegmentedControl
                options={MATH_LABELS}
                selectedIndex={mathIdx}
                onSelect={setMathIdx}
              />
            </>
          )}

          {/* Smart alarm */}
          <SmartAlarmConfigView config={smartAlarm} onChange={setSmartAlarm} />

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <Button title={t('common.save')} variant="primary" onPress={handleSave} />
            <Button title={t('common.cancel')} variant="ghost" onPress={() => animateClose(() => router.back())} />
            {!isNew && (
              <Button title={t('common.delete')} variant="ghost" onPress={handleDelete} />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
    <AlarmSoundModal
      visible={soundModalVisible}
      selected={soundId}
      onSelect={setSoundId}
      onClose={() => setSoundModalVisible(false)}
    />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'rgba(17,21,31,0.92)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    marginBottom: 4,
  },
  hint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    marginRight: 4,
    fontSize: 14,
    color: '#ffffff',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingRight: 4 },
  buttonGroup: { gap: 12, marginTop: 20 },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    gap: 10,
  },
  soundName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modeBtnActive: { backgroundColor: '#456eea', borderColor: '#456eea' },
  modeBtnText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  modeBtnTextActive: { color: '#ffffff' },
});


