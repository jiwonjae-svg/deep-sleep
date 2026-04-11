import { Audio, AVPlaybackStatus } from 'expo-av';
import { AppState } from 'react-native';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { getPerlinVolume } from '@/utils/perlinNoise';
import { getSoundById } from '@/data/sounds';
import { getSoundAsset, getVariantCount } from '@/data/soundAssets';
import { ActiveSoundState, Frequency } from '@/types';
import { TIMER_FADEOUT_DURATION } from '@/utils/constants';
import { useSleepStore } from '@/stores/useSleepStore';
import { startSleepTracking, stopSleepTracking, isTrackingActive } from '@/services/SleepTrackingService';
import { isGeneratedNoise, getNoiseFileUri } from '@/services/NoiseGeneratorService';

// ──────────────────────────────────────────────
// Sound instance tracking
// ──────────────────────────────────────────────

const soundPool = new Map<string, Audio.Sound>();
const frequencyTimers = new Map<string, ReturnType<typeof setTimeout>>();
const soundSeeds = new Map<string, number>();

// 크로스페이드 루핑 관련
const crossfadeInProgress = new Set<string>();
const crossfadeOutSounds: Audio.Sound[] = []; // 페이드아웃 중인 이전 인스턴스

let seedCounter = 0;

// 메인 재생 일시정지 (프리뷰용)
let isPausedForPreview = false;

// ──────────────────────────────────────────────
// Unified master volume loop + fade
// 단일 루프가 페르린 노이즈 볼륨 + 페이드를 모두 처리
// ──────────────────────────────────────────────

let fadeFactor = 1.0;
const FADE_IN_MS = 750;
const FADE_OUT_MS = 750;
const MASTER_LOOP_MS = 50; // 20fps — 페이드 + 볼륨 동시 처리
const CROSSFADE_MS = 2000;
const CROSSFADE_TRIGGER_MS = 3500; // 크로스페이드 프로세스 시작 시점 (createAsync 지연 + 크로스페이드 듀레이션 포함)
const CROSSFADE_STEP_MS = 50; // 배리언트 크로스페이드 스텝

// 페이드 상태
let fadeState: 'in' | 'out' | 'none' = 'none';
let fadeStartTime = 0;
let fadeDurationMs = 0;
let fadeStartValue = 0;
let fadeResolve: (() => void) | null = null;

// 마스터 볼륨 루프
let masterLoopInterval: ReturnType<typeof setInterval> | null = null;

// 시스템 정지 플래그 + 크로스페이드 타이머 추적
let isSystemStopping = false;
// 앱 포그라운드 상태 추적
let isAppForeground = AppState.currentState === 'active';
const crossfadeTimerMap = new Map<string, ReturnType<typeof setInterval>>();
// startMix/stopAll 세대 카운터: 이전 비동기 작업 무효화
let mixGeneration = 0;

// 백그라운드 안전 폴링 카운터 (2초마다 실행)
let bgSafetyCounter = 0;
const BG_SAFETY_INTERVAL = 40; // 40 × 50ms = 2초

// 타이머 체크 카운터 (마스터루프 통합 — 백그라운드에서도 작동)
let timerCheckCounter = 0;
const TIMER_CHECK_INTERVAL = 20; // 20 × 50ms = 1초
let timerExpiryHandled = false;

