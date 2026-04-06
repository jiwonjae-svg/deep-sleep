import { create } from 'zustand';
import { TimerSchedule } from '@/types';

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
}

interface TimerStoreActions {
  startTimer: (minutes: number, alarmSync?: boolean) => void;
  cancelTimer: () => void;
  setSchedule: (schedule: TimerSchedule | null) => void;
  advancePhase: () => void;
}

export const useTimerStore = create<TimerStoreState & TimerStoreActions>((set, get) => ({
  endTime: 0,
  durationMinutes: 0,
  isActive: false,
  isAlarmSync: false,
  schedule: null,
  currentPhaseIndex: 0,

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
}));
