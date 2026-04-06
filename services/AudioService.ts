import { Audio, AVPlaybackStatus } from 'expo-av';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { getPerlinVolume } from '@/utils/perlinNoise';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset, getSoundVariants } from '@/data/soundAssets';
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

// 크로스페이드 루핑 관련
const crossfadeInProgress = new Set<string>();
const crossfadeOutSounds: Audio.Sound[] = []; // 페이드아웃 중인 이전 인스턴스

let timerCheckInterval: ReturnType<typeof setInterval> | null = null;
let seedCounter = 0;

// 메인 재생 일시정지 (프리뷰용)
let isPausedForPreview = false;

// ──────────────────────────────────────────────
// Global fade factor (0..1)
// ──────────────────────────────────────────────

let fadeFactor = 1.0;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
const FADE_IN_MS = 800;
const FADE_OUT_MS = 800;
const FADE_STEP_MS = 50;
const CROSSFADE_MS = 1000; // 배리언트 크로스페이드 시간

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
// Per-sound crossfade factor (배리언트 크로스페이드용)
// 1.0 = 정상, 0.0→1.0 = 페이드인 중
// ──────────────────────────────────────────────

const soundCrossfadeFactor = new Map<string, number>();

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
    const source = getSoundAsset(soundId); // 랜덤 배리언트
    if (!source) return null;

    // 연속 재생 소리는 isLooping: false (수동 크로스페이드 루핑)
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: false, isLooping: false, volume: 0 },
    );
    soundPool.set(soundId, sound);

    if (!soundSeeds.has(soundId)) {
      soundSeeds.set(soundId, ++seedCounter);
    }

    // 연속 재생 소리: 크로스페이드 루핑 모니터 설정
    if (meta.type === 'continuous') {
      setupCrossfadeMonitor(soundId, sound);
    }

    return sound;
  } catch {
    return null;
  }
}

/** 크로스페이드 루핑 모니터: 끝나기 1초 전에 다음 배리언트로 전환 */
function setupCrossfadeMonitor(soundId: string, sound: Audio.Sound) {
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!('isLoaded' in status) || !status.isLoaded) return;
    if (crossfadeInProgress.has(soundId)) return;

    // 백그라운드 안전장치: 크로스페이드 없이 재생이 끝난 경우 즉시 재시작
    if (status.didJustFinish) {
      crossfadeInProgress.add(soundId);
      performVariantCrossfade(soundId, sound).catch(() => {
        crossfadeInProgress.delete(soundId);
      });
      return;
    }

    if (!status.isPlaying) return;

    const duration = status.durationMillis ?? 0;
    const position = status.positionMillis;
    const remaining = duration - position;

    // 끝나기 CROSSFADE_MS 전에 크로스페이드 시작
    if (duration > 0 && remaining <= CROSSFADE_MS && remaining > 0) {
      crossfadeInProgress.add(soundId);
      performVariantCrossfade(soundId, sound).catch(() => {
        crossfadeInProgress.delete(soundId);
      });
    }
  });
}

/** 배리언트 크로스페이드: 현재 소리 페이드아웃 + 새 배리언트 페이드인 */
async function performVariantCrossfade(soundId: string, oldSound: Audio.Sound) {
  const meta = getSoundById(soundId);
  if (!meta) { crossfadeInProgress.delete(soundId); return; }

  try {
    const source = getSoundAsset(soundId); // 새 랜덤 배리언트
    if (!source) { crossfadeInProgress.delete(soundId); return; }

    const { sound: newSound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: false, isLooping: false, volume: 0 },
    );

    // 새 소리 시작
    await newSound.playAsync();
    setupCrossfadeMonitor(soundId, newSound);

    // soundPool에 새 소리 등록 (볼륨 애니메이터가 새 소리에 볼륨 적용)
    soundPool.set(soundId, newSound);

    // 크로스페이드: 새 소리 페이드인 (soundCrossfadeFactor로 제어)
    soundCrossfadeFactor.set(soundId, 0);
    const steps = CROSSFADE_MS / FADE_STEP_MS;
    const increment = 1 / steps;
    let step = 0;

    const crossfadeTimer = setInterval(async () => {
      step++;
      const factor = Math.min(1, step * increment);
      soundCrossfadeFactor.set(soundId, factor);

      // 이전 소리 볼륨 감소
      try {
        await oldSound.setVolumeAsync(Math.max(0, (1 - factor) * 0.5));
      } catch {}

      if (step >= steps) {
        clearInterval(crossfadeTimer);
        soundCrossfadeFactor.set(soundId, 1);
        crossfadeInProgress.delete(soundId);

        // 이전 소리 정리
        try { await oldSound.stopAsync(); } catch {}
        try { await oldSound.unloadAsync(); } catch {}
      }
    }, FADE_STEP_MS);

    // 이전 소리를 추적 (정리 시 사용)
    crossfadeOutSounds.push(oldSound);
  } catch {
    crossfadeInProgress.delete(soundId);
  }
}

