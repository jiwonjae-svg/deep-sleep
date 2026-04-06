import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Toggle } from '@/components/ui/Toggle';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { msUntilAlarm } from '@/utils/formatTime';

const QUICK_MINUTES = [15, 30, 45, 60] as const;

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (minutes: number, alarmSync?: boolean) => void;
}

export function TimerModal({ visible, onClose, onStart }: TimerModalProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const [selectedQuick, setSelectedQuick] = useState<number>(15);
  const [useAlarmSync, setUseAlarmSync] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [useUnlimited, setUseUnlimited] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);

  // Custom time picker modal state
  const [customPickerVisible, setCustomPickerVisible] = useState(false);
  const [tempHours, setTempHours] = useState(0);
  const [tempMinutes, setTempMinutes] = useState(30);
  const [editingHours, setEditingHours] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState(false);
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  // Store previous state before opening custom picker
  const [prevState, setPrevState] = useState<{ quick: number; alarm: boolean; unlimited: boolean } | null>(null);

  const alarms = useAlarmStore((s) => s.alarms);

  const calcNextAlarmMs = useCallback(() => {
    const active = alarms.filter((a) => a.enabled);
    if (active.length === 0) return null;
    return active.reduce<number | null>((best, a) => {
      const ms = msUntilAlarm(a.time.hour, a.time.minute);
      return best === null || ms < best ? ms : best;
    }, null);
  }, [alarms]);

  const [nextAlarmMs, setNextAlarmMs] = useState(calcNextAlarmMs);

  // Update nextAlarmMs in real-time when alarm sync is active
  useEffect(() => {
    setNextAlarmMs(calcNextAlarmMs());
    if (!useAlarmSync) return;
    const id = setInterval(() => {
      setNextAlarmMs(calcNextAlarmMs());
    }, 60_000);
    return () => clearInterval(id);
  }, [useAlarmSync, calcNextAlarmMs]);

  const totalMinutes = useMemo(() => {
    if (useUnlimited) return 0; // 0 = unlimited
    if (useCustom) {
      return customHours * 60 + customMinutes;
    }
    if (useAlarmSync && nextAlarmMs !== null) return Math.max(1, Math.ceil(nextAlarmMs / 60_000));
    return selectedQuick;
  }, [useUnlimited, useCustom, customHours, customMinutes, useAlarmSync, nextAlarmMs, selectedQuick]);

  const displayStr = useMemo(() => {
    if (useUnlimited) return '∞';
    if (useAlarmSync) return '';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}`;
    return `${m}:00`;
  }, [useUnlimited, useAlarmSync, totalMinutes]);

  const displayLabel = useMemo(() => {
    if (useUnlimited) return t('timer.unlimited');
    if (useAlarmSync) return t('timer.alarmSync');
    const h = Math.floor(totalMinutes / 60);
    if (h > 0) return t('timer.hourMin');
    return t('timer.minSec');
  }, [useUnlimited, useAlarmSync, totalMinutes]);

  const hasTime = useUnlimited || totalMinutes > 0;

  const handleSave = useCallback(() => {
    if (!hasTime) return;
    onStart(useUnlimited ? 99999 : totalMinutes, useAlarmSync);
    onClose();
  }, [hasTime, useUnlimited, useAlarmSync, totalMinutes, onStart, onClose]);

  const selectQuick = (min: number) => {
    setSelectedQuick(min);
    setUseAlarmSync(false);
    setUseCustom(false);
    setUseUnlimited(false);
  };

  const selectCustom = () => {
    setPrevState({ quick: selectedQuick, alarm: useAlarmSync, unlimited: useUnlimited });
    setTempHours(customHours);
    setTempMinutes(customMinutes);
    setCustomPickerVisible(true);
  };

  const handleCustomPickerSave = () => {
    if (tempHours === 0 && tempMinutes === 0) {
      // Revert to previous state
      if (prevState) {
        setSelectedQuick(prevState.quick);
        setUseAlarmSync(prevState.alarm);
        setUseUnlimited(prevState.unlimited);
        setUseCustom(false);
      }
    } else {
      setCustomHours(tempHours);
      setCustomMinutes(tempMinutes);
      setUseCustom(true);
      setUseAlarmSync(false);
      setUseUnlimited(false);
    }
    setCustomPickerVisible(false);
    setPrevState(null);
  };

  const handleCustomPickerCancel = () => {
    // If we weren't already in custom mode, revert
    if (!useCustom && prevState) {
      setSelectedQuick(prevState.quick);
      setUseAlarmSync(prevState.alarm);
      setUseUnlimited(prevState.unlimited);
    }
    setCustomPickerVisible(false);
    setPrevState(null);
  };

  const selectUnlimited = () => {
    setUseUnlimited(true);
    setUseCustom(false);
    setUseAlarmSync(false);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headline: {
          fontSize: 26,
          fontWeight: '700',
          color: themeColors.textPrimary,
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: themeColors.textMuted,
          marginBottom: 32,
        },
        dialOuter: {
          width: 216,
          height: 216,
          borderRadius: 108,
          borderWidth: 10,
          borderColor: themeColors.glassLight,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 32,
        },
        dialTime: {
          fontSize: 44,
          fontWeight: '800',
          color: themeColors.textPrimary,
          letterSpacing: -1,
        },
        dialLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: themeColors.textMuted,
          marginTop: 4,
        },
        chipsRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 12,
        },
        chip: {
          flex: 1,
          height: 44,
          borderRadius: 9999,
          alignItems: 'center',
          justifyContent: 'center',
        },
        chipText: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1,
        },
        specialChipsRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 20,
        },
        specialChip: {
          flex: 1,
          height: 44,
          borderRadius: 9999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        customInputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
          backgroundColor: themeColors.glassLight,
          borderRadius: 24,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        customLabel: {
          fontSize: 14,
          fontWeight: '700',
          color: themeColors.textPrimary,
        },
        customTime: {
          fontSize: 14,
          fontWeight: '700',
          color: themeColors.accent1,
        },
        alarmRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: themeColors.glassLight,
          borderRadius: 32,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        alarmLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: themeColors.textPrimary,
        },
        saveBtn: {
          borderRadius: 9999,
          paddingVertical: 18,
          alignItems: 'center',
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 15,
          elevation: 4,
        },
        saveBtnText: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 2.5,
          textTransform: 'uppercase',
        },
      }),
    [themeColors],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightPct={0.6}>
      <ScrollView showsVerticalScrollIndicator={true} indicatorStyle="white" nestedScrollEnabled>
      <Text style={styles.headline}>{t('timer.title')}</Text>
      <Text style={styles.subtitle}>{t('timer.subtitle')}</Text>

      {/* Circular dial */}
      <View style={[styles.dialOuter, { borderColor: themeColors.accent1 + '55' }]}>
        <View
          style={{
            position: 'absolute',
            width: 196,
            height: 196,
            borderRadius: 98,
            borderWidth: 10,
            borderColor: themeColors.glassLight,
          }}
        />
        {useAlarmSync ? (
          <MaterialIcons name="alarm" size={44} color={themeColors.textPrimary} />
        ) : (
          <Text style={styles.dialTime}>{displayStr}</Text>
        )}
        <Text style={styles.dialLabel}>{displayLabel}</Text>
      </View>

      {/* Quick preset chips */}
      <View style={styles.chipsRow}>
        {QUICK_MINUTES.map((min) => {
          const isSelected = !useAlarmSync && !useCustom && !useUnlimited && selectedQuick === min;
          return (
            <Pressable
              key={min}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? themeColors.accent1 : themeColors.glassLight,
                  borderWidth: 1,
                  borderColor: isSelected ? themeColors.accent1 : themeColors.glassBorder,
                },
              ]}
              onPress={() => selectQuick(min)}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : themeColors.textSecondary }]}>
                {min}{t('home.minuteUnit')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom input & Unlimited chips */}
      <View style={styles.specialChipsRow}>
        <Pressable
          style={[
            styles.specialChip,
            {
              backgroundColor: useCustom ? themeColors.accent1 : themeColors.glassLight,
              borderWidth: 1,
              borderColor: useCustom ? themeColors.accent1 : themeColors.glassBorder,
            },
          ]}
          onPress={selectCustom}
        >
          <MaterialIcons name="edit" size={16} color={useCustom ? '#ffffff' : themeColors.textSecondary} />
          <Text style={[styles.chipText, { color: useCustom ? '#ffffff' : themeColors.textSecondary }]}>
            {t('timer.customInput')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.specialChip,
            {
              backgroundColor: useUnlimited ? themeColors.accent1 : themeColors.glassLight,
              borderWidth: 1,
              borderColor: useUnlimited ? themeColors.accent1 : themeColors.glassBorder,
            },
          ]}
          onPress={selectUnlimited}
        >
          <MaterialIcons name="all-inclusive" size={18} color={useUnlimited ? '#ffffff' : themeColors.textSecondary} />
          <Text style={[styles.chipText, { color: useUnlimited ? '#ffffff' : themeColors.textSecondary }]}>
            {t('timer.unlimited')}
          </Text>
        </Pressable>
      </View>

      {/* Custom time display (when custom is selected) */}
      {useCustom && (
        <Pressable style={styles.customInputRow} onPress={selectCustom}>
          <MaterialIcons name="access-time" size={18} color={themeColors.accent1} />
          <Text style={styles.customLabel}>{t('timer.customLabel')}</Text>
          <Text style={styles.customTime}>{t('timer.customTime', { hours: customHours, minutes: customMinutes })}</Text>
          <MaterialIcons name="edit" size={16} color={themeColors.textMuted} />
        </Pressable>
      )}

      {/* Alarm sync option */}
      {nextAlarmMs !== null && (
        <Pressable
          style={[
            styles.alarmRow,
            useAlarmSync && { borderWidth: 1, borderColor: themeColors.accent1 },
          ]}
          onPress={() => { setUseAlarmSync((v) => !v); setUseCustom(false); setUseUnlimited(false); }}
        >
          <Text style={styles.alarmLabel}>{t('timer.alarmSync')}</Text>
          {useAlarmSync ? (
            <MaterialIcons name="check-circle" size={20} color={themeColors.accent1} />
          ) : (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: themeColors.glassBorder,
              }}
            />
          )}
        </Pressable>
      )}

      {/* Advanced Timer Settings (3.4) */}
      <View style={{
        backgroundColor: themeColors.glassLight,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: themeColors.glassBorder,
        gap: 12,
      }}>
        <Text style={{
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: themeColors.textMuted,
          marginBottom: 4,
        }}>
          {t('timer.advancedSettings', { defaultValue: '고급 설정' })}
        </Text>

        {/* Gradual Fade-out */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: themeColors.textPrimary }}>
              {t('timer.gradualFadeOut', { defaultValue: '점진적 페이드아웃' })}
            </Text>
            <Text style={{ fontSize: 11, color: themeColors.textMuted, marginTop: 2 }}>
              {t('timer.gradualFadeOutDesc', { defaultValue: '종료 전 서서히 볼륨 감소' })}
            </Text>
          </View>
          <Toggle
            value={useSettingsStore.getState().settings.timerFadeOutEnabled}
            onValueChange={(v) => useSettingsStore.getState().updateSettings({ timerFadeOutEnabled: v })}
          />
        </View>

        {/* Fade-out duration chips */}
        {useSettingsStore.getState().settings.timerFadeOutEnabled && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[3, 5, 10].map((min) => {
              const isActive = useSettingsStore.getState().settings.timerFadeOutMinutes === min;
              return (
                <Pressable
                  key={min}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? themeColors.accent1 : themeColors.glassMedium,
                    borderWidth: 1,
                    borderColor: isActive ? themeColors.accent1 : themeColors.glassBorder,
                  }}
                  onPress={() => useSettingsStore.getState().updateSettings({ timerFadeOutMinutes: min })}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#ffffff' : themeColors.textSecondary }}>
                    {min}{t('home.minuteUnit', { defaultValue: '분' })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Intelligent Timer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: themeColors.textPrimary }}>
                {t('timer.intelligentTimer', { defaultValue: '스마트 종료' })}
              </Text>
              <View style={{
                backgroundColor: themeColors.accent1,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}>
                <Text style={{ fontSize: 8, fontWeight: '700', color: '#ffffff' }}>PLUS</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: themeColors.textMuted, marginTop: 2 }}>
              {t('timer.intelligentTimerDesc', { defaultValue: '수면 감지 시 자동 종료' })}
            </Text>
          </View>
          <Toggle
            value={useSettingsStore.getState().settings.intelligentTimerEnabled}
            onValueChange={(v) => useSettingsStore.getState().updateSettings({ intelligentTimerEnabled: v })}
          />
        </View>
      </View>

      {/* Save button (not start) */}
      <Pressable
        style={[styles.saveBtn, { backgroundColor: hasTime ? themeColors.accent1 : themeColors.glassLight }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveBtnText, { color: hasTime ? '#ffffff' : themeColors.textMuted }]}>
          {t('timer.saveTimer')}
        </Text>
      </Pressable>
      </ScrollView>

      {/* Custom Time Picker Modal */}
      <Modal
        visible={customPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCustomPickerCancel}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={handleCustomPickerCancel}
        >
          <Pressable
            style={{
              width: '100%',
              backgroundColor: themeColors.bgSecondary,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: themeColors.glassBorder,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: themeColors.textPrimary, textAlign: 'center', marginBottom: 24 }}>
              {t('timer.timeSetup')}
            </Text>

            {/* Hour/Minute Picker */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              {/* Hours */}
              <View style={{ alignItems: 'center', width: 80 }}>
                <Pressable onPress={() => { setEditingHours(false); setEditingMinutes(false); setTempHours((h) => Math.min(23, h + 1)); }} style={{ padding: 8 }}>
                  <MaterialIcons name="keyboard-arrow-up" size={32} color={themeColors.textSecondary} />
                </Pressable>
                {editingHours ? (
                  <TextInput
                    style={{ fontSize: 48, fontWeight: '800', color: themeColors.textPrimary, fontVariant: ['tabular-nums'], textAlign: 'center', textAlignVertical: 'center', width: 72, height: 58, lineHeight: 58, padding: 0, borderBottomWidth: 2, borderBottomColor: themeColors.accent1 }}
                    value={hoursText}
                    onChangeText={(t) => setHoursText(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    onBlur={() => {
                      const val = parseInt(hoursText, 10);
                      if (!isNaN(val) && val >= 0 && val <= 23) setTempHours(val);
                      setEditingHours(false);
                    }}
                    onSubmitEditing={() => {
                      const val = parseInt(hoursText, 10);
                      if (!isNaN(val) && val >= 0 && val <= 23) setTempHours(val);
                      setEditingHours(false);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <Pressable onPress={() => { setHoursText(String(tempHours).padStart(2, '0')); setEditingHours(true); setEditingMinutes(false); }}>
                    <Text style={{ fontSize: 48, fontWeight: '800', color: themeColors.textPrimary, fontVariant: ['tabular-nums'], textAlign: 'center', width: 72, height: 58, lineHeight: 58, borderBottomWidth: 2, borderBottomColor: 'transparent' }}>
                      {String(tempHours).padStart(2, '0')}
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => { setEditingHours(false); setEditingMinutes(false); setTempHours((h) => Math.max(0, h - 1)); }} style={{ padding: 8 }}>
                  <MaterialIcons name="keyboard-arrow-down" size={32} color={themeColors.textSecondary} />
                </Pressable>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: themeColors.textMuted, textTransform: 'uppercase' }}>{t('timer.hourLabel')}</Text>
              </View>

              <Text style={{ fontSize: 40, fontWeight: '700', color: themeColors.textMuted }}>:</Text>

              {/* Minutes */}
              <View style={{ alignItems: 'center', width: 80 }}>
                <Pressable onPress={() => { setEditingHours(false); setEditingMinutes(false); setTempMinutes((m) => (m + 5) % 60); }} style={{ padding: 8 }}>
                  <MaterialIcons name="keyboard-arrow-up" size={32} color={themeColors.textSecondary} />
                </Pressable>
                {editingMinutes ? (
                  <TextInput
                    style={{ fontSize: 48, fontWeight: '800', color: themeColors.textPrimary, fontVariant: ['tabular-nums'], textAlign: 'center', textAlignVertical: 'center', width: 72, height: 58, lineHeight: 58, padding: 0, borderBottomWidth: 2, borderBottomColor: themeColors.accent1 }}
                    value={minutesText}
                    onChangeText={(t) => setMinutesText(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    onBlur={() => {
                      const val = parseInt(minutesText, 10);
                      if (!isNaN(val) && val >= 0 && val <= 59) setTempMinutes(val);
                      setEditingMinutes(false);
                    }}
                    onSubmitEditing={() => {
                      const val = parseInt(minutesText, 10);
                      if (!isNaN(val) && val >= 0 && val <= 59) setTempMinutes(val);
                      setEditingMinutes(false);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <Pressable onPress={() => { setMinutesText(String(tempMinutes).padStart(2, '0')); setEditingMinutes(true); setEditingHours(false); }}>
                    <Text style={{ fontSize: 48, fontWeight: '800', color: themeColors.textPrimary, fontVariant: ['tabular-nums'], textAlign: 'center', width: 72, height: 58, lineHeight: 58, borderBottomWidth: 2, borderBottomColor: 'transparent' }}>
                      {String(tempMinutes).padStart(2, '0')}
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => { setEditingHours(false); setEditingMinutes(false); setTempMinutes((m) => (m - 5 + 60) % 60); }} style={{ padding: 8 }}>
                  <MaterialIcons name="keyboard-arrow-down" size={32} color={themeColors.textSecondary} />
                </Pressable>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: themeColors.textMuted, textTransform: 'uppercase' }}>{t('timer.minuteLabel')}</Text>
              </View>
            </View>

            {/* Save / Cancel */}
            <View style={{ gap: 12, marginTop: 24 }}>
              <Pressable
                style={{
                  backgroundColor: (tempHours > 0 || tempMinutes > 0) ? themeColors.accent1 : themeColors.glassLight,
                  borderRadius: 9999,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                onPress={handleCustomPickerSave}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: (tempHours > 0 || tempMinutes > 0) ? '#ffffff' : themeColors.textMuted,
                }}>
                  {t('common.save')}
                </Text>
              </Pressable>
              <Pressable
                style={{ paddingVertical: 12, alignItems: 'center' }}
                onPress={handleCustomPickerCancel}
              >
                <Text style={{ fontSize: 14, color: themeColors.textMuted }}>{t('common.cancel')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </BottomSheet>
  );
}

