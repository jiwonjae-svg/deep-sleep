import * as Notifications from 'expo-notifications';
import { Alarm, MathProblem } from '@/types';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { generateMathProblem } from '@/utils/mathProblem';

// ──────────────────────────────────────────────
// Notification configuration
// ──────────────────────────────────────────────

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

// ──────────────────────────────────────────────
// Permission helpers
// ──────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ──────────────────────────────────────────────
// Alarm scheduling
// ──────────────────────────────────────────────

/**
 * expo-notifications weekday: 1=Sunday, 2=Monday, ..., 7=Saturday
 * Our Alarm.days:             0=Mon,    1=Tue, ..., 6=Sun
 */
function toNotifWeekday(dayIndex: number): number {
  // dayIndex 0=Mon → weekday 2, ... 6=Sun → weekday 1
  return dayIndex === 6 ? 1 : dayIndex + 2;
}

export async function scheduleAlarm(alarm: Alarm): Promise<string | null> {
  if (!alarm.enabled) return null;

  // 활성 요일이 있으면 각 요일별로 예약, 없으면 단일 예약
  const activeDays = alarm.days
    .map((active, idx) => (active ? idx : -1))
    .filter((d) => d >= 0);

  try {
    if (activeDays.length > 0) {
      // 첫 번째 요일만 ID 반환 (간략화)
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Deep Sleep 알람',
          body: alarm.label || '일어날 시간이에요!',
          sound: 'alarm-default.wav',
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { alarmId: alarm.id, type: 'alarm' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toNotifWeekday(activeDays[0]),
          hour: alarm.time.hour,
          minute: alarm.time.minute,
        },
      });

      // 나머지 요일도 예약
      for (let i = 1; i < activeDays.length; i++) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Deep Sleep 알람',
            body: alarm.label || '일어날 시간이에요!',
            sound: 'alarm-default.wav',
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: { alarmId: alarm.id, type: 'alarm' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: toNotifWeekday(activeDays[i]),
            hour: alarm.time.hour,
            minute: alarm.time.minute,
          },
        });
      }

      return id;
    } else {
      // 요일 미지정 → 다음 시간에 1회
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Deep Sleep 알람',
          body: alarm.label || '일어날 시간이에요!',
          sound: 'alarm-default.wav',
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { alarmId: alarm.id, type: 'alarm' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.time.hour,
          minute: alarm.time.minute,
        },
      });
      return id;
    }
  } catch {
    return null;
  }
}

export async function cancelAlarmNotifications(alarm: Alarm): Promise<void> {
  if (alarm.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(alarm.notificationId).catch(() => {});
  }
  // 같은 alarmId를 가진 notification 모두 취소 시도
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.alarmId === alarm.id) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
    }
  }
}

export async function snooze(alarm: Alarm, minutes: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Deep Sleep 스누즈',
      body: alarm.label || '스누즈 알람이에요!',
      sound: 'alarm-default.wav',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId: alarm.id, type: 'snooze' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
    },
  });
}

/** 수학 문제 생성 (AlarmService를 통해 노출) */
export { generateMathProblem };