async function unloadSound(soundId: string): Promise<void> {
  const sound = soundPool.get(soundId);
  if (!sound) return;

  clearVolumeAnimator(soundId);
  clearFrequencyTimer(soundId);
  crossfadeInProgress.delete(soundId);
  soundCrossfadeFactor.delete(soundId);

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
  // 크로스페이드 중인 이전 소리도 정리
  for (const old of crossfadeOutSounds) {
    try { await old.stopAsync(); } catch {}
    try { await old.unloadAsync(); } catch {}
  }
  crossfadeOutSounds.length = 0;
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

    const store = useAudioStore.getState();
    const state = store.activeSounds.get(soundId) ?? store.presetSounds.get(soundId);
    if (!state) {
      clearVolumeAnimator(soundId);
      return;
    }

    const masterVolume = store.masterVolume / 100;
    const vol = getPerlinVolume(Date.now() / 1000, seed, speed, state.volumeMin, state.volumeMax);
    const cf = soundCrossfadeFactor.get(soundId) ?? 1;
    sound.setVolumeAsync(vol * masterVolume * fadeFactor * cf).catch(() => {});
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
      return [0, 0];
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

  const state = useAudioStore.getState().activeSounds.get(soundId) ?? useAudioStore.getState().presetSounds.get(soundId);
  if (!state || state.frequency === 'continuous') return;

  const [min, max] = getIntervalRange(state.frequency);
  const delay = min + Math.random() * (max - min);

  const id = setTimeout(async () => {
    if (!useAudioStore.getState().isPlaying) return;

    // 간헐적 소리도 매번 랜덤 배리언트 사용
    const source = getSoundAsset(soundId);
    if (!source) return;

    const currentState = useAudioStore.getState().activeSounds.get(soundId) ?? useAudioStore.getState().presetSounds.get(soundId);
    if (!currentState) return;

    try {
      // 기존 인스턴스 정리 후 새로 로드
      const oldSound = soundPool.get(soundId);
      if (oldSound) {
        try { await oldSound.stopAsync(); } catch {}
        try { await oldSound.unloadAsync(); } catch {}
        soundPool.delete(soundId);
      }

      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: false, isLooping: false, volume: 0 },
      );
      soundPool.set(soundId, sound);

      const masterVolume = useAudioStore.getState().masterVolume / 100;
      const vol = ((currentState.volumeMin + currentState.volumeMax) / 2 / 100) * masterVolume * fadeFactor;
      await sound.setVolumeAsync(vol);
      await sound.playAsync();
    } catch {}

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
  await cleanupSoundPool();
  isPausedForPreview = false;

  const store = useAudioStore.getState();
  // 프리셋 소리 + 믹서 소리 모두 재생 (중복 시 프리셋 설정 우선)
  const merged = new Map<string, ActiveSoundState>();
  for (const [id, state] of store.activeSounds) merged.set(id, state);
  for (const [id, state] of store.presetSounds) merged.set(id, state);
  const entries = Array.from(merged.values());

  if (entries.length === 0) return;

  for (const state of entries) {
    const sound = await loadSound(state.soundId);
    if (!sound) continue;

    const meta = getSoundById(state.soundId);
    if (!meta) continue;

    await sound.setVolumeAsync(0);
    soundCrossfadeFactor.set(state.soundId, 1);

    if (meta.type === 'continuous') {
      await sound.playAsync();
      startVolumeAnimator(state.soundId, 'medium');
    } else {
      await sound.playAsync();
      scheduleIntermittent(state.soundId);
    }
  }

  fadeIn(FADE_IN_MS);
  store.setPlaying(true);
  startTimerCheck();

  const timer = useTimerStore.getState();
  if (timer.isActive && !isTrackingActive()) {
    const soundIds = Array.from(store.activeSounds.keys());
    startSleepTracking(soundIds).catch(() => {});
  }
}