/** 마스터 볼륨 루프 시작 — 페이드 + 페르린 볼륨을 단일 인터벌로 처리 */
function startMasterLoop(): void {
  stopMasterLoop();
  bgSafetyCounter = 0;
  timerCheckCounter = 0;
  timerExpiryHandled = false;
  masterLoopInterval = setInterval(() => {
    // 1) 페이드 상태에 따라 fadeFactor 갱신
    if (fadeState === 'in') {
      const elapsed = Date.now() - fadeStartTime;
      fadeFactor = Math.min(1, elapsed / fadeDurationMs);
      if (fadeFactor >= 1) {
        fadeFactor = 1;
        fadeState = 'none';
      }
    } else if (fadeState === 'out') {
      const elapsed = Date.now() - fadeStartTime;
      fadeFactor = Math.max(0, fadeStartValue * (1 - elapsed / fadeDurationMs));
      if (fadeFactor <= 0) {
        fadeFactor = 0;
        fadeState = 'none';
        if (fadeResolve) { fadeResolve(); fadeResolve = null; }
      }
    }

    // 2) 백그라운드 안전장치: 2초마다 소리 상태 폴링
    bgSafetyCounter++;
    if (bgSafetyCounter >= BG_SAFETY_INTERVAL) {
      bgSafetyCounter = 0;
      checkBackgroundSoundHealth();
    }

    // 3-b) 타이머 만료 체크: 1초마다 (마스터 루프 통합 — 백그라운드에서도 동작)
    timerCheckCounter++;
    if (timerCheckCounter >= TIMER_CHECK_INTERVAL) {
      timerCheckCounter = 0;
      checkTimerExpiry();
    }

    // 4) 모든 사운드에 볼륨 적용 (페르린 노이즈 × masterVolume × fadeFactor × crossfade)
    // 페이드아웃 중(fadeState='out')에는 볼륨 적용 유지 (자연스러운 감소)
    // 페이드아웃 완료 후 정리 단계에서는 cleanupSoundPool→stopMasterLoop으로 루프 자체가 정지됨
    const store = useAudioStore.getState();
    const masterVol = store.masterVolume / 100;
    const speed = useSettingsStore.getState().settings.volumeChangeSpeed;

    for (const [soundId, sound] of soundPool) {
      const state = store.activeSounds.get(soundId) ?? store.presetSounds.get(soundId);
      if (!state) continue;

      const seed = soundSeeds.get(soundId) ?? 0;
      const cf = soundCrossfadeFactor.get(soundId) ?? 1;
      const vol = getPerlinVolume(Date.now() / 1000, seed, speed, state.volumeMin, state.volumeMax);
      sound.setVolumeAsync(vol * masterVol * fadeFactor * cf).catch(() => {});
    }
  }, MASTER_LOOP_MS);
}

/** 백그라운드 안전장치: 연속 재생 소리가 끝났거나 끝나기 직전인지 폴링 */
function checkBackgroundSoundHealth(): void {
  if (isSystemStopping) return;
  for (const [soundId, sound] of soundPool) {
    if (crossfadeInProgress.has(soundId)) continue;
    // 실시간 노이즈는 네이티브 루핑 — 크로스페이드 불필요
    if (isGeneratedNoise(soundId)) continue;
    const meta = getSoundById(soundId);
    if (!meta || meta.type !== 'continuous') continue;

    sound.getStatusAsync().then((status) => {
      if (isSystemStopping) return;
      if (!('isLoaded' in status) || !status.isLoaded) return;
      if (crossfadeInProgress.has(soundId)) return;

      // 소리가 끝났거나 (didJustFinish) 재생 중이 아닌데 이미 위치가 진행된 경우
      const stoppedUnexpectedly = !status.isPlaying && !status.isBuffering && status.positionMillis > 0;
      const aboutToFinish = status.isPlaying && status.durationMillis &&
        status.durationMillis > 0 && (status.durationMillis - status.positionMillis) <= CROSSFADE_TRIGGER_MS;

      if (status.didJustFinish || stoppedUnexpectedly || aboutToFinish) {
        crossfadeInProgress.add(soundId);
        performVariantCrossfade(soundId, sound).catch(() => {
          crossfadeInProgress.delete(soundId);
        });
      }
    }).catch(() => {});
  }
}

function stopMasterLoop(): void {
  if (masterLoopInterval) {
    clearInterval(masterLoopInterval);
    masterLoopInterval = null;
  }
  // 미완료 페이드 resolve 처리
  if (fadeResolve) { fadeResolve(); fadeResolve = null; }
  fadeState = 'none';
}

function fadeIn(durationMs: number = FADE_IN_MS): void {
  fadeFactor = 0;
  fadeState = 'in';
  fadeStartTime = Date.now();
  fadeDurationMs = durationMs;
}

