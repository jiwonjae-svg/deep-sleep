import { create } from 'zustand';

interface TimerStoreState {
  /** 타이머 종료 시각 (epoch ms). 0이면 비활성. */
  endTime: number;
  /** 타이머 원래 설정 시간 (분) */
  durationMinutes: number;
  /** 타이머 활성 여부 */
  isActive: boolean;
}

interface TimerStoreActions {
  startTimer: (minutes: number) => void;
  cancelTimer: () => void;
}

export const useTimerStore = create<TimerStoreState & TimerStoreActions>((set) => ({
  endTime: 0,
  durationMinutes: 0,
  isActive: false,

  startTimer: (minutes) =>
    set({
      endTime: Date.now() + minutes * 60 * 1000,
      durationMinutes: minutes,
      isActive: true,
    }),

  cancelTimer: () =>
    set({
      endTime: 0,
      durationMinutes: 0,
      isActive: false,
    }),
}));
