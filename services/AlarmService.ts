import { Alarm, MathProblem } from '@/types';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { generateMathProblem } from '@/utils/mathProblem';
import { Platform, Linking, Alert } from 'react-native';

// expo-notifications: Expo Go SDK 53+에서 import 시
// DevicePushTokenAutoRegistration 사이드이펙트로 ERROR 발생.
// 실제 사용 시점에만 lazy require하여 사이드이펙트 회피.
function getNotifications() {
  return require('expo-notifications') as typeof import('expo-notifications');
}

// ──────────────────────────────────────────────
// Notification configuration
// ──────────────────────────────────────────────

export function configureNotifications(): void {
  try {
    const Notifications = getNotifications();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });
  } catch {}
}

// ──────────────────────────────────────────────
// Permission helpers
// ──────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
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
  const Notifications = getNotifications();

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
          sound: true, // 시스템 기본 알람 사운드 사용 (alarm-default.wav 미존재)
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,      // 사용자가 직접 해제할 때까지 알림 유지
          autoDismiss: false, // 탭해도 자동 사라지지 않음
          data: { alarmId: alarm.id, type: 'alarm' },
          ...(Platform.OS === 'android' ? { channelId: 'alarm-channel' } : {}),
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
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: true,
            autoDismiss: false,
            data: { alarmId: alarm.id, type: 'alarm' },
            ...(Platform.OS === 'android' ? { channelId: 'alarm-channel' } : {}),
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
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
          autoDismiss: false,
          data: { alarmId: alarm.id, type: 'alarm' },
          ...(Platform.OS === 'android' ? { channelId: 'alarm-channel' } : {}),
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
  const Notifications = getNotifications();
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
  const Notifications = getNotifications();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Deep Sleep 스누즈',
      body: alarm.label || '스누즈 알람이에요!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      sticky: true,
      autoDismiss: false,
      data: { alarmId: alarm.id, type: 'snooze' },
      ...(Platform.OS === 'android' ? { channelId: 'alarm-channel' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
    },
  });
}


/** 수학 문제 생성 (AlarmService를 통해 노출) */
export { generateMathProblem };

// ──────────────────────────────────────────────
// Alarm notification listeners
// ──────────────────────────────────────────────

/**
 * 알림 리스너 설정: 알림 터치 시 alarm-dismiss 페이지로 이동.
 * @param onAlarmTriggered 알람 ID를 받아 네비게이션하는 콜백
 * @returns cleanup 함수
 */
export function setupAlarmListeners(
  onAlarmTriggered: (alarmId: string) => void,
): () => void {
  const Notifications = getNotifications();

  // 알림 수신 시 (앱이 포그라운드일 때): 바로 alarm-dismiss로 이동
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data;
    if (data?.type === 'alarm' || data?.type === 'snooze') {
      const alarmId = data.alarmId as string;
      onAlarmTriggered(alarmId);
    }
  });

  // 알림 응답 시 (사용자가 알림을 탭할 때): alarm-dismiss로 이동
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'alarm' || data?.type === 'snooze') {
      const alarmId = data.alarmId as string;
      onAlarmTriggered(alarmId);
    }
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

// ──────────────────────────────────────────────
// Alarm permissions
// ──────────────────────────────────────────────

/**
 * 알람에 필요한 모든 권한 요청:
 * - 알림 권한 (Android + iOS)
 * - Android 정확한 알람 (SCHEDULE_EXACT_ALARM)
 * - Android 알림 채널 (알람용 높은 우선순위)
 */
export async function requestAlarmPermissions(): Promise<void> {
  const Notifications = getNotifications();

  // 알림 권한
  await requestNotificationPermission();

  // Android: 알람 전용 알림 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm-channel', {
      name: '알람',
      importance: Notifications.AndroidImportance.MAX,
      // 커스텀 사운드 미지정 → 시스템 기본 알람 사운드 사용
      vibrationPattern: [0, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
    });
  }
}

