import { Accelerometer } from 'expo-sensors';
import type { AccelerometerMeasurement } from 'expo-sensors/build/Accelerometer';
import { Audio } from 'expo-av';
import { useSleepStore } from '@/stores/useSleepStore';
import { useAudioStore } from '@/stores/useAudioStore';

// ──────────────────────────────────────────────
// Accelerometer-based sleep tracking service
// + Audio environment noise monitoring
// ──────────────────────────────────────────────

let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
let epochInterval: ReturnType<typeof setInterval> | null = null;
let noiseMonitorInterval: ReturnType<typeof setInterval> | null = null;
let recording: Audio.Recording | null = null;
let magnitudeBuffer: number[] = [];

const SAMPLE_INTERVAL_MS = 100; // 10Hz
const EPOCH_DURATION_MS = 60_000; // 1 minute per epoch
const NOISE_CHECK_INTERVAL_MS = 30_000; // Check noise every 30 seconds
const NOISE_THRESHOLD = 0.15; // Amplitude threshold for noise event (0-1)

// ──────────────────────────────────────────────
// Noise monitoring via microphone metering
// ──────────────────────────────────────────────

async function startNoiseMonitor(): Promise<void> {
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: rec } = await Audio.Recording.createAsync({
      ...Audio.RecordingOptionsPresets.LOW_QUALITY,
      isMeteringEnabled: true,
    });
    recording = rec;

    let noiseStart: number | null = null;
    let noiseAmplitudes: number[] = [];

    noiseMonitorInterval = setInterval(async () => {
      if (!recording) return;
      try {
        const status = await recording.getStatusAsync();
        if (!status.isRecording || status.metering === undefined) return;

        // Convert dB to 0-1 amplitude (metering is in dBFS, typically -160 to 0)
        const db = status.metering;
        const amplitude = Math.max(0, Math.min(1, (db + 60) / 60)); // -60dB=0, 0dB=1

        if (amplitude >= NOISE_THRESHOLD) {
          if (!noiseStart) noiseStart = Date.now();
          noiseAmplitudes.push(amplitude);
        } else if (noiseStart && noiseAmplitudes.length > 0) {
          // Noise event ended
          const avgAmp = noiseAmplitudes.reduce((a, b) => a + b, 0) / noiseAmplitudes.length;
          const durationSec = (Date.now() - noiseStart) / 1000;
          useSleepStore.getState().addNoiseEvent({
            timestamp: noiseStart,
            amplitude: Math.round(avgAmp * 100) / 100,
            durationSec: Math.round(durationSec),
          });
          noiseStart = null;
          noiseAmplitudes = [];
        }
      } catch {
        // ignore metering errors
      }
    }, NOISE_CHECK_INTERVAL_MS);
  } catch {
    // Microphone not available — silently skip noise monitoring
  }
}

async function stopNoiseMonitor(): Promise<void> {
  if (noiseMonitorInterval) {
    clearInterval(noiseMonitorInterval);
    noiseMonitorInterval = null;
  }
  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // already stopped
    }
    recording = null;
  }
  // Restore audio mode for playback
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  }).catch(() => {});
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Start accelerometer sampling, epoch aggregation, and noise monitoring.
 * Optionally accepts a list of sound IDs currently playing.
 */
export async function startSleepTracking(soundIds?: string[]): Promise<boolean> {
  const available = await Accelerometer.isAvailableAsync();
  if (!available) return false;

  // Capture currently active sounds if not provided
  const activeSoundIds = soundIds ?? Array.from(useAudioStore.getState().activeSounds.keys());

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

  // Mark tracking as started in store (with sound IDs)
  useSleepStore.getState().startTracking(activeSoundIds);

  // Start noise monitoring (microphone metering)
  await startNoiseMonitor();

  return true;
}

/**
 * Stop accelerometer tracking, noise monitoring, compute sleep metrics, and return the record.
 */
export async function stopSleepTracking() {
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

  // Stop noise monitoring
  await stopNoiseMonitor();

  // Compute and store sleep record
  return useSleepStore.getState().stopTracking();
}

export function isTrackingActive(): boolean {
  return subscription !== null;
}
