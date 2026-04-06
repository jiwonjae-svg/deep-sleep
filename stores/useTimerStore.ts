import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerSchedule } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

interface LastTimerSnapshot {
  remainingMs: number;
  durationMinutes: number;
}

interface TimerStoreState {
  /** 타이머 종료 시각 (epoch ms). 0이면 비활성. */
  endTime: number;
  /** 타이머 원래 설정 시간 (분) */
  durationMinutes: number;
  /** 타이머 활성 여부 */
  isActive: boolean;
  /** 알람 연동 모드 여부 */
  isAlarmSync: boolean;
  /** 고급 모드: 사운드 전환 스케줄 */
  schedule: TimerSchedule | null;
  /** 고급 모드: 현재 실행 중인 phase 인덱스 */
  currentPhaseIndex: number;
  /** 마지막 표시용 잔여 시간 (ms) — 앱 재시작 시 복원 */
  lastRemainingMs: number;
  /** 마지막 표시용 설정 시간 (분) */
  lastDurationMinutes: number;
  /** 복원 완료 여부 */
  restored: boolean;
}

interface TimerStoreActions {
  startTimer: (minutes: number, alarmSync?: boolean) => void;
  cancelTimer: () => void;
  setSchedule: (schedule: TimerSchedule | null) => void;
  advancePhase: () => void;
  /** 현재 잔여 시간을 스냅샷으로 저장 (정지/종료 시 호출) */
  saveSnapshot: (remainingMs: number) => void;
  /** 앱 기동 시 AsyncStorage에서 마지막 상태 복원 */
  restoreSnapshot: () => Promise<void>;
}

async function persistSnapshot(snapshot: LastTimerSnapshot) {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIMER_STATE, JSON.stringify(snapshot));
}

export const useTimerStore = create<TimerStoreState & TimerStoreActions>((set, get) => ({
  endTime: 0,
  durationMinutes: 0,
  isActive: false,
  isAlarmSync: false,
  schedule: null,
  currentPhaseIndex: 0,
  lastRemainingMs: 15 * 60 * 1000, // 초기값: 15분
  lastDurationMinutes: 15,
  restored: false,

  startTimer: (minutes, alarmSync = false) =>
    set({
      endTime: Date.now() + minutes * 60 * 1000,
      durationMinutes: minutes,
      isActive: true,
      isAlarmSync: alarmSync,
      currentPhaseIndex: 0,
    }),

  cancelTimer: () =>
    set({
      endTime: 0,
      durationMinutes: 0,
      isActive: false,
      isAlarmSync: false,
      schedule: null,
      currentPhaseIndex: 0,
    }),

  setSchedule: (schedule) => set({ schedule }),

  advancePhase: () => {
    const { schedule, currentPhaseIndex } = get();
    if (!schedule) return;
    const nextIndex = currentPhaseIndex + 1;
    if (nextIndex < schedule.phases.length) {
      set({ currentPhaseIndex: nextIndex });
    } else if (schedule.loopLastPhase) {
      set({ currentPhaseIndex: schedule.phases.length - 1 });
    }
  },

  saveSnapshot: (remainingMs: number) => {
    const { durationMinutes } = get();
    const dur = durationMinutes > 0 ? durationMinutes : 15;
    // 남은 시간이 0이면 설정 시간을 보여준다
    const display = remainingMs <= 0 ? dur * 60 * 1000 : remainingMs;
    set({ lastRemainingMs: display, lastDurationMinutes: dur });
    persistSnapshot({ remainingMs: display, durationMinutes: dur }).catch(() => {});
  },

  restoreSnapshot: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIMER_STATE);
      if (json) {
        const snap: LastTimerSnapshot = JSON.parse(json);
        set({
          lastRemainingMs: snap.remainingMs,
          lastDurationMinutes: snap.durationMinutes,
          restored: true,
        });
      } else {
        set({ restored: true });
      }
    } catch {
      set({ restored: true });
    }
  },
}));
