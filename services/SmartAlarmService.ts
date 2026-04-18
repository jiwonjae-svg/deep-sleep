import * as Notifications from 'expo-notifications';
import { Alarm, SmartAlarmConfig, SleepStage } from '@/types';
import { useSleepStore } from '@/stores/useSleepStore';
import { EpochData, estimateSleepStage, isLightSleepForAlarm } from './SleepStageEstimator';

// ──────────────────────────────────────────────
// Smart Alarm Service
// Monitors sleep stages during alarm window and
// triggers alarm at optimal light-sleep moment
// ──────────────────────────────────────────────

let monitorInterval: ReturnType<typeof setInterval> | null = null;
let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
let isMonitoring = false;

interface SmartAlarmState {
  alarm: Alarm;
  config: SmartAlarmConfig;
  windowStartTime: number; // when monitoring window starts (ms)
  targetAlarmTime: number; // the set alarm time (ms)
  triggered: boolean;
}

let currentState: SmartAlarmState | null = null;

/**
 * Get the next alarm time as a timestamp for a given alarm.
 * Considers days[] (repeat schedule) and specificDate fields.
 * Returns Infinity if no upcoming occurrence exists.
 */
export function getNextAlarmTimestamp(alarm: Alarm): number {
  const now = new Date();

  // specificDate: 특정 날짜 지정 알람
  if (alarm.specificDate) {
    const [y, m, d] = alarm.specificDate.split('-').map(Number);
    const target = new Date(y, m - 1, d, alarm.time.hour, alarm.time.minute, 0, 0);
    return target.getTime() > now.getTime() ? target.getTime() : Infinity;
  }

  const hasRepeatDays = alarm.days.some(Boolean);
  if (!hasRepeatDays) {
    // 반복 없음: 오늘 또는 내일
    const target = new Date();
    target.setHours(alarm.time.hour, alarm.time.minute, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  // 반복 요일 지정: 앞으로 7일 이내 가장 빠른 요일 찾기
  // days[] index: 0=Mon … 6=Sun, JS getDay(): 0=Sun … 6=Sat
  const jsDow = now.getDay(); // 0=Sun
  const todayIdx = jsDow === 0 ? 6 : jsDow - 1; // convert to 0=Mon

  for (let offset = 0; offset < 7; offset++) {
    const dayIdx = (todayIdx + offset) % 7;
    if (!alarm.days[dayIdx]) continue;

    const target = new Date(now);
    target.setDate(target.getDate() + offset);
    target.setHours(alarm.time.hour, alarm.time.minute, 0, 0);

    if (target.getTime() > now.getTime()) {
      return target.getTime();
    }
  }

  // 오늘 요일이 포함되어 있지만 이미 지난 경우 → 다음 주 같은 요일
  for (let offset = 1; offset <= 7; offset++) {
    const dayIdx = (todayIdx + offset) % 7;
    if (!alarm.days[dayIdx]) continue;
    const target = new Date(now);
    target.setDate(target.getDate() + offset);
    target.setHours(alarm.time.hour, alarm.time.minute, 0, 0);
    return target.getTime();
  }

  return Infinity;
}

/**
 * Build epoch data from the sleep store's current tracking epochs.
 */
function getCurrentEpochs(): EpochData[] {
  const { epochs, trackingStartedAt } = useSleepStore.getState();
  if (!trackingStartedAt) return [];

  return epochs.map((activityCount, index) => ({
    timestamp: trackingStartedAt + index * 60_000,
    activityCount,
  }));
}

/**
 * Trigger the smart alarm (via notification + vibration).
 */
async function triggerSmartAlarm(alarm: Alarm, stage: SleepStage): Promise<void> {
  if (currentState) currentState.triggered = true;

  // Send immediate notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Deep Sleep 스마트 알람',
      body: alarm.label || '가벼운 수면에서 깨워드려요!',
      sound: 'alarm-default.mp3',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        alarmId: alarm.id,
        type: 'smart-alarm',
        sleepStage: stage,
      },
    },
    trigger: null, // immediate
  });

  stopMonitoring();
}

/**
 * Check current sleep stage and decide whether to trigger.
 */
function checkAndTrigger(): void {
  if (!currentState || currentState.triggered) return;

  const now = Date.now();
  const { alarm, config, windowStartTime, targetAlarmTime } = currentState;

  // Not yet in window
  if (now < windowStartTime) return;

  // Past target time — should have been caught by fallback
  if (now >= targetAlarmTime) {
    triggerSmartAlarm(alarm, 'wake');
    return;
  }

  // Check sleep stage
  const epochs = getCurrentEpochs();
  if (epochs.length < 5) return; // not enough data

  const currentStage = estimateSleepStage(epochs, epochs.length - 1);

  if (isLightSleepForAlarm(currentStage, config.sensitivity)) {
    triggerSmartAlarm(alarm, currentStage);
  }
}

/**
 * Start smart alarm monitoring for a given alarm.
 * Should be called when sleep tracking is active and an alarm with smart config is upcoming.
 */
export function startSmartAlarmMonitoring(alarm: Alarm): void {
  if (!alarm.smartAlarm?.enabled) return;
  if (isMonitoring) stopMonitoring();

  const config = alarm.smartAlarm;
  const targetAlarmTime = getNextAlarmTimestamp(alarm);
  const windowStartTime = targetAlarmTime - config.windowMinutes * 60_000;

  currentState = {
    alarm,
    config,
    windowStartTime,
    targetAlarmTime,
    triggered: false,
  };

  isMonitoring = true;

  // Check every minute
  monitorInterval = setInterval(checkAndTrigger, 60_000);

  // Fallback: always trigger at the set alarm time
  const msUntilAlarm = targetAlarmTime - Date.now();
  if (msUntilAlarm > 0) {
    fallbackTimeout = setTimeout(() => {
      if (currentState && !currentState.triggered) {
        triggerSmartAlarm(alarm, 'wake');
      }
    }, msUntilAlarm);
  }
}

/**
 * Stop smart alarm monitoring.
 */
export function stopMonitoring(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  if (fallbackTimeout) {
    clearTimeout(fallbackTimeout);
    fallbackTimeout = null;
  }
  isMonitoring = false;
  currentState = null;
}

/**
 * Check if smart alarm monitoring is currently active.
 */
export function isSmartAlarmActive(): boolean {
  return isMonitoring;
}

/**
 * Get info about when the smart alarm triggered (for report display).
 */
export function getSmartAlarmTriggerInfo(): {
  triggeredEarly: boolean;
  minutesEarly: number;
  stage: SleepStage;
} | null {
  // This would need to be stored when triggered — for now return null
  return null;
}