/** 즉시 정지: UI 즉시 반영, 페이드아웃은 백그라운드 */
export async function stopAll(): Promise<void> {
  // 타이머 잔여 시간 스냅샷 저장
  const timerState = useTimerStore.getState();
  if (timerState.isActive) {
    const remaining = Math.max(0, timerState.endTime - Date.now());
    timerState.saveSnapshot(remaining);
  }

  // UI 즉시 업데이트
  const store = useAudioStore.getState();
  store.setPlaying(false);
  store.clearPresetSounds();
  stopTimerCheck();

  // 페이드아웃 후 정리 (백그라운드)
  await fadeOut(FADE_OUT_MS);
  await cleanupSoundPool();
}

/** 프리셋 적용 — 재생 중이면 크로스페이드 전환 */
export async function applyPreset(sounds: ActiveSoundState[], presetId: string): Promise<void> {
  const store = useAudioStore.getState();
  const wasPlaying = store.isPlaying;

  if (wasPlaying) {
    // 크로스페이드 전환: 현재 소리 페이드아웃
    await fadeOut(FADE_OUT_MS);
    await cleanupSoundPool();
  }

  // 프리셋 소리는 presetSounds에 설정 (activeSounds는 건드리지 않음)
  store.setPresetSounds(sounds);
  store.setActivePresetId(presetId);

  // 재생 시작 (페이드인 포함)
  await startMix();
}

// ──────────────────────────────────────────────
// Preview: 메인 재생 일시정지/재개
// ──────────────────────────────────────────────

/** 프리뷰 시작 시 메인 재생 일시정지 (서서히) */
export async function pauseForPreview(): Promise<void> {
  if (!useAudioStore.getState().isPlaying || isPausedForPreview) return;
  isPausedForPreview = true;

  await fadeOut(FADE_OUT_MS);

  // 모든 소리 일시정지
  for (const [, sound] of soundPool) {
    try { await sound.pauseAsync(); } catch {}
  }
}

/** 프리뷰 종료 시 메인 재생 재개 (서서히) */
export async function resumeFromPreview(): Promise<void> {
  if (!isPausedForPreview) return;
  isPausedForPreview = false;

  // 모든 소리 재개
  for (const [, sound] of soundPool) {
    try { await sound.playAsync(); } catch {}
  }

  fadeIn(FADE_IN_MS);
}

/** 프리뷰 일시정지 상태인지 */
export function isPaused(): boolean {
  return isPausedForPreview;
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
      // 타이머 만료: 잔여 0 스냅샷 저장
      timer.saveSnapshot(0);
      timer.cancelTimer();
      fadeFactor = 0;
      clearFadeTimer();
      await cleanupSoundPool();
      useAudioStore.getState().setPlaying(false);
      stopTimerCheck();
      if (isTrackingActive()) {
        await stopSleepTracking();
      }
    } else {
      // 설정에서 페이드아웃 시간 가져오기
      const settings = useSettingsStore.getState().settings;
      const fadeOutMs = settings.timerFadeOutEnabled
        ? settings.timerFadeOutMinutes * 60 * 1000
        : TIMER_FADEOUT_DURATION;
      if (remaining <= fadeOutMs) {
        fadeFactor = remaining / fadeOutMs;
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
  clearFadeTimer();
  await cleanupSoundPool();
  useAudioStore.getState().setPlaying(false);
  stopTimerCheck();
  soundSeeds.clear();
  seedCounter = 0;
}
