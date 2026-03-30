import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { msUntilAlarm, formatRemainingTime } from '@/utils/formatTime';

const QUICK_MINUTES = [15, 30, 45, 60, 90, 120] as const;

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (minutes: number) => void;
}

export function TimerModal({ visible, onClose, onStart }: TimerModalProps) {
  const themeColors = useThemeColors();

  const [selectedQuick, setSelectedQuick] = useState<number>(30);
  const [useCustom, setUseCustom] = useState(false);
  const [useAlarmSync, setUseAlarmSync] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMins, setCustomMins] = useState('');

  const alarms = useAlarmStore((s) => s.alarms);

  const nextAlarmMs = useMemo(() => {
    const active = alarms.filter((a) => a.enabled);
    if (active.length === 0) return null;
    return active.reduce<number | null>((best, a) => {
      const ms = msUntilAlarm(a.time.hour, a.time.minute);
      return best === null || ms < best ? ms : best;
    }, null);
  }, [alarms]);

  const totalMinutes = useMemo(() => {
    if (useAlarmSync && nextAlarmMs !== null) return Math.max(1, Math.ceil(nextAlarmMs / 60_000));
    if (useCustom) return parseInt(customHours || '0', 10) * 60 + parseInt(customMins || '0', 10);
    return selectedQuick;
  }, [useAlarmSync, useCustom, nextAlarmMs, customHours, customMins, selectedQuick]);

  const hasTime = totalMinutes > 0;

  const handleStart = useCallback(() => {
    if (!hasTime) return;
    onStart(totalMinutes);
    onClose();
  }, [hasTime, totalMinutes, onStart, onClose]);

  const startLabel = useMemo(() => {
    if (!hasTime) return '시간을 선택하세요';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const timeStr = h > 0 && m > 0 ? `${h}시간 ${m}분` : h > 0 ? `${h}시간` : `${m}분`;
    return `${timeStr} 타이머 시작`;
  }, [hasTime, totalMinutes]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: spacing.lg,
        },
        sectionTitle: {
          ...typography.h3,
          color: themeColors.textPrimary,
          marginBottom: spacing.sm,
        },
        quickRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        },
        chip: {
          borderRadius: 16,
          paddingVertical: 7,
          paddingHorizontal: spacing.md,
          borderWidth: 1,
        },
        chipText: {
          ...typography.caption,
        },
        customRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        timeInput: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusSm,
          borderWidth: 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          width: 64,
          textAlign: 'center',
          color: themeColors.textPrimary,
          ...typography.bodyMedium,
        },
        timeLabel: {
          ...typography.caption,
          color: themeColors.textSecondary,
        },
        presetItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: layout.borderRadiusSm,
          borderWidth: 1,
          marginBottom: spacing.xs,
        },
        presetName: {
          ...typography.bodyMedium,
          flex: 1,
        },
        startBtn: {
          borderRadius: layout.borderRadiusMd,
          paddingVertical: spacing.md,
          alignItems: 'center',
          marginTop: spacing.sm,
          marginBottom: spacing.sm,
        },
        startBtnText: {
          ...typography.bodyMedium,
          color: '#fff',
          fontWeight: '700',
        },
      }),
    [themeColors],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightPct={0.85}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 간단 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>간단 설정</Text>
          <View style={styles.quickRow}>
            {QUICK_MINUTES.map((min) => {
              const isSelected = !useCustom && !useAlarmSync && selectedQuick === min;
              return (
                <Pressable
                  key={min}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? themeColors.accent1 : themeColors.glassLight,
                      borderColor: isSelected ? themeColors.accent1 : themeColors.glassBorder,
                    },
                  ]}
                  onPress={() => {
                    setSelectedQuick(min);
                    setUseCustom(false);
                    setUseAlarmSync(false);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#fff' : themeColors.textSecondary },
                    ]}
                  >
                    {min >= 60 ? `${min / 60}시간` : `${min}분`}
                  </Text>
                </Pressable>
              );
            })}

            {/* 알람에 맞춰 */}
            {(() => {
              const hasAlarm = nextAlarmMs !== null;
              const isSelected = useAlarmSync;
              const label = hasAlarm
                ? `알람까지 (${formatRemainingTime(nextAlarmMs!)})`
                : '알람에 맞춰';
              return (
                <Pressable
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? themeColors.accent2 : themeColors.glassLight,
                      borderColor: isSelected ? themeColors.accent2 : themeColors.glassBorder,
                      opacity: hasAlarm ? 1 : 0.4,
                    },
                  ]}
                  onPress={() => {
                    if (!hasAlarm) return;
                    setUseAlarmSync(true);
                    setUseCustom(false);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#fff' : themeColors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })()}
          </View>
        </View>

        {/* 직접 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직접 설정</Text>
          <View style={styles.customRow}>
            <TextInput
              style={[
                styles.timeInput,
                { borderColor: useCustom ? themeColors.accent1 : themeColors.glassBorder },
              ]}
              value={customHours}
              onChangeText={(t) => {
                setCustomHours(t.replace(/[^0-9]/g, ''));
                setUseCustom(true);
                setUseAlarmSync(false);
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0"
              placeholderTextColor={themeColors.textMuted}
            />
            <Text style={styles.timeLabel}>시간</Text>
            <TextInput
              style={[
                styles.timeInput,
                { borderColor: useCustom ? themeColors.accent1 : themeColors.glassBorder },
              ]}
              value={customMins}
              onChangeText={(t) => {
                setCustomMins(t.replace(/[^0-9]/g, ''));
                setUseCustom(true);
                setUseAlarmSync(false);
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0"
              placeholderTextColor={themeColors.textMuted}
            />
            <Text style={styles.timeLabel}>분</Text>
          </View>
        </View>

        {/* 시작 버튼 */}
        <Pressable
          style={[
            styles.startBtn,
            { backgroundColor: hasTime ? themeColors.accent1 : themeColors.glassLight },
          ]}
          onPress={handleStart}
        >
          <Text style={[styles.startBtnText, { color: hasTime ? '#fff' : themeColors.textSecondary }]}>{startLabel}</Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
