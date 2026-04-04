import { Audio, AVPlaybackStatus } from 'expo-av';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { getPerlinVolume } from '@/utils/perlinNoise';
import { getSoundById } from '@/data/sounds';
import { ActiveSoundState, Frequency, VolumeChangeSpeed } from '@/types';
import { MAX_SIMULTANEOUS_SOUNDS, TIMER_FADEOUT_DURATION } from '@/utils/constants';
import { useSleepStore } from '@/stores/useSleepStore';
import { startSleepTracking, stopSleepTracking, isTrackingActive } from '@/services/SleepTrackingService';

// ──────────────────────────────────────────────
// Sound instance tracking
// ──────────────────────────────────────────────

const soundPool = new Map<string, Audio.Sound>();
const volumeAnimators = new Map<string, ReturnType<typeof setInterval>>();
const frequencyTimers = new Map<string, ReturnType<typeof setTimeout>>();
const soundSeeds = new Map<string, number>();

let masterTickInterval: ReturnType<typeof setInterval> | null = null;
let timerCheckInterval: ReturnType<typeof setInterval> | null = null;
let seedCounter = 0;

// ──────────────────────────────────────────────
// Audio mode initialization
// ──────────────────────────────────────────────

export async function initAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

// ──────────────────────────────────────────────
// Sound loading / unloading
// ──────────────────────────────────────────────

async function loadSound(soundId: string): Promise<Audio.Sound | null> {
  if (soundPool.has(soundId)) return soundPool.get(soundId)!;

  const meta = getSoundById(soundId);
  if (!meta) return null;

  try {
    // expo-av requires static imports for bundled assets.
    // For production, sounds would be in assets/sounds/.
    // For now, we create a placeholder that handles missing files gracefully.
    const { sound } = await Audio.Sound.createAsync(
      { uri: `asset:///sounds/${meta.fileName}` },
      { shouldPlay: false, isLooping: meta.type === 'continuous', volume: 0 },
    );
    soundPool.set(soundId, sound);

    if (!soundSeeds.has(soundId)) {
      soundSeeds.set(soundId, ++seedCounter);
    }

    return sound;
  } catch {
    // 파일 없는 경우 (개발 중) — 조용히 실패
    return null;
  }
}

async function unloadSound(soundId: string): Promise<void> {
  const sound = soundPool.get(soundId);
  if (!sound) return;

  clearVolumeAnimator(soundId);
  clearFrequencyTimer(soundId);

  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch {
    // already unloaded
  }
  soundPool.delete(soundId);
}

// ──────────────────────────────────────────────
// Volume animation (Perlin noise)
// ──────────────────────────────────────────────

function clearVolumeAnimator(soundId: string) {
  const id = volumeAnimators.get(soundId);
  if (id) {
    clearInterval(id);
    volumeAnimators.delete(soundId);
  }
}

function startVolumeAnimator(soundId: string, state: ActiveSoundState, speed: VolumeChangeSpeed) {
  clearVolumeAnimator(soundId);

  const seed = soundSeeds.get(soundId) ?? 0;

  const id = setInterval(() => {
    const sound = soundPool.get(soundId);
    if (!sound) {
      clearVolumeAnimator(soundId);
      return;
    }

    const masterVolume = useAudioStore.getState().masterVolume / 100;
    const vol = getPerlinVolume(Date.now() / 1000, seed, speed, state.volumeMin, state.volumeMax);
    sound.setVolumeAsync(vol * masterVolume).catch(() => {});
  }, 100); // 10fps

  volumeAnimators.set(soundId, id);
}

// ──────────────────────────────────────────────
// Frequency-based intermittent playback
// ──────────────────────────────────────────────

function clearFrequencyTimer(soundId: string) {
  const id = frequencyTimers.get(soundId);
  if (id) {
    clearTimeout(id);
    frequencyTimers.delete(soundId);
  }
}

function getIntervalRange(freq: Frequency): [number, number] {
  switch (freq) {
    case 'continuous':
      return [0, 0]; // 연속 재생이므로 타이머 불필요
    case 'frequent':
      return [5_000, 15_000];
    case 'occasional':
      return [20_000, 60_000];
    case 'rare':
      return [60_000, 180_000];
  }
}

