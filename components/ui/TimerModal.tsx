import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useThemeColors } from '@/theme';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { msUntilAlarm, formatRemainingTime } from '@/utils/formatTime';

const QUICK_MINUTES = [15, 30, 45, 60] as const;

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (minutes: number) => void;
}

export function TimerModal({ visible, onClose, onStart }: TimerModalProps) {
  const themeColors = useThemeColors();

  const [selectedQuick, setSelectedQuick] = useState<number>(45);
  const [useAlarmSync, setUseAlarmSync] = useState(false);

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
    return selectedQuick;
  }, [useAlarmSync, nextAlarmMs, selectedQuick]);

  const hasTime = totalMinutes > 0;

  const handleStart = useCallback(() => {
    if (!hasTime) return;
    onStart(totalMinutes);
    onClose();
  }, [hasTime, totalMinutes, onStart, onClose]);

  const displayH = Math.floor(totalMinutes / 60);
  const displayM = totalMinutes % 60;
  const displayStr = displayH > 0
    ? `${displayH}:${String(displayM).padStart(2, '0')}`
    : `${displayM}:00`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headline: {
          fontSize: 26,
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 32,
        },
        dialOuter: {
          width: 216,
          height: 216,
          borderRadius: 108,
          borderWidth: 10,
          borderColor: 'rgba(255,255,255,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 32,
        },
        dialTime: {
          fontSize: 44,
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: -1,
        },
        dialLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginTop: 4,
        },
        chipsRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 20,
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
        alarmRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 32,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        },
        alarmLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: '#ffffff',
        },
        alarmTime: {
          fontSize: 12,
          color: themeColors.accent1,
        },
        startBtn: {
          borderRadius: 9999,
          paddingVertical: 18,
          alignItems: 'center',
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 15,
          elevation: 4,
        },
        startBtnText: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 2.5,
          textTransform: 'uppercase',
        },
      }),
    [themeColors],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightPct={0.85}>
      <Text style={styles.headline}>타이머 설정</Text>
      <Text style={styles.subtitle}>수면 & 집중 시간을 설정하세요</Text>

      {/* Circular dial (decorative) */}
      <View style={[styles.dialOuter, { borderColor: themeColors.accent1 + '55' }]}>
        <View
          style={{
            position: 'absolute',
            width: 196,
            height: 196,
            borderRadius: 98,
            borderWidth: 10,
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Text style={styles.dialTime}>{displayStr}</Text>
        <Text style={styles.dialLabel}>시간:분</Text>
      </View>

      {/* Quick preset chips */}
      <View style={styles.chipsRow}>
        {QUICK_MINUTES.map((min) => {
          const isSelected = !useAlarmSync && selectedQuick === min;
          return (
            <Pressable
              key={min}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? themeColors.accent1 : 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: isSelected ? themeColors.accent1 : 'rgba(255,255,255,0.15)',
                },
              ]}
              onPress={() => { setSelectedQuick(min); setUseAlarmSync(false); }}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)' }]}>
                {min}분
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Alarm sync option */}
      {nextAlarmMs !== null && (
        <Pressable
          style={[
            styles.alarmRow,
            useAlarmSync && { borderWidth: 1, borderColor: themeColors.accent1 },
          ]}
          onPress={() => setUseAlarmSync((v) => !v)}
        >
          <View>
            <Text style={styles.alarmLabel}>알람까지</Text>
            <Text style={styles.alarmTime}>{formatRemainingTime(nextAlarmMs)} 남음</Text>
          </View>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: useAlarmSync ? themeColors.accent1 : 'rgba(255,255,255,0.15)',
              backgroundColor: useAlarmSync ? themeColors.accent1 : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {useAlarmSync && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
          </View>
        </Pressable>
      )}

      {/* Start button */}
      <Pressable
        style={[styles.startBtn, { backgroundColor: hasTime ? themeColors.accent1 : 'rgba(255,255,255,0.08)' }]}
        onPress={handleStart}
      >
        <Text style={[styles.startBtnText, { color: hasTime ? '#ffffff' : 'rgba(255,255,255,0.4)' }]}>
          타이머 시작
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

