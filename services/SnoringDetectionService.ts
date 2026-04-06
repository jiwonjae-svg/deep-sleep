/**
 * SnoringDetectionService — 코골이 감지 서비스
 *
 * 마이크 입력을 분석하여 코골이 이벤트를 감지합니다.
 * Phase 1: dB 임계치 기반 단순 감지 (ML 모델 없이)
 * - 사운드 재생 종료 후(타이머 만료) 자동 시작을 기본 모드로 사용
 * - 모든 분석은 100% 로컬 처리, 원본 오디오 전송 없음
 */

import { Audio } from 'expo-av';
import { useSleepStore } from '@/stores/useSleepStore';
import { SnoringEvent, SnoringIntensity } from '@/types';

// ─── Constants ───────────────────────────────────
const CHECK_INTERVAL_MS = 5_000; // 5초마다 체크
const SNORING_DB_THRESHOLD = -35; // dB 이상이면 소리 감지
const SNORING_SUSTAINED_CHECKS = 3; // 연속 3회(15초) 이상이면 코골이로 판정
const HEAVY_DB = -20;
const MODERATE_DB = -28;

// ─── State ───────────────────────────────────────
let recording: Audio.Recording | null = null;
let checkInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

// 버퍼: 연속 소리 감지 추적
let consecutiveDetections = 0;
let eventStartTime: number | null = null;
let peakDbInEvent = -Infinity;
let dbSamples: number[] = [];

function classifyIntensity(peakDb: number): SnoringIntensity {
  if (peakDb >= HEAVY_DB) return 'heavy';
  if (peakDb >= MODERATE_DB) return 'moderate';
  return 'light';
}

function flushEvent(): void {
  if (!eventStartTime || consecutiveDetections < SNORING_SUSTAINED_CHECKS) {
    resetBuffer();
    return;
  }

  const durationSec = Math.round((Date.now() - eventStartTime) / 1000);
  if (durationSec < 10) {
    resetBuffer();
    return;
  }

  const event: SnoringEvent = {
    timestamp: eventStartTime,
    durationSec,
    intensity: classifyIntensity(peakDbInEvent),
    peakDb: Math.round(peakDbInEvent),
  };

  useSleepStore.getState().addSnoringEvent(event);
  resetBuffer();
}

function resetBuffer(): void {
  consecutiveDetections = 0;
  eventStartTime = null;
  peakDbInEvent = -Infinity;
  dbSamples = [];
}

async function checkMeeting(): Promise<void> {
  if (!recording) return;

  try {
    const status = await recording.getStatusAsync();
    if (!status.isRecording || status.metering === undefined) return;

    const db = status.metering; // dB value (negative, higher = louder)

    if (db >= SNORING_DB_THRESHOLD) {
      consecutiveDetections++;
      if (!eventStartTime) {
        eventStartTime = Date.now();
      }
      if (db > peakDbInEvent) {
        peakDbInEvent = db;
      }
      dbSamples.push(db);
    } else {
      // 소리 끊김 → 기존 이벤트 플러시
      if (consecutiveDetections >= SNORING_SUSTAINED_CHECKS) {
        flushEvent();
      } else {
        resetBuffer();
      }
    }
  } catch {
    // metering error — ignore
  }
}

export async function startSnoringDetection(): Promise<boolean> {
  if (isRunning) return true;

  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return false;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: rec } = await Audio.Recording.createAsync({
      ...Audio.RecordingOptionsPresets.LOW_QUALITY,
      isMeteringEnabled: true,
    });
    recording = rec;
    isRunning = true;

    resetBuffer();

    checkInterval = setInterval(checkMeeting, CHECK_INTERVAL_MS);

    return true;
  } catch {
    return false;
  }
}

export async function stopSnoringDetection(): Promise<void> {
  isRunning = false;

  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // 남은 이벤트 플러시
  if (consecutiveDetections >= SNORING_SUSTAINED_CHECKS) {
    flushEvent();
  }

  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // already stopped
    }
    recording = null;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  }).catch(() => {});
}

export function isSnoringDetectionActive(): boolean {
  return isRunning;
}
