import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SnoringEvent, SnoringRecord, SnoringIntensity } from '@/types';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  /** Tracking start (ms timestamp) */
  trackingStart: number;
  /** Tracking end (ms timestamp) */
  trackingEnd: number;
  /** Total Sleep Time in minutes */
  tst: number;
  /** Sleep Efficiency (%) */
  se: number;
  /** Sleep Onset Latency in minutes */
  sol: number;
  /** Number of awakenings */
  awakenings: number;
  /** Sleep score 0-100 */
  score: number;
  /** Morning survey data (optional) */
  survey?: MorningSurvey;
  /** Sound IDs that were playing during this sleep session */
  soundsPlayed?: string[];
  /** Noise events detected during sleep */
  noiseEvents?: NoiseEvent[];
}

export interface NoiseEvent {
  /** Timestamp (ms) */
  timestamp: number;
  /** Average amplitude (0-1) */
  amplitude: number;
  /** Duration in seconds */
  durationSec: number;
}

export interface MorningSurvey {
  /** 수면 만족도 1-5 */
  satisfaction: number;
  /** 잠들기까지 걸린 시간 */
  solPerception: 'instant' | 'under15' | 'under30' | 'over60';
  /** 밤에 깬 횟수 */
  awakeningsPerception: '0' | '1-2' | '3-4' | '5+';
  /** 개운함 1-5 */
  freshness: number;
}

interface SleepState {
  /** All sleep records */
  records: SleepRecord[];
  /** Is tracking currently active */
  isTracking: boolean;
  /** Tracking start timestamp (ms) */
  trackingStartedAt: number | null;
  /** Raw epoch data (accel magnitude averages per minute) */
  epochs: number[];
  /** Sound IDs playing when tracking started */
  trackingSounds: string[];
  /** Noise events collected during current session */
  trackingNoiseEvents: NoiseEvent[];
  /** Snoring events collected during current session */
  trackingSnoringEvents: SnoringEvent[];
  /** All snoring records */
  snoringRecords: SnoringRecord[];

  // Actions
  startTracking: (soundIds?: string[]) => void;
  stopTracking: () => SleepRecord | null;
  addEpoch: (magnitude: number) => void;
  addNoiseEvent: (event: NoiseEvent) => void;
  addSnoringEvent: (event: SnoringEvent) => void;
  addSurvey: (recordId: string, survey: MorningSurvey) => void;
  deleteRecord: (recordId: string) => void;
  clearAllRecords: () => void;
  getRecordByDate: (date: string) => SleepRecord | undefined;
  getRecentRecords: (days: number) => SleepRecord[];
  getRecentSnoringRecords: (days: number) => SnoringRecord[];
}

// ──────────────────────────────────────────────
// Cole-Kripke Sleep/Wake Classification
// ──────────────────────────────────────────────

function classifyEpochs(epochs: number[]): boolean[] {
  // Cole-Kripke weights for surrounding epochs
  // D = 0.001 * (106*A0 + 54*A-1 + 58*A+1 + 76*A-2 + 230*A-3 + 74*A-4 + 67*A+2)
  // D > 1 => Wake, D <= 1 => Sleep
  const weights = [
    { offset: -4, w: 74 },
    { offset: -3, w: 230 },
    { offset: -2, w: 76 },
    { offset: -1, w: 54 },
    { offset: 0, w: 106 },
    { offset: 1, w: 58 },
    { offset: 2, w: 67 },
  ];

  return epochs.map((_, i) => {
    let D = 0;
    for (const { offset, w } of weights) {
      const idx = i + offset;
      const val = idx >= 0 && idx < epochs.length ? epochs[idx] : 0;
      D += w * val;
    }
    D *= 0.001;
    return D <= 1; // true = Sleep, false = Wake
  });
}

function computeSleepMetrics(epochs: number[], trackingStart: number, trackingEnd: number) {
  if (epochs.length < 10) {
    return { tst: 0, se: 0, sol: 0, awakenings: 0, score: 0 };
  }

  const sleepWake = classifyEpochs(epochs);

  // Find sleep onset: first run of 10+ consecutive sleep epochs
  let sleepOnsetIdx = -1;
  let consecutiveSleep = 0;
  for (let i = 0; i < sleepWake.length; i++) {
    if (sleepWake[i]) {
      consecutiveSleep++;
      if (consecutiveSleep >= 10 && sleepOnsetIdx === -1) {
        sleepOnsetIdx = i - 9;
      }
    } else {
      consecutiveSleep = 0;
    }
  }

  if (sleepOnsetIdx === -1) sleepOnsetIdx = 0;

  // Find sleep offset: last epoch classified as sleep
  let sleepOffsetIdx = sleepWake.length - 1;
  for (let i = sleepWake.length - 1; i >= sleepOnsetIdx; i--) {
    if (sleepWake[i]) { sleepOffsetIdx = i; break; }
  }

  // TST: count of sleep epochs between onset and offset
  let tst = 0;
  let awakenings = 0;
  let wasAsleep = true;
  for (let i = sleepOnsetIdx; i <= sleepOffsetIdx; i++) {
    if (sleepWake[i]) {
      tst++;
      if (!wasAsleep) wasAsleep = true; // transition from wake to sleep
    } else {
      if (wasAsleep) { awakenings++; wasAsleep = false; }
    }
  }

  const sol = sleepOnsetIdx; // minutes to fall asleep
  const totalTimeInBed = sleepOffsetIdx - sleepOnsetIdx + 1;
  const se = totalTimeInBed > 0 ? (tst / totalTimeInBed) * 100 : 0;

  // Score calculation
  const tstScore = tst >= 360 && tst <= 540 ? 100 : Math.max(0, 100 - Math.abs(tst - 450) * 0.5);
  const seScore = se >= 85 ? 100 : Math.max(0, (se / 85) * 100);
  const solScore = sol <= 20 ? 100 : Math.max(0, 100 - (sol - 20) * 2.5);
  const awkScore = awakenings <= 1 ? 100 : awakenings <= 3 ? 75 : 50;
  // Consistency score placeholder (will be computed with full records in store)
  const consistencyScore = 75;

  const score = Math.round(
    tstScore * 0.30 + seScore * 0.25 + solScore * 0.15 + awkScore * 0.15 + consistencyScore * 0.15,
  );

  return {
    tst,
    se: Math.round(se),
    sol,
    awakenings,
    score: Math.min(100, Math.max(0, score)),
  };
}

