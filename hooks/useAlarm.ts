import { useCallback } from 'react';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { Alarm } from '@/types';
import * as AlarmService from '@/services/AlarmService';

/**
 * 알람 CRUD + 스케줄링 통합 훅.
 */
export function useAlarm() {
  const alarms = useAlarmStore((s) => s.alarms);
  const loaded = useAlarmStore((s) => s.loaded);

  /** 새 알람 추가 + 스케줄링 */
  const addAlarm = useCallback(async (alarm: Alarm) => {
    const notificationId = await AlarmService.scheduleAlarm(alarm);
    const saved = { ...alarm, notificationId };
    await useAlarmStore.getState().addAlarm(saved);
  }, []);

  /** 알람 수정 + 재스케줄링 */
  const updateAlarm = useCallback(async (id: string, partial: Partial<Alarm>) => {
    const store = useAlarmStore.getState();
    const existing = store.alarms.find((a) => a.id === id);
    if (!existing) return;

    // 기존 스케줄 취소
    await AlarmService.cancelAlarmNotifications(existing);

    // 업데이트
    const updated = { ...existing, ...partial };
    const notificationId = await AlarmService.scheduleAlarm(updated);
    await store.updateAlarm(id, { ...partial, notificationId });
  }, []);

  /** 알람 삭제 + 스케줄 취소 */
  const deleteAlarm = useCallback(async (id: string) => {
    const store = useAlarmStore.getState();
    const existing = store.alarms.find((a) => a.id === id);
    if (existing) {
      await AlarmService.cancelAlarmNotifications(existing);
    }
    await store.deleteAlarm(id);
  }, []);

  /** 알람 활성/비활성 토글 */
  const toggleAlarm = useCallback(async (id: string) => {
    const store = useAlarmStore.getState();
    const existing = store.alarms.find((a) => a.id === id);
    if (!existing) return;

    if (existing.enabled) {
      await AlarmService.cancelAlarmNotifications(existing);
    }

    await store.toggleAlarm(id);

    if (!existing.enabled) {
      const toggled = { ...existing, enabled: true };
      const notificationId = await AlarmService.scheduleAlarm(toggled);
      await store.updateAlarm(id, { notificationId });
    }
  }, []);

  /** 스누즈 */
  const snooze = useCallback(async (alarm: Alarm, minutes: number) => {
    await AlarmService.snooze(alarm, minutes);
  }, []);

  return { alarms, loaded, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, snooze };
}
