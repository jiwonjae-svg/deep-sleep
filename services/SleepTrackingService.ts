import { Accelerometer } from 'expo-sensors';
import type { AccelerometerMeasurement } from 'expo-sensors/build/Accelerometer';
import { useSleepStore } from '@/stores/useSleepStore';

// ──────────────────────────────────────────────
// Accelerometer-based sleep tracking service
// ──────────────────────────────────────────────

let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
let epochInterval: ReturnType<typeof setInterval> | null = null;
let magnitudeBuffer: number[] = [];

const SAMPLE_INTERVAL_MS = 100; // 10Hz
const EPOCH_DURATION_MS = 60_000; // 1 minute per epoch

/**
 * Start accelerometer sampling and epoch aggregation.
 * Each epoch (1 minute) averages the magnitude values and stores them.
 */
export async function startSleepTracking(): Promise<boolean> {
  const available = await Accelerometer.isAvailableAsync();
  if (!available) return false;

  // Reset buffer
  magnitudeBuffer = [];

  // Set sampling rate
  Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);

  // Start listening
  subscription = Accelerometer.addListener(({ x, y, z }: AccelerometerMeasurement) => {
    // Compute magnitude (subtract gravity ~1g, take absolute deviation)
    const magnitude = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
    magnitudeBuffer.push(magnitude);
  });

  // Aggregate magnitudes into 1-minute epochs
  epochInterval = setInterval(() => {
    if (magnitudeBuffer.length === 0) return;

    // Average magnitude for this epoch
    const avg = magnitudeBuffer.reduce((a, b) => a + b, 0) / magnitudeBuffer.length;
    magnitudeBuffer = [];

    useSleepStore.getState().addEpoch(avg);
  }, EPOCH_DURATION_MS);

  // Mark tracking as started in store
  useSleepStore.getState().startTracking();

  return true;
}

/**
 * Stop accelerometer tracking, compute sleep metrics, and return the record.
 */
export function stopSleepTracking() {
  // Flush remaining buffer as partial epoch
  if (magnitudeBuffer.length > 0) {
    const avg = magnitudeBuffer.reduce((a, b) => a + b, 0) / magnitudeBuffer.length;
    magnitudeBuffer = [];
    useSleepStore.getState().addEpoch(avg);
  }

  // Stop accelerometer
  if (subscription) {
    subscription.remove();
    subscription = null;
  }

  // Stop epoch aggregation
  if (epochInterval) {
    clearInterval(epochInterval);
    epochInterval = null;
  }

  // Compute and store sleep record
  return useSleepStore.getState().stopTracking();
}

export function isTrackingActive(): boolean {
  return subscription !== null;
}
