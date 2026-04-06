import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FocusPhase, FocusConfig, FocusSessionRecord } from '@/types';

// ─── Types ───────────────────────────────────
interface FocusState {
  /** Timer config */
  config: FocusConfig;
  /** Current phase */
  phase: FocusPhase;
  /** Current session number (1-based) within a pomodoro cycle */
  currentSession: number;
  /** Total completed focus sessions today */
  completedSessions: number;
  /** Is timer running */
  isRunning: boolean;
  /** Absolute end time (ms) for current phase */
  endTime: number;
  /** Duration of current phase (ms) */
  phaseDurationMs: number;
  /** Today's total focus minutes */
  todayFocusMinutes: number;
  /** History records */
  records: FocusSessionRecord[];
  /** Sound preset ID for focus mode */
  focusSoundPresetId: string | null;

  // Actions
  setConfig: (config: Partial<FocusConfig>) => void;
  startFocus: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  tick: () => FocusPhase | null; // returns new phase if transition happened
  setFocusSoundPreset: (presetId: string | null) => void;
  getWeeklyStats: () => FocusSessionRecord[];
}

const DEFAULT_CONFIG: FocusConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      phase: 'idle',
      currentSession: 1,
      completedSessions: 0,
      isRunning: false,
      endTime: 0,
      phaseDurationMs: 0,
      todayFocusMinutes: 0,
      records: [],
      focusSoundPresetId: null,

      setConfig: (partial) => {
        set((state) => ({
          config: { ...state.config, ...partial },
        }));
      },

      startFocus: () => {
        const { config } = get();
        const durationMs = config.focusMinutes * 60_000;
        set({
          phase: 'focus',
          isRunning: true,
          endTime: Date.now() + durationMs,
          phaseDurationMs: durationMs,
          currentSession: 1,
          completedSessions: 0,
        });
      },

      pause: () => {
        const { endTime } = get();
        const remaining = Math.max(0, endTime - Date.now());
        set({
          isRunning: false,
          phaseDurationMs: remaining,
          endTime: 0,
        });
      },

      resume: () => {
        const { phaseDurationMs } = get();
        set({
          isRunning: true,
          endTime: Date.now() + phaseDurationMs,
        });
      },

      skip: () => {
        const state = get();
        const nextPhase = getNextPhase(state.phase, state.currentSession, state.config);
        const durationMs = getPhaseDuration(nextPhase, state.config);

        const newSession = nextPhase === 'focus'
          ? (state.phase === 'long-break' ? 1 : state.currentSession + (state.phase !== 'idle' ? 0 : 0))
          : state.currentSession;

        set({
          phase: nextPhase,
          isRunning: true,
          endTime: Date.now() + durationMs,
          phaseDurationMs: durationMs,
          currentSession: state.phase === 'focus' ? state.currentSession : newSession,
        });
      },

      reset: () => {
        set({
          phase: 'idle',
          isRunning: false,
          endTime: 0,
          phaseDurationMs: 0,
          currentSession: 1,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning || state.phase === 'idle') return null;

        const remaining = state.endTime - Date.now();
        if (remaining > 0) return null;

        // Phase completed
        const today = getTodayDate();

        if (state.phase === 'focus') {
          const newCompleted = state.completedSessions + 1;
          const addedMinutes = state.config.focusMinutes;
          const newTodayMinutes = state.todayFocusMinutes + addedMinutes;

          // Update/add today's record
          const existingIdx = state.records.findIndex((r) => r.date === today);
          const updatedRecords = [...state.records];
          if (existingIdx >= 0) {
            updatedRecords[existingIdx] = {
              ...updatedRecords[existingIdx],
              totalFocusMinutes: updatedRecords[existingIdx].totalFocusMinutes + addedMinutes,
              sessionsCompleted: updatedRecords[existingIdx].sessionsCompleted + 1,
            };
          } else {
            updatedRecords.unshift({
              date: today,
              totalFocusMinutes: addedMinutes,
              sessionsCompleted: 1,
            });
          }

          const nextPhase = getNextPhase('focus', state.currentSession, state.config);
          const durationMs = getPhaseDuration(nextPhase, state.config);

          set({
            phase: nextPhase,
            completedSessions: newCompleted,
            todayFocusMinutes: newTodayMinutes,
            endTime: Date.now() + durationMs,
            phaseDurationMs: durationMs,
            currentSession: nextPhase === 'focus' ? state.currentSession + 1 : state.currentSession,
            records: updatedRecords.slice(0, 90),
          });

          return nextPhase;
        }

        // Break completed → start focus
        const durationMs = state.config.focusMinutes * 60_000;
        const nextSession = state.phase === 'long-break' ? 1 : state.currentSession + 1;

        set({
          phase: 'focus',
          endTime: Date.now() + durationMs,
          phaseDurationMs: durationMs,
          currentSession: nextSession,
        });

        return 'focus';
      },

      setFocusSoundPreset: (presetId) => {
        set({ focusSoundPresetId: presetId });
      },

      getWeeklyStats: () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return get().records.filter((r) => r.date >= cutoffStr);
      },
    }),
    {
      name: 'deep-sleep-focus-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        config: state.config,
        records: state.records,
        focusSoundPresetId: state.focusSoundPresetId,
      }),
    },
  ),
);

// ─── Helpers ─────────────────────────────────

function getNextPhase(
  currentPhase: FocusPhase,
  currentSession: number,
  config: FocusConfig,
): FocusPhase {
  if (currentPhase === 'focus') {
    if (currentSession >= config.sessionsBeforeLongBreak) {
      return 'long-break';
    }
    return 'short-break';
  }
  return 'focus';
}

function getPhaseDuration(phase: FocusPhase, config: FocusConfig): number {
  switch (phase) {
    case 'focus': return config.focusMinutes * 60_000;
    case 'short-break': return config.shortBreakMinutes * 60_000;
    case 'long-break': return config.longBreakMinutes * 60_000;
    default: return 0;
  }
}