function fadeOut(durationMs: number = FADE_OUT_MS): Promise<void> {
  return new Promise((resolve) => {
    if (fadeFactor <= 0) { resolve(); return; }
    fadeStartValue = fadeFactor;
    fadeState = 'out';
    fadeStartTime = Date.now();
    fadeDurationMs = durationMs;
    fadeResolve = resolve;
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

  // 오디오 파이프라인 웜업: 첫 createAsync 콜드 스타트 지연 제거
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=' },
      { shouldPlay: false, volume: 0 },
    );
    await sound.unloadAsync();
  } catch {}
}

// ──────────────────────────────────────────────
// Sound loading / unloading
// ──────────────────────────────────────────────

async function loadSound(soundId: string): Promise<Audio.Sound | null> {
  if (soundPool.has(soundId)) return soundPool.get(soundId)!;

  const meta = getSoundById(soundId);
  if (!meta) return null;

  try {
    // 실시간 생성 노이즈 (핑크/브라운) vs 파일 기반 소리
    let source: { uri: string } | number | null = null;
    if (isGeneratedNoise(soundId)) {
      const uri = await getNoiseFileUri(soundId as 'pink-noise' | 'brown-noise');
      if (!uri) return null;
      source = { uri };
    } else {
      source = getSoundAsset(soundId); // 랜덤 배리언트
      if (!source) return null;
    }

    // 연속 재생 소리: 백그라운드에서도 끊기지 않도록 isLooping 설정
    const shouldLoop = meta.type === 'continuous';
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: false, isLooping: shouldLoop, volume: 0 },
    );
    soundPool.set(soundId, sound);

    if (!soundSeeds.has(soundId)) {
      soundSeeds.set(soundId, ++seedCounter);
    }

    // 실시간 노이즈: 단일 파일 루핑 (배리언트 크로스페이드 불필요)
    if (isGeneratedNoise(soundId)) return sound;

    // 연속 재생 소리: 배리언트가 2개 이상일 때만 크로스페이드 사용
    // 단일 배리언트는 네이티브 루핑이 더 끊김 없이 자연스럽다
    const variantCount = getVariantCount(soundId);
    if (meta.type === 'continuous' && isAppForeground && variantCount >= 2) {
      await sound.setIsLoopingAsync(false);
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
    if (isSystemStopping) return;
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

    // 끝나기 CROSSFADE_TRIGGER_MS 전에 크로스페이드 시작 (createAsync 지연 포함)
    if (duration > 0 && remaining <= CROSSFADE_TRIGGER_MS && remaining > 0) {
      crossfadeInProgress.add(soundId);
      performVariantCrossfade(soundId, sound).catch(() => {
        crossfadeInProgress.delete(soundId);
      });
    }
  });
}

/** 배리언트 크로스페이드: 현재 소리 페이드아웃 + 새 배리언트 페이드인 */
async function performVariantCrossfade(soundId: string, oldSound: Audio.Sound) {
  if (isSystemStopping) { crossfadeInProgress.delete(soundId); return; }
  // 실시간 노이즈는 네이티브 루핑 사용 — 크로스페이드 불필요
  if (isGeneratedNoise(soundId)) { crossfadeInProgress.delete(soundId); return; }
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
    const steps = CROSSFADE_MS / CROSSFADE_STEP_MS;
    const increment = 1 / steps;
    let step = 0;

    // 기존 크로스페이드 타이머 정리
    const prevTimer = crossfadeTimerMap.get(soundId);
    if (prevTimer) clearInterval(prevTimer);

    const crossfadeTimer = setInterval(async () => {
      if (isSystemStopping) {
        clearInterval(crossfadeTimer);
        crossfadeTimerMap.delete(soundId);
        return;
      }
      step++;
      const factor = Math.min(1, step * increment);
      soundCrossfadeFactor.set(soundId, factor);

      // 이전 소리 볼륨 감소 (마스터 루프의 현재 볼륨 기준)
      const store = useAudioStore.getState();
      const mv = store.masterVolume / 100;
      const st = store.activeSounds.get(soundId) ?? store.presetSounds.get(soundId);
      const baseVol = st ? ((st.volumeMin + st.volumeMax) / 2 / 100) * mv * fadeFactor : 0.5;
      try {
        await oldSound.setVolumeAsync(Math.max(0, (1 - factor) * baseVol));
      } catch {}

      if (step >= steps) {
        clearInterval(crossfadeTimer);
        crossfadeTimerMap.delete(soundId);
        soundCrossfadeFactor.set(soundId, 1);
        crossfadeInProgress.delete(soundId);

        // 이전 소리 정리
        try { await oldSound.stopAsync(); } catch {}
        try { await oldSound.unloadAsync(); } catch {}
      }
    }, CROSSFADE_STEP_MS);

    crossfadeTimerMap.set(soundId, crossfadeTimer);
    // 이전 소리를 추적 (정리 시 사용)
    crossfadeOutSounds.push(oldSound);
  } catch {
    crossfadeInProgress.delete(soundId);
  }
}

