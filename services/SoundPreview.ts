import { Audio } from 'expo-av';
import { AppState } from 'react-native';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset } from '@/data/soundAssets';
import * as AudioService from '@/services/AudioService';
import { useAudioStore } from '@/stores/useAudioStore';

/**
 * Lightweight singleton for independent sound preview.
 * Manages a single Audio.Sound instance — starting a new preview
 * automatically stops the previous one.
 * 메인 재생 중이면 자동으로 정지 후 프리뷰 (타이머도 취소됨).
 * 페이드인(0→0.7, 750ms) / 페이드아웃(→0, 750ms) 지원.
 * 크로스페이드 루핑: 끝나기 0.5초 전에 현재 배리언트 페이드아웃 + 새 배리언트 페이드인.
 */

const PREVIEW_VOLUME = 0.7;
const FADE_MS = 750;
const FADE_STEP_MS = 50;
const CROSSFADE_MS = 1500;
const CROSSFADE_TRIGGER_MS = 3000; // createAsync 지연 + 크로스페이드 듀레이션 포함 트리거 시점
const CROSSFADE_STEP_MS = 50;

let currentSound: Audio.Sound | null = null;
let currentSoundId: string | null = null;
let listeners: Set<() => void> = new Set();
let fadeTimer: ReturnType<typeof setInterval> | null = null;
let crossfadeTimer: ReturnType<typeof setInterval> | null = null;
let crossfadeInProgress = false;

// 연타 방지: 현재 진행 중인 작업 토큰 (stale 작업 취소용)
let operationToken = 0;

function notify() {
  listeners.forEach((fn) => fn());
}

function clearFadeTimer() {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
}

function clearCrossfadeTimer() {
  if (crossfadeTimer) { clearInterval(crossfadeTimer); crossfadeTimer = null; }
  crossfadeInProgress = false;
}

export function subscribePreview(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getPreviewingSoundId(): string | null {
  return currentSoundId;
}

/** 사운드를 안전하게 정리 (콜백 제거 → 정지 → 언로드) */
async function disposeSoundSafe(sound: Audio.Sound): Promise<void> {
  try { sound.setOnPlaybackStatusUpdate(null); } catch {}
  try { await sound.stopAsync(); } catch {}
  try { await sound.unloadAsync(); } catch {}
}

/** 즉시 정지 (소리 전환 시 사용, 페이드아웃 없음) */
async function stopImmediate(): Promise<void> {
  clearFadeTimer();
  clearCrossfadeTimer();
  const sound = currentSound;
  // 참조 먼저 해제하여 콜백에서의 재진입 방지
  currentSound = null;
  currentSoundId = null;
  notify();
  if (sound) {
    await disposeSoundSafe(sound);
  }
}

/** 크로스페이드 루핑 모니터: 끝나기 0.5초 전에 새 배리언트로 전환 */
function setupPreviewCrossfadeMonitor(soundId: string, sound: Audio.Sound) {
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!('isLoaded' in status) || !status.isLoaded) {
      // 예기치 않은 언로드
      if (currentSoundId === soundId && currentSound === sound) {
        currentSound = null;
        currentSoundId = null;
        notify();
      }
      return;
    }
    if (crossfadeInProgress) return;
    if (currentSoundId !== soundId) return;

    // 재생 완료 시 안전장치 (백그라운드에서 크로스페이드 놓친 경우)
    if (status.didJustFinish) {
      crossfadeInProgress = true;
      performPreviewCrossfade(soundId, sound).catch(() => {
        crossfadeInProgress = false;
      });
      return;
    }

    if (!status.isPlaying) return;

    const duration = status.durationMillis ?? 0;
    const position = status.positionMillis;
    const remaining = duration - position;

    if (duration > 0 && remaining <= CROSSFADE_TRIGGER_MS && remaining > 0) {
      crossfadeInProgress = true;
      performPreviewCrossfade(soundId, sound).catch(() => {
        crossfadeInProgress = false;
      });
    }
  });
}

