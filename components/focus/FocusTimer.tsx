import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '@/stores/useFocusStore';
import { FocusPhase } from '@/types';
import * as Notifications from 'expo-notifications';

const RING_SIZE = 240;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const PHASE_COLORS: Record<FocusPhase, string> = {
  focus: '#ef4444',
  'short-break': '#22c55e',
  'long-break': '#06b6d4',
  idle: '#6366f1',
};

const PHASE_ICONS: Record<FocusPhase, string> = {
  focus: 'work',
  'short-break': 'coffee',
  'long-break': 'self-improvement',
  idle: 'play-arrow',
};

export function FocusTimer() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const store = useFocusStore();
  const { phase, isRunning, endTime, phaseDurationMs, currentSession, config, completedSessions } = store;

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!isRunning || phase === 'idle') {
      setRemaining(phaseDurationMs);
      return;
    }
    const update = () => setRemaining(Math.max(0, endTime - Date.now()));
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [isRunning, endTime, phase, phaseDurationMs]);

  // Check for phase transitions
  useEffect(() => {
    if (!isRunning || phase === 'idle') return;
    const id = setInterval(() => {
      const newPhase = store.tick();
      if (newPhase) {
        sendPhaseNotification(newPhase);
      }
    }, 500);
    return () => clearInterval(id);
  }, [isRunning, phase]);

  const totalMs = phase === 'idle' ? config.focusMinutes * 60_000 : phaseDurationMs;
  const progress = totalMs > 0 ? Math.max(0, Math.min(1, remaining / totalMs)) : 0;

  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const phaseColor = PHASE_COLORS[phase];

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'focus': return t('focus.focusing', { defaultValue: '집중 중' });
      case 'short-break': return t('focus.shortBreak', { defaultValue: '짧은 휴식' });
      case 'long-break': return t('focus.longBreak', { defaultValue: '긴 휴식' });
      default: return t('focus.ready', { defaultValue: '준비' });
    }
  }, [phase, t]);

  // Session indicators
  const sessionDots = Array.from({ length: config.sessionsBeforeLongBreak }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Timer Ring */}
      <View style={styles.ringWrapper}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {phase !== 'idle' && (
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={phaseColor}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE}`}
              strokeDashoffset={`${RING_CIRCUMFERENCE * (1 - progress)}`}
              rotation={-90}
              origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
            />
          )}
        </Svg>
        <View style={styles.ringContent}>
          <Text style={[styles.timerText, { color: phase === 'idle' ? themeColors.textPrimary : phaseColor }]}>
            {timeStr}
          </Text>
          <Text style={[styles.phaseLabel, { color: themeColors.textMuted }]}>
            {phaseLabel}
          </Text>
        </View>
      </View>

      {/* Session indicators */}
      <View style={styles.dotsRow}>
        {sessionDots.map((num) => (
          <View
            key={num}
            style={[
              styles.dot,
              {
                backgroundColor:
                  num < currentSession || (phase !== 'focus' && num === currentSession)
                    ? phaseColor
                    : num === currentSession && phase === 'focus'
                      ? `${phaseColor}80`
                      : 'rgba(255,255,255,0.15)',
              },
            ]}
          />
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {phase === 'idle' ? (
          <Pressable
            style={[styles.mainBtn, { backgroundColor: PHASE_COLORS.focus }]}
            onPress={store.startFocus}
          >
            <MaterialIcons name="play-arrow" size={32} color="#ffffff" />
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.sideBtn} onPress={store.reset}>
              <MaterialIcons name="stop" size={24} color={themeColors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.mainBtn, { backgroundColor: phaseColor }]}
              onPress={isRunning ? store.pause : store.resume}
            >
              <MaterialIcons
                name={isRunning ? 'pause' : 'play-arrow'}
                size={32}
                color="#ffffff"
              />
            </Pressable>

            <Pressable style={styles.sideBtn} onPress={store.skip}>
              <MaterialIcons name="skip-next" size={24} color={themeColors.textMuted} />
            </Pressable>
          </>
        )}
      </View>

      {/* Stats */}
      <Text style={[styles.statsText, { color: themeColors.textMuted }]}>
        {t('focus.sessionsCompleted', {
          count: completedSessions,
          defaultValue: `${completedSessions}세션 완료`,
        })}
      </Text>
    </View>
  );
}

async function sendPhaseNotification(phase: FocusPhase): Promise<void> {
  try {
    const title = phase === 'focus' ? '집중 시작!' : phase === 'short-break' ? '짧은 휴식' : '긴 휴식';
    const body = phase === 'focus' ? '다시 집중할 시간입니다' : '잠시 쉬어가세요';
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {
    // notification permissions not granted
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  mainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