async function unloadSound(soundId: string): Promise<void> {
  const sound = soundPool.get(soundId);
  if (!sound) return;

  clearFrequencyTimer(soundId);
  crossfadeInProgress.delete(soundId);
  soundCrossfadeFactor.delete(soundId);

  // 크로스페이드 타이머 정리
  const cfTimer = crossfadeTimerMap.get(soundId);
  if (cfTimer) { clearInterval(cfTimer); crossfadeTimerMap.delete(soundId); }

  // 콜백 제거 (정리 중 크로스페이드 트리거 방지)
  try { sound.setOnPlaybackStatusUpdate(null); } catch {}

  try { await sound.stopAsync(); } catch {}
  try { await sound.unloadAsync(); } catch {}
  soundPool.delete(soundId);
}

/** 사운드 풀 전체 정리 (orphaned 인스턴스 포함) */
async function cleanupSoundPool(): Promise<void> {
  // 마스터 루프 정지
  stopMasterLoop();

  // 모든 크로스페이드 타이머 선제 정리
  for (const [, timer] of crossfadeTimerMap) {
    clearInterval(timer);
  }
  crossfadeTimerMap.clear();
  crossfadeInProgress.clear();

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
  const gen = ++mixGeneration;
  isSystemStopping = false;
  await cleanupSoundPool();
  if (gen !== mixGeneration) return; // 다른 startMix/stopAll이 호출됨
  isPausedForPreview = false;

  // 프리뷰 재생 중이면 즉시 정지 (순환 의존 회피를 위해 lazy require)
  const { stopPreview: stopSoundPreview } = require('@/services/SoundPreview');
  stopSoundPreview();

  const store = useAudioStore.getState();
  // 프리셋 소리 + 믹서 소리 모두 재생 (중복 시 프리셋 설정 우선)
  const merged = new Map<string, ActiveSoundState>();
  for (const [id, state] of store.activeSounds) merged.set(id, state);
  for (const [id, state] of store.presetSounds) merged.set(id, state);
  const entries = Array.from(merged.values());

  if (entries.length === 0) return;

  // fadeFactor = 0 으로 시작 → 마스터 루프가 모든 사운드 볼륨을 0부터 시작
  fadeFactor = 0;

  // 모든 사운드 병렬 로드 (첫 재생 지연 최소화)
  const loadResults = await Promise.all(
    entries.map(async (state) => {
      const sound = await loadSound(state.soundId);
      if (!sound) return null;
      const meta = getSoundById(state.soundId);
      if (!meta) return null;
      return { state, sound, meta };
    }),
  );

  // 로드 중 다른 startMix/stopAll이 호출되었으면 중단
  if (gen !== mixGeneration) return;

  for (const result of loadResults) {
    if (!result) continue;
    if (gen !== mixGeneration) return;
    const { state, sound, meta } = result;

    try {
      await sound.setVolumeAsync(0);
    } catch { continue; }
    if (gen !== mixGeneration) return;

    soundCrossfadeFactor.set(state.soundId, 1);
    try {
      await sound.playAsync();
    } catch { continue; }
    if (gen !== mixGeneration) return;

    // 간헐적 소리는 별도 스케줄링
    if (meta.type === 'intermittent') {
      scheduleIntermittent(state.soundId);
    }
  }

  if (gen !== mixGeneration) return;

  // 마스터 루프 시작 (페르린 볼륨 + 페이드 + 타이머 체크를 단일 인터벌로 처리)
  startMasterLoop();
  fadeIn(FADE_IN_MS);
  store.setPlaying(true);

  const timer = useTimerStore.getState();
  const autoTrack = useSettingsStore.getState().settings.autoSleepTracking;
  if (autoTrack && timer.isActive && !isTrackingActive()) {
    const soundIds = Array.from(store.activeSounds.keys());
    startSleepTracking(soundIds).catch(() => {});
  }
}

