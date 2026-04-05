import { Audio, AVPlaybackStatus } from 'expo-av';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { getPerlinVolume } from '@/utils/perlinNoise';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset } from '@/data/soundAssets';
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
// Global fade factor (0..1)
// ──────────────────────────────────────────────

let fadeFactor = 1.0;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
const FADE_IN_MS = 800;
const FADE_OUT_MS = 800;
const FADE_STEP_MS = 50;

function clearFadeTimer() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeIn(durationMs: number = FADE_IN_MS): void {
  clearFadeTimer();
  fadeFactor = 0;
  const increment = FADE_STEP_MS / durationMs;
  fadeTimer = setInterval(() => {
    fadeFactor = Math.min(1, fadeFactor + increment);
    if (fadeFactor >= 1) clearFadeTimer();
  }, FADE_STEP_MS);
}

function fadeOut(durationMs: number = FADE_OUT_MS): Promise<void> {
  return new Promise((resolve) => {
    clearFadeTimer();
    if (fadeFactor <= 0) { resolve(); return; }
    const startVal = fadeFactor;
    const decrement = startVal * FADE_STEP_MS / durationMs;
    fadeTimer = setInterval(() => {
      fadeFactor = Math.max(0, fadeFactor - decrement);
      if (fadeFactor <= 0) {
        clearFadeTimer();
        resolve();
      }
    }, FADE_STEP_MS);
  });
}

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
    const source = getSoundAsset(soundId);
    if (!source) return null;

    const { sound } = await Audio.Sound.createAsync(
      source,
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

  try { await sound.stopAsync(); } catch {}
  try { await sound.unloadAsync(); } catch {}
  soundPool.delete(soundId);
}

/** 사운드 풀 전체 정리 (orphaned 인스턴스 포함) */
async function cleanupSoundPool(): Promise<void> {
  const ids = Array.from(soundPool.keys());
  for (const id of ids) {
    await unloadSound(id);
  }
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

function startVolumeAnimator(soundId: string, speed: VolumeChangeSpeed) {
  clearVolumeAnimator(soundId);

  const seed = soundSeeds.get(soundId) ?? 0;

  const id = setInterval(() => {
    const sound = soundPool.get(soundId);
    if (!sound) {
      clearVolumeAnimator(soundId);
      return;
    }

    // 매 틱마다 스토어에서 최신 상태 읽기 (상세 설정 변경 실시간 반영)
    const store = useAudioStore.getState();
    const state = store.activeSounds.get(soundId);
    if (!state) {
      clearVolumeAnimator(soundId);
      return;
    }

    const masterVolume = store.masterVolume / 100;
    const vol = getPerlinVolume(Date.now() / 1000, seed, speed, state.volumeMin, state.volumeMax);
    sound.setVolumeAsync(vol * masterVolume * fadeFactor).catch(() => {});
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

function scheduleIntermittent(soundId: string) {
  clearFrequencyTimer(soundId);

  const meta = getSoundById(soundId);
  if (!meta || meta.type !== 'intermittent') return;

  // 스토어에서 최신 상태 읽기,
  const state = useAudioStore.getState().activeSounds.get(soundId);
  if (!state || state.frequency === 'continuous') return;

  const [min, max] = getIntervalRange(state.frequency);
  const delay = min + Math.random() * (max - min);

  const id = setTimeout(async () => {
    const sound = soundPool.get(soundId);
    if (!sound) return;

    // 최신 상태로 볼륨 적용
    const currentState = useAudioStore.getState().activeSounds.get(soundId);
    if (!currentState) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        const masterVolume = useAudioStore.getState().masterVolume / 100;
        const vol = ((currentState.volumeMin + currentState.volumeMax) / 2 / 100) * masterVolume * fadeFactor;
        await sound.setVolumeAsync(vol);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch {
      // ignore
    }

    // 재생 후 다음 스케줄 (최신 상태로)
    if (useAudioStore.getState().isPlaying) {
      scheduleIntermittent(soundId);
    }
  }, delay);

  frequencyTimers.set(soundId, id);
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function startMix(): Promise<void> {
  // 기존 사운드 정리 (이중 재생 방지)
  await cleanupSoundPool();

  const store = useAudioStore.getState();
  const entries = Array.from(store.activeSounds.values());

  if (entries.length === 0) return;

  for (const state of entries) {
    const sound = await loadSound(state.soundId);
    if (!sound) continue;

    const meta = getSoundById(state.soundId);
    if (!meta) continue;

    // volume 0으로 시작 (fadeIn이 점진적으로 올림)
    await sound.setVolumeAsync(0);

    if (meta.type === 'continuous') {
      await sound.playAsync();
      startVolumeAnimator(state.soundId, 'medium');
    } else {
      // 간헐적 소리: 처음 한 번 재생 후 타이머 시작
      await sound.playAsync();
      scheduleIntermittent(state.soundId);
    }
  }

  // 페이드인 시작
  fadeIn(FADE_IN_MS);
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
  // 페이드아웃 후 정리
  await fadeOut(FADE_OUT_MS);
  await cleanupSoundPool();

  useAudioStore.getState().setPlaying(false);
  stopTimerCheck();
}

export async function applyPreset(sounds: ActiveSoundState[], presetId: string): Promise<void> {
  // 기존 재생 중지 (페이드아웃 포함)
  await stopAll();

  // 새로운 소리 설정
  const store = useAudioStore.getState();
  store.setActiveSounds(sounds);
  store.setActivePresetId(presetId);

  // 재생 시작 (페이드인 포함)
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
      fadeFactor = 0;
      clearFadeTimer();
      await cleanupSoundPool();
      useAudioStore.getState().setPlaying(false);
      stopTimerCheck();
      // Auto-stop sleep tracking when timer ends
      if (isTrackingActive()) {
        await stopSleepTracking();
      }
    } else if (remaining <= TIMER_FADEOUT_DURATION) {
      // 타이머 종료 전 점진적 페이드아웃 — fadeFactor로 통합 관리
      fadeFactor = remaining / TIMER_FADEOUT_DURATION;
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
  clearFadeTimer();
  await cleanupSoundPool();
  useAudioStore.getState().setPlaying(false);
  stopTimerCheck();
  soundSeeds.clear();
  seedCounter = 0;
}
