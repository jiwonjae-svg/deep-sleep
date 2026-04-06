import { create } from 'zustand';

export interface BreathingPhase {
  type: 'inhale' | 'hold' | 'exhale';
  durationSec: number;
  label: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  nameEn: string;
  phases: BreathingPhase[];
  totalCycleSec: number;
  recommendedCycles: number;
  isPremium: boolean;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: '4-7-8',
    name: '4-7-8 호흡법',
    nameEn: '4-7-8 Breathing',
    phases: [
      { type: 'inhale', durationSec: 4, label: '들이쉬기' },
      { type: 'hold', durationSec: 7, label: '유지' },
      { type: 'exhale', durationSec: 8, label: '내쉬기' },
    ],
    totalCycleSec: 19,
    recommendedCycles: 4,
    isPremium: false,
  },
  {
    id: 'box-4',
    name: '박스 호흡법',
    nameEn: 'Box Breathing',
    phases: [
      { type: 'inhale', durationSec: 4, label: '들이쉬기' },
      { type: 'hold', durationSec: 4, label: '유지' },
      { type: 'exhale', durationSec: 4, label: '내쉬기' },
      { type: 'hold', durationSec: 4, label: '유지' },
    ],
    totalCycleSec: 16,
    recommendedCycles: 5,
    isPremium: false,
  },
  {
    id: 'relaxing-2-4',
    name: '이완 호흡',
    nameEn: 'Relaxing Breath',
    phases: [
      { type: 'inhale', durationSec: 2, label: '들이쉬기' },
      { type: 'exhale', durationSec: 4, label: '내쉬기' },
    ],
    totalCycleSec: 6,
    recommendedCycles: 10,
    isPremium: false,
  },
  {
    id: 'deep-calm',
    name: '깊은 안정',
    nameEn: 'Deep Calm',
    phases: [
      { type: 'inhale', durationSec: 5, label: '들이쉬기' },
      { type: 'hold', durationSec: 5, label: '유지' },
      { type: 'exhale', durationSec: 10, label: '내쉬기' },
    ],
    totalCycleSec: 20,
    recommendedCycles: 4,
    isPremium: true,
  },
];

interface BreathingStoreState {
  /** 현재 선택된 패턴 ID */
  selectedPatternId: string;
  /** 세션 진행 중 여부 */
  isSessionActive: boolean;
  /** 현재 단계 인덱스 */
  currentPhaseIndex: number;
  /** 현재 단계 남은 시간(초) */
  phaseRemainingSec: number;
  /** 완료한 사이클 수 */
  completedCycles: number;
  /** 목표 사이클 수 */
  targetCycles: number;
}

interface BreathingStoreActions {
  setPattern: (id: string) => void;
  startSession: (cycles?: number) => void;
  stopSession: () => void;
  tick: () => void;
}

export const useBreathingStore = create<BreathingStoreState & BreathingStoreActions>(
  (set, get) => ({
    selectedPatternId: '4-7-8',
    isSessionActive: false,
    currentPhaseIndex: 0,
    phaseRemainingSec: 0,
    completedCycles: 0,
    targetCycles: 4,

    setPattern: (id) => set({ selectedPatternId: id }),

    startSession: (cycles) => {
      const pattern = BREATHING_PATTERNS.find((p) => p.id === get().selectedPatternId);
      if (!pattern) return;
      set({
        isSessionActive: true,
        currentPhaseIndex: 0,
        phaseRemainingSec: pattern.phases[0].durationSec,
        completedCycles: 0,
        targetCycles: cycles ?? pattern.recommendedCycles,
      });
    },

    stopSession: () =>
      set({
        isSessionActive: false,
        currentPhaseIndex: 0,
        phaseRemainingSec: 0,
        completedCycles: 0,
      }),

    tick: () => {
      const state = get();
      if (!state.isSessionActive) return;

      const pattern = BREATHING_PATTERNS.find((p) => p.id === state.selectedPatternId);
      if (!pattern) return;

      if (state.phaseRemainingSec > 1) {
        set({ phaseRemainingSec: state.phaseRemainingSec - 1 });
      } else {
        const nextPhaseIndex = state.currentPhaseIndex + 1;
        if (nextPhaseIndex >= pattern.phases.length) {
          const nextCycle = state.completedCycles + 1;
          if (nextCycle >= state.targetCycles) {
            set({ isSessionActive: false, completedCycles: nextCycle });
          } else {
            set({
              currentPhaseIndex: 0,
              phaseRemainingSec: pattern.phases[0].durationSec,
              completedCycles: nextCycle,
            });
          }
        } else {
          set({
            currentPhaseIndex: nextPhaseIndex,
            phaseRemainingSec: pattern.phases[nextPhaseIndex].durationSec,
          });
        }
      }
    },
  }),
);