/** 정지: UI 즉시 반영, 리니어 페이드아웃 후 비동기 정리.
 *  연타 시 startMix()가 stopCleanupCancelled를 설정하여 잔류 정리를 취소.
 *  cleanupSoundPool()은 내부에서 stopMasterLoop()을 동기적으로 호출하므로
 *  마스터 루프와 사운드 언로드 간 레이스 컨디션 없음. */
export function stopAll(): void {
  const gen = ++mixGeneration;
  isSystemStopping = true;

  // 타이머 잔여 시간 스냅샷 저장 후 타이머 취소
  const timerState = useTimerStore.getState();
  if (timerState.isActive) {
    const remaining = Math.max(0, timerState.endTime - Date.now());
    timerState.saveSnapshot(remaining);
    timerState.cancelTimer();
  }

  // UI 즉시 업데이트
  const store = useAudioStore.getState();
  store.setPlaying(false);
  timerExpiryHandled = true; // 마스터 루프의 타이머 체크 비활성화

  // 리니어 페이드아웃 (마스터 루프 유지 — 볼륨 자연 감소)
  fadeOut(FADE_OUT_MS).then(() => {
    if (gen !== mixGeneration) return; // startMix()가 호출되어 무효화됨

    // 페이드아웃 완료: 즉시 음소거 후 정리
    fadeFactor = 0;
    for (const [, sound] of soundPool) {
      sound.setVolumeAsync(0).catch(() => {});
    }
    for (const old of crossfadeOutSounds) {
      old.setVolumeAsync(0).catch(() => {});
    }

    // cleanupSoundPool()이 내부에서 stopMasterLoop() 동기 호출 → 안전
    cleanupSoundPool()
      .then(() => {
        if (gen !== mixGeneration) return;
        useAudioStore.getState().clearPresetSounds();
        isSystemStopping = false;
      })
      .catch(() => {
        if (gen !== mixGeneration) return;
        useAudioStore.getState().clearPresetSounds();
        isSystemStopping = false;
      });
  });
}