/**
 * 앱 콜드 스타트 시 마지막 알림 응답 확인.
 * 앱이 종료된 상태에서 알림을 탭하여 앱이 열린 경우 알람 ID를 반환.
 */
export async function getInitialAlarmNotification(): Promise<string | null> {
  try {
    const Notifications = getNotifications();
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return null;
    const data = response.notification.request.content.data;
    if (data?.type === 'alarm' || data?.type === 'snooze') {
      return data.alarmId as string;
    }
    return null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Battery optimization & Doze Mode handling (10.4)
// ──────────────────────────────────────────────

/**
 * Android 제조사를 감지하여 해당 제조사의 배터리 최적화 설정 페이지 안내를 반환.
 * Samsung OneUI, Xiaomi MIUI, Huawei EMUI 등 제조사별 특수 설정이 필요.
 */
function getManufacturer(): string {
  if (Platform.OS !== 'android') return '';
  try {
    const { Brand } = require('react-native').Platform.constants ?? {};
    return (Brand ?? '').toLowerCase();
  } catch {
    return '';
  }
}

interface BatteryOptGuide {
  manufacturer: string;
  steps: string[];
  intentAction?: string;
}

/**
 * 제조사별 배터리 최적화 해제 안내 정보를 반환.
 */
export function getBatteryOptimizationGuide(): BatteryOptGuide {
  const brand = getManufacturer();

  if (brand.includes('samsung')) {
    return {
      manufacturer: 'Samsung',
      steps: [
        '설정 → 배터리 및 디바이스 관리 → 배터리',
        '백그라운드 사용 제한 → Deep Sleep 앱 제외',
        '절전 모드에서 허용할 앱 → Deep Sleep 추가',
      ],
      intentAction: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    };
  }
  if (brand.includes('xiaomi') || brand.includes('redmi') || brand.includes('poco')) {
    return {
      manufacturer: 'Xiaomi/Redmi',
      steps: [
        '설정 → 앱 → 앱 관리 → Deep Sleep',
        '자동 시작 → 허용으로 변경',
        '배터리 세이버 → 제한 없음으로 설정',
        '설정 → 앱 → 잠금 화면에 알림 표시 → 허용',
      ],
      intentAction: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    };
  }
  if (brand.includes('huawei') || brand.includes('honor')) {
    return {
      manufacturer: 'Huawei/Honor',
      steps: [
        '설정 → 배터리 → 앱 실행 관리',
        'Deep Sleep → 수동 관리로 변경',
        '자동 실행, 보조 실행, 백그라운드 실행 모두 허용',
      ],
      intentAction: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    };
  }
  if (brand.includes('oppo') || brand.includes('realme') || brand.includes('oneplus')) {
    return {
      manufacturer: 'OPPO/OnePlus/Realme',
      steps: [
        '설정 → 배터리 → 배터리 최적화',
        'Deep Sleep → 최적화하지 않음 선택',
        '설정 → 앱 관리 → Deep Sleep → 자동 시작 허용',
      ],
      intentAction: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    };
  }

  // 일반 Android
  return {
    manufacturer: 'Android',
    steps: [
      '설정 → 앱 → Deep Sleep → 배터리',
      '배터리 최적화 → 최적화하지 않음 선택',
    ],
    intentAction: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
  };
}

/**
 * 배터리 최적화 설정 화면을 열도록 안내하는 Alert를 표시.
 * 실기기에서 Doze Mode로 알람이 지연되는 문제를 방지.
 */
export function showBatteryOptimizationAlert(
  t: (key: string) => string,
): void {
  if (Platform.OS !== 'android') return;

  const guide = getBatteryOptimizationGuide();
  const stepsText = guide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');

  Alert.alert(
    t('alarms.batteryOptTitle'),
    `${t('alarms.batteryOptMessage')}\n\n[${guide.manufacturer}]\n${stepsText}`,
    [
      { text: t('common.later'), style: 'cancel' },
      {
        text: t('alarms.openSettings'),
        onPress: () => {
          if (guide.intentAction) {
            Linking.openSettings().catch(() => {});
          }
        },
      },
    ],
  );
}
