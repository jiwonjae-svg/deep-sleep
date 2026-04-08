import { Audio } from 'expo-av';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset } from '@/data/soundAssets';
import * as AudioService from '@/services/AudioService';
import { useAudioStore } from '@/stores/useAudioStore';

/**
 * Lightweight singleton for independent sound preview.
 * Manages a single Audio.Sound instance — starting a new preview
 * automatically stops the previous one.
 * 메인 재생 중이면 자동으로 일시정지 후 프리뷰, 종료 시 재개.
 * 페이드인(0→0.7, 750ms) / 페이드아웃(→0, 750ms) 지원.
 */

const PREVIEW_VOLUME = 0.7;
const FADE_MS = 750;
const FADE_STEP_MS = 50;

let currentSound: Audio.Sound | null = null;
let currentSoundId: string | null = null;
let listeners: Set<() => void> = new Set();
let didPauseMain = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((fn) => fn());
}

function clearFadeTimer() {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
}

export function subscribePreview(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getPreviewingSoundId(): string | null {
  return currentSoundId;
}

/** 즉시 정지 (소리 전환 시 사용, 페이드아웃 없음) */
async function stopImmediate(): Promise<void> {
  clearFadeTimer();
  if (currentSound) {
    try { await currentSound.stopAsync(); } catch {}
    try { await currentSound.unloadAsync(); } catch {}
    currentSound = null;
    currentSoundId = null;
    notify();
  }
}

export async function startPreview(soundId: string): Promise<void> {
  // 같은 소리: 페이드아웃으로 정지 (토글)
  if (currentSoundId === soundId) {
    await stopPreview();
    return;
  }

  // 다른 소리로 전환: 이전 소리 즉시 정지 (메인 재생 일시정지 상태 유지)
  await stopImmediate();

  const meta = getSoundById(soundId);
  if (!meta) return;

  try {
    const source = getSoundAsset(soundId);
    if (!source) return;

    // 메인 재생 중이면 일시정지
    const isMainPlaying = useAudioStore.getState().isPlaying;
    if (isMainPlaying && !AudioService.isPaused() && !didPauseMain) {
      await AudioService.pauseForPreview();
      didPauseMain = true;
    }

    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, isLooping: true, volume: 0 },
    );

    // Listen for errors / playback ending
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('isLoaded' in status && !status.isLoaded && currentSoundId === soundId) {
        currentSound = null;
        currentSoundId = null;
        notify();
      }
    });

    currentSound = sound;
    currentSoundId = soundId;
    notify();

    // 페이드인: 0 → PREVIEW_VOLUME (750ms)
    const steps = FADE_MS / FADE_STEP_MS;
    const increment = PREVIEW_VOLUME / steps;
    let step = 0;
    clearFadeTimer();
    fadeTimer = setInterval(() => {
      step++;
      const vol = Math.min(PREVIEW_VOLUME, step * increment);
      sound.setVolumeAsync(vol).catch(() => {});
      if (step >= steps) clearFadeTimer();
    }, FADE_STEP_MS);
  } catch {
    // File missing — silently ignore
  }
}

export async function stopPreview(): Promise<void> {
  clearFadeTimer();

  const sound = currentSound;
  const wasPausedMain = didPauseMain;

  // UI 즉시 업데이트 (버튼 토글)
  currentSound = null;
  currentSoundId = null;
  didPauseMain = false;
  notify();

  if (sound) {
    // 현재 볼륨 취득
    let currentVol = PREVIEW_VOLUME;
    try {
      const status = await sound.getStatusAsync();
      if ('isLoaded' in status && status.isLoaded) currentVol = status.volume;
    } catch {}

    // 페이드아웃: currentVol → 0 (750ms)
    const steps = FADE_MS / FADE_STEP_MS;
    const decrement = currentVol / steps;
    let step = 0;

    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        step++;
        const vol = Math.max(0, currentVol - step * decrement);
        sound.setVolumeAsync(vol).catch(() => {});
        if (step >= steps) {
          clearInterval(timer);
          resolve();
        }
      }, FADE_STEP_MS);
    });

    try { await sound.stopAsync(); } catch {}
    try { await sound.unloadAsync(); } catch {}
  }

  // 메인 재생 일시정지했었으면 재개
  if (wasPausedMain) {
    await AudioService.resumeFromPreview();
  }
}