// ──────────────────────────────────────────────
// Snoring Record Builder
// ──────────────────────────────────────────────

function buildSnoringRecord(date: string, events: SnoringEvent[]): SnoringRecord {
  const totalSnoringMinutes = Math.round(
    events.reduce((sum, e) => sum + e.durationSec, 0) / 60,
  );

  const intensityOrder: Record<SnoringIntensity, number> = { light: 0, moderate: 1, heavy: 2 };
  const avgScore = events.reduce((sum, e) => sum + intensityOrder[e.intensity], 0) / events.length;
  const avgIntensity: SnoringIntensity = avgScore >= 1.5 ? 'heavy' : avgScore >= 0.5 ? 'moderate' : 'light';

  return { date, events, totalSnoringMinutes, avgIntensity };
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      records: [],
      isTracking: false,
      trackingStartedAt: null,
      epochs: [],
      trackingSounds: [],
      trackingNoiseEvents: [],
      trackingSnoringEvents: [],
      snoringRecords: [],

      startTracking: (soundIds?: string[]) => {
        set({
          isTracking: true,
          trackingStartedAt: Date.now(),
          epochs: [],
          trackingSounds: soundIds ?? [],
          trackingNoiseEvents: [],
          trackingSnoringEvents: [],
        });
      },

      stopTracking: () => {
        const { isTracking, trackingStartedAt, epochs, trackingSounds, trackingNoiseEvents, records } = get();
        if (!isTracking || !trackingStartedAt) return null;

        const trackingEnd = Date.now();
        const metrics = computeSleepMetrics(epochs, trackingStartedAt, trackingEnd);

        // Compute consistency score from recent 7-day records
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentStarts = records
          .filter((r) => r.trackingStart >= weekAgo)
          .map((r) => {
            const d = new Date(r.trackingStart);
            return d.getHours() * 60 + d.getMinutes();
          });
        if (recentStarts.length >= 3) {
          const mean = recentStarts.reduce((a, b) => a + b, 0) / recentStarts.length;
          const variance = recentStarts.reduce((s, v) => s + (v - mean) ** 2, 0) / recentStarts.length;
          const stdMinutes = Math.sqrt(variance);
          // < 30 min std = 100, > 120 min std = 0, linear in between
          const cScore = Math.max(0, Math.min(100, 100 - ((stdMinutes - 30) / 90) * 100));
          metrics.score = Math.round(
            (metrics.score * 0.85) + (cScore * 0.15),
          );
          metrics.score = Math.min(100, Math.max(0, metrics.score));
        }

        const date = new Date(trackingStartedAt).toISOString().split('T')[0];

        const record: SleepRecord = {
          id: `sleep_${trackingStartedAt}`,
          date,
          trackingStart: trackingStartedAt,
          trackingEnd,
          ...metrics,
          soundsPlayed: trackingSounds.length > 0 ? trackingSounds : undefined,
          noiseEvents: trackingNoiseEvents.length > 0 ? trackingNoiseEvents : undefined,
        };

        set((state) => ({
          isTracking: false,
          trackingStartedAt: null,
          epochs: [],
          trackingSounds: [],
          trackingNoiseEvents: [],
          trackingSnoringEvents: [],
          records: [record, ...state.records].slice(0, 365),
          snoringRecords: state.trackingSnoringEvents.length > 0
            ? [buildSnoringRecord(date, state.trackingSnoringEvents), ...state.snoringRecords].slice(0, 365)
            : state.snoringRecords,
        }));

        return record;
      },

      addEpoch: (magnitude: number) => {
        set((state) => ({
          epochs: [...state.epochs, magnitude],
        }));
      },

      addNoiseEvent: (event: NoiseEvent) => {
        set((state) => ({
          trackingNoiseEvents: [...state.trackingNoiseEvents, event],
        }));
      },

      addSnoringEvent: (event: SnoringEvent) => {
        set((state) => ({
          trackingSnoringEvents: [...state.trackingSnoringEvents, event],
        }));
      },

      addSurvey: (recordId: string, survey: MorningSurvey) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId ? { ...r, survey } : r,
          ),
        }));
      },

      deleteRecord: (recordId: string) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== recordId),
        }));
      },

      clearAllRecords: () => {
        set({ records: [], snoringRecords: [] });
      },

      getRecordByDate: (date: string) => {
        return get().records.find((r) => r.date === date);
      },

      getRecentRecords: (days: number) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return get().records.filter((r) => r.trackingStart >= cutoff);
      },

      getRecentSnoringRecords: (days: number) => {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        return get().snoringRecords.filter((r) => r.date >= cutoffDate);
      },
    }),
    {
      name: 'deep-sleep-sleep-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        records: state.records,
        snoringRecords: state.snoringRecords,
      }),
    },
  ),
);