function scheduleIntermittent(soundId: string, state: ActiveSoundState) {
  clearFrequencyTimer(soundId);

  const meta = getSoundById(soundId);
  if (!meta || meta.type !== 'intermittent') return;
  if (state.frequency === 'continuous') return;

  const [min, max] = getIntervalRange(state.frequency);
  const delay = min + Math.random() * (max - min);

  const id = setTimeout(async () => {
    const sound = soundPool.get(soundId);
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        const masterVolume = useAudioStore.getState().masterVolume / 100;
        const vol = (state.volumeMin + state.volumeMax) / 2 / 100;
        await sound.setVolumeAsync(vol * masterVolume);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch {
      // ignore
    }

    // 재생 후 다음 스케줄
    if (useAudioStore.getState().isPlaying) {
      scheduleIntermittent(soundId, state);
    }
  }, delay);

  frequencyTimers.set(soundId, id);
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function startMix(): Promise<void> {
  const store = useAudioStore.getState();
  const entries = Array.from(store.activeSounds.values());

  if (entries.length === 0) return;

  for (const state of entries) {
    const sound = await loadSound(state.soundId);
    if (!sound) continue;

    const meta = getSoundById(state.soundId);
    if (!meta) continue;

    const masterVolume = store.masterVolume / 100;
    const initialVol = ((state.volumeMin + state.volumeMax) / 2 / 100) * masterVolume;
    await sound.setVolumeAsync(initialVol);

    if (meta.type === 'continuous') {
      await sound.playAsync();
      startVolumeAnimator(state.soundId, state, 'medium');
    } else {
      // 간헐적 소리: 처음 한 번 재생 후 타이머 시작
      await sound.playAsync();
      scheduleIntermittent(state.soundId, state);
    }
  }

  store.setPlaying(true);
  startTimerCheck();

  // Auto-start sleep tracking when playback starts with a timer
  const timer = useTimerStore.getState();
  if (timer.isActive && !isTrackingActive()) {
    const soundIds = Array.from(store.activeSounds.keys());
    startSleepTracking(soundIds).catch(() => {});
  }
}

export async function stopAll(): Promise<void> {
  const store = useAudioStore.getState();
  const soundIds = Array.from(store.activeSounds.keys());

  for (const id of soundIds) {
    await unloadSound(id);
  }

  store.setPlaying(false);
  stopTimerCheck();
}

export async function fadeOutAll(durationMs: number = 5000): Promise<void> {
  const store = useAudioStore.getState();
  const soundIds = Array.from(store.activeSounds.keys());

  // 모든 volume animator 중지
  for (const id of soundIds) clearVolumeAnimator(id);

  const steps = 50;
  const interval = durationMs / steps;

  for (let i = steps; i >= 0; i--) {
    const factor = i / steps;
    for (const id of soundIds) {
      const sound = soundPool.get(id);
      const state = store.activeSounds.get(id);
      if (sound && state) {
        const vol = ((state.volumeMin + state.volumeMax) / 2 / 100) * factor;
        await sound.setVolumeAsync(vol).catch(() => {});
      }
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  await stopAll();
}

export async function applyPreset(sounds: ActiveSoundState[], presetId: string): Promise<void> {
  // 기존 재생 중지
  await stopAll();

  // 새로운 소리 설정
  const store = useAudioStore.getState();
  store.setActiveSounds(sounds);
  store.setActivePresetId(presetId);

  // 재생 시작
  await startMix();
}

// ──────────────────────────────────────────────
// Timer check
// ──────────────────────────────────────────────

function startTimerCheck() {
  stopTimerCheck();
  timerCheckInterval = setInterval(async () => {
    const timer = useTimerStore.getState();
    if (!timer.isActive) return;

    const remaining = timer.endTime - Date.now();
    if (remaining <= 0) {
      timer.cancelTimer();
      await stopAll();
      // Auto-stop sleep tracking when timer ends
      if (isTrackingActive()) {
        await stopSleepTracking();
      }
    } else if (remaining <= TIMER_FADEOUT_DURATION) {
      // 페이드아웃 중 — 마스터 볼륨 점진적 감소
      const factor = remaining / TIMER_FADEOUT_DURATION;
      const store = useAudioStore.getState();
      const adjustedMaster = (store.masterVolume / 100) * factor;
      for (const [id, state] of store.activeSounds) {
        const sound = soundPool.get(id);
        if (sound) {
          const vol = ((state.volumeMin + state.volumeMax) / 2 / 100) * adjustedMaster;
          await sound.setVolumeAsync(Math.max(0, vol)).catch(() => {});
        }
      }
    }
  }, 1000);
}

function stopTimerCheck() {
  if (timerCheckInterval) {
    clearInterval(timerCheckInterval);
    timerCheckInterval = null;
  }
}

/** CleanUp: 앱 종료 시 호출 */
export async function cleanupAudio(): Promise<void> {
  await stopAll();
  soundPool.clear();
  soundSeeds.clear();
  seedCounter = 0;
}