/** 프리뷰 배리언트 크로스페이드: 현재 0.5초 페이드아웃 + 새 배리언트 0.5초 페이드인 */
async function performPreviewCrossfade(soundId: string, oldSound: Audio.Sound) {
  if (currentSoundId !== soundId) { crossfadeInProgress = false; return; }

  try {
    const source = getSoundAsset(soundId);
    if (!source) { crossfadeInProgress = false; return; }

    const { sound: newSound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, isLooping: false, volume: 0 },
    );

    // 새 소리의 크로스페이드 모니터 설정
    setupPreviewCrossfadeMonitor(soundId, newSound);

    // 이전 소리의 콜백 제거 (정리 중 재트리거 방지)
    try { oldSound.setOnPlaybackStatusUpdate(null); } catch {}

    // 현재 소리 등록
    currentSound = newSound;

    // 이전 소리 현재 볼륨 취득
    let oldVol = PREVIEW_VOLUME;
    try {
      const st = await oldSound.getStatusAsync();
      if ('isLoaded' in st && st.isLoaded) oldVol = st.volume;
    } catch {}

    // 크로스페이드: 이전 페이드아웃 + 새 페이드인 (0.5초, 리니어)
    const steps = CROSSFADE_MS / CROSSFADE_STEP_MS;
    let step = 0;
    clearCrossfadeTimer();

    crossfadeTimer = setInterval(() => {
      step++;
      const factor = Math.min(1, step / steps);

      // 새 소리 페이드인: 0 → PREVIEW_VOLUME
      newSound.setVolumeAsync(factor * PREVIEW_VOLUME).catch(() => {});
      // 이전 소리 페이드아웃: oldVol → 0
      oldSound.setVolumeAsync(Math.max(0, oldVol * (1 - factor))).catch(() => {});

      if (step >= steps) {
        clearCrossfadeTimer();
        // 이전 소리 정리
        disposeSoundSafe(oldSound);
      }
    }, CROSSFADE_STEP_MS);
  } catch {
    crossfadeInProgress = false;
  }
}

export async function startPreview(soundId: string): Promise<void> {
  // 연타 방지: 새 토큰 발급 → 이전 작업 자동 무효화
  const myToken = ++operationToken;

  // 같은 소리: 페이드아웃으로 정지 (토글)
  if (currentSoundId === soundId) {
    await stopPreview();
    return;
  }

  // 다른 소리로 전환: 이전 소리 즉시 정지
  await stopImmediate();

  // 토큰 검증: 연타로 새 작업이 시작됐으면 이 작업은 폐기
  if (myToken !== operationToken) return;

  const meta = getSoundById(soundId);
  if (!meta) return;

  try {
    const source = getSoundAsset(soundId);
    if (!source) return;

    // 메인 재생 중이면 정지 (타이머도 함께 취소됨)
    const isMainPlaying = useAudioStore.getState().isPlaying;
    if (isMainPlaying) {
      AudioService.stopAll();
    }

    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, isLooping: false, volume: 0 },
    );

    // 토큰 검증: createAsync 비동기 대기 중 새 작업이 시작됐으면 이 소리 폐기
    if (myToken !== operationToken) {
      await disposeSoundSafe(sound);
      return;
    }

    // 크로스페이드 루핑 모니터 설정 (배리언트 순환)
    setupPreviewCrossfadeMonitor(soundId, sound);

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
  clearCrossfadeTimer();

  const sound = currentSound;

  // UI 즉시 업데이트 (버튼 토글)
  currentSound = null;
  currentSoundId = null;
  notify();

  if (sound) {
    // 콜백 제거
    try { sound.setOnPlaybackStatusUpdate(null); } catch {}

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
}

// ──────────────────────────────────────────────
// 백그라운드/포그라운드 전환: 프리뷰도 네이티브 루핑 전환
// ──────────────────────────────────────────────

let previewAppForeground = AppState.currentState === 'active';

AppState.addEventListener('change', (nextState) => {
  const wasForeground = previewAppForeground;
  previewAppForeground = nextState === 'active';

  if (!currentSound || !currentSoundId) return;
  const meta = getSoundById(currentSoundId);
  if (!meta || meta.type !== 'continuous') return;

  if (!previewAppForeground && wasForeground) {
    // 백그라운드 진입: 네이티브 루핑 활성화 + 크로스페이드 정리
    clearCrossfadeTimer();
    try { currentSound.setOnPlaybackStatusUpdate(null); } catch {}
    currentSound.setIsLoopingAsync(true).catch(() => {});
  } else if (previewAppForeground && !wasForeground) {
    // 포그라운드 복귀: 네이티브 루핑 해제 + 크로스페이드 모니터 재설정
    if (currentSound && currentSoundId) {
      const soundId = currentSoundId;
      const sound = currentSound;
      sound.setIsLoopingAsync(false).then(() => {
        if (currentSound === sound && currentSoundId === soundId) {
          setupPreviewCrossfadeMonitor(soundId, sound);
        }
      }).catch(() => {});
    }
  }
});
