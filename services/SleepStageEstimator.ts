import { SleepStage } from '@/types';

// ──────────────────────────────────────────────
// Sleep stage estimation from accelerometer epochs
// Extended Cole-Kripke algorithm
// ──────────────────────────────────────────────

export interface EpochData {
  timestamp: number;
  activityCount: number; // 1-minute epoch average magnitude
}

// Cole-Kripke weights
const CK_WEIGHTS = [
  { offset: -4, w: 74 },
  { offset: -3, w: 230 },
  { offset: -2, w: 76 },
  { offset: -1, w: 54 },
  { offset: 0, w: 106 },
  { offset: 1, w: 58 },
  { offset: 2, w: 67 },
];

/**
 * Classify a single epoch as sleep or wake using Cole-Kripke.
 * Returns true if sleep.
 */
function isSleepEpoch(epochs: EpochData[], index: number): boolean {
  let D = 0;
  for (const { offset, w } of CK_WEIGHTS) {
    const idx = index + offset;
    const val = idx >= 0 && idx < epochs.length ? epochs[idx].activityCount : 0;
    D += w * val;
  }
  D *= 0.001;
  return D <= 1;
}

/**
 * Estimate sleep stage for a given epoch index.
 * Uses Cole-Kripke for sleep/wake + activity distribution for light/deep.
 */
export function estimateSleepStage(epochs: EpochData[], currentIndex: number): SleepStage {
  if (currentIndex < 0 || currentIndex >= epochs.length) return 'wake';

  // Step 1: Cole-Kripke sleep/wake
  if (!isSleepEpoch(epochs, currentIndex)) return 'wake';

  // Step 2: Differentiate light vs deep sleep
  // Look at rolling 10-minute window average activity
  const windowSize = 10;
  const start = Math.max(0, currentIndex - windowSize + 1);
  const windowEpochs = epochs.slice(start, currentIndex + 1);
  const avgActivity = windowEpochs.reduce((s, e) => s + e.activityCount, 0) / windowEpochs.length;

  // Deep sleep threshold: very low activity (bottom 20% typical range)
  // These thresholds are calibrated for smartphone accelerometer (magnitude deviation from 1g)
  const DEEP_THRESHOLD = 0.005;
  const LIGHT_THRESHOLD = 0.03;

  if (avgActivity <= DEEP_THRESHOLD) return 'deep';

  // Step 3: REM estimation based on sleep cycle timing
  // REM typically occurs ~90 min after sleep onset, with micro-movements
  if (epochs.length >= 10) {
    // Find sleep onset
    let sleepOnsetIdx = -1;
    let consecutive = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if (isSleepEpoch(epochs, i)) {
        consecutive++;
        if (consecutive >= 10 && sleepOnsetIdx === -1) {
          sleepOnsetIdx = i - 9;
        }
      } else {
        consecutive = 0;
      }
    }

    if (sleepOnsetIdx >= 0) {
      const minutesSinceSleepOnset = currentIndex - sleepOnsetIdx;
      // Check if we're in a REM-likely window (90 min cycles, with tolerance)
      const cyclePosition = minutesSinceSleepOnset % 90;
      const isRemWindow = cyclePosition >= 60 && cyclePosition <= 90;

      // REM has slightly more micro-movements than deep but less than wake
      if (isRemWindow && avgActivity > DEEP_THRESHOLD && avgActivity <= LIGHT_THRESHOLD) {
        return 'rem';
      }
    }
  }

  return 'light';
}

/**
 * Check if current stage is "light enough" to trigger smart alarm.
 */
export function isLightSleepForAlarm(
  stage: SleepStage,
  sensitivity: 'low' | 'medium' | 'high',
): boolean {
  switch (sensitivity) {
    case 'high':
      return stage === 'wake' || stage === 'light' || stage === 'rem';
    case 'medium':
      return stage === 'wake' || stage === 'light';
    case 'low':
      return stage === 'wake';
  }
}