/** 프리셋 적용 — 재생 중이면 크로스페이드 전환 */
export async function applyPreset(sounds: ActiveSoundState[], presetId: string): Promise<void> {
  const gen = ++mixGeneration;
  isSystemStopping = false;
  const store = useAudioStore.getState();
  const wasPlaying = store.isPlaying;

  if (wasPlaying) {
    // 크로스페이드 전환: 현재 소리 페이드아웃
    await fadeOut(FADE_OUT_MS);
    await cleanupSoundPool();
  }

  // 페이드/정리 중 stopAll() 또는 다른 applyPreset()이 호출됐으면 중단
  if (gen !== mixGeneration) return;

  // 프리셋 소리는 presetSounds에 설정 (activeSounds는 건드리지 않음)
  store.setPresetSounds(sounds);
  store.setActivePresetId(presetId);

  // 재생 시작 (페이드인 포함) — startMix 내부에서 gen 체크
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
// Timer check (마스터 루프 통합)
// ──────────────────────────────────────────────

/** 타이머 만료 체크 — 마스터 루프에서 1초마다 호출 (백그라운드에서도 동작) */
function checkTimerExpiry(): void {
  if (timerExpiryHandled || isSystemStopping) return;
  const timer = useTimerStore.getState();
  if (!timer.isActive) return;

  const remaining = timer.endTime - Date.now();
  if (remaining <= 0) {
    // 타이머 만료: 즉시 정지 (재진입 방지)
    timerExpiryHandled = true;
    ++mixGeneration; // 진행 중인 startMix/stopAll 무효화
    timer.saveSnapshot(0);
    timer.cancelTimer();
    fadeFactor = 0;
    fadeState = 'none';
    isSystemStopping = true;

    // 모든 소리 즉시 음소거
    for (const [, sound] of soundPool) {
      sound.setVolumeAsync(0).catch(() => {});
    }
    for (const old of crossfadeOutSounds) {
      old.setVolumeAsync(0).catch(() => {});
    }

    // 마스터 루프 즉시 정지 (정리 중 setVolumeAsync 호출 방지)
    stopMasterLoop();
    useAudioStore.getState().setPlaying(false);

    cleanupSoundPool()
      .then(async () => {
        useAudioStore.getState().clearPresetSounds();
        isSystemStopping = false;
        if (isTrackingActive()) {
          await stopSleepTracking();
        }
      })
      .catch(() => { isSystemStopping = false; });
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
}

/** CleanUp: 앱 종료 시 호출 */
export async function cleanupAudio(): Promise<void> {
  isSystemStopping = true;
  stopMasterLoop();
  await cleanupSoundPool();
  isSystemStopping = false;
  timerExpiryHandled = true;
  useAudioStore.getState().setPlaying(false);
  useAudioStore.getState().clearPresetSounds();
  soundSeeds.clear();
  seedCounter = 0;
}

// ──────────────────────────────────────────────
// 앱 포그라운드/백그라운드 전환 처리
// ──────────────────────────────────────────────

/** 백그라운드 진입 시: 연속 소리를 네이티브 루핑으로 전환 (JS 개입 없이 반복) */
async function enableNativeLooping(): Promise<void> {
  for (const [soundId, sound] of soundPool) {
    const meta = getSoundById(soundId);
    if (!meta || meta.type !== 'continuous') continue;
    try {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.setIsLoopingAsync(true);
    } catch {}
  }
  // 진행 중인 크로스페이드 타이머 정리
  for (const [, timer] of crossfadeTimerMap) clearInterval(timer);
  crossfadeTimerMap.clear();
  crossfadeInProgress.clear();
}

/** 포그라운드 복귀 시: 다중 배리언트만 네이티브 루핑 해제 → 크로스페이드 모니터 재설정 */
async function disableNativeLooping(): Promise<void> {
  for (const [soundId, sound] of soundPool) {
    const meta = getSoundById(soundId);
    if (!meta || meta.type !== 'continuous') continue;
    // 실시간 노이즈 및 단일 배리언트: 항상 네이티브 루핑 유지
    if (isGeneratedNoise(soundId)) continue;
    if (getVariantCount(soundId) < 2) continue;
    try {
      await sound.setIsLoopingAsync(false);
      setupCrossfadeMonitor(soundId, sound);
    } catch {}
  }
}

AppState.addEventListener('change', (nextState) => {
  const wasForeground = isAppForeground;
  isAppForeground = nextState === 'active';

  if (nextState !== 'active' && isSystemStopping) {
    ++mixGeneration; // 진행 중인 비동기 작업 무효화
    stopMasterLoop();
    fadeFactor = 0;
    for (const [, sound] of soundPool) {
      sound.setVolumeAsync(0).catch(() => {});
    }
    cleanupSoundPool()
      .then(() => {
        useAudioStore.getState().clearPresetSounds();
        isSystemStopping = false;
      })
      .catch(() => { isSystemStopping = false; });
    return;
  }

  // 재생 중일 때: 백그라운드 → 네이티브 루핑, 포그라운드 → 크로스페이드 모니터
  if (useAudioStore.getState().isPlaying && !isSystemStopping) {
    if (!isAppForeground && wasForeground) {
      enableNativeLooping();
    } else if (isAppForeground && !wasForeground) {
      disableNativeLooping();
    }
  }
});
