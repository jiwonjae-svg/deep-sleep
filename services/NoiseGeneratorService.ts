/**
 * NoiseGeneratorService — 실시간 핑크/브라운 노이즈 WAV 생성
 *
 * JavaScript로 PCM 샘플을 생성한 후 WAV 형식으로 캐시 디렉토리에 저장.
 * expo-av는 파일 URI로 재생하며, 30초 길이의 루프 가능 WAV를 생성.
 *
 * 알고리즘:
 * - 핑크 노이즈: Paul Kellet 근사법 (1/f 스펙트럼)
 * - 브라운 노이즈: 랜덤 워크 적분 (Brownian motion)
 */

import { File, Paths } from 'expo-file-system';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const SAMPLE_RATE = 44100;
const DURATION_SEC = 30; // 30초 루프
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;

type NoiseType = 'pink-noise' | 'brown-noise';

// 캐시된 파일 URI
const cachedUris = new Map<string, string>();

// ──────────────────────────────────────────────
// WAV header generation
// ──────────────────────────────────────────────

function createWavHeader(dataSize: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);           // sub-chunk size (PCM)
  view.setUint16(20, 1, true);            // audio format (PCM)
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  return new Uint8Array(header);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ──────────────────────────────────────────────
// Noise generation algorithms
// ──────────────────────────────────────────────

/**
 * 핑크 노이즈 생성 — Paul Kellet 근사법
 * 6개 상태 변수를 사용한 1/f 필터
 */
function generatePinkNoise(): Int16Array {
  const samples = new Int16Array(TOTAL_SAMPLES);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;

    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;

    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;

    // 정규화 (-1 ~ 1 범위, 피크 약 ±3.5)
    const normalized = pink / 3.5;
    const clamped = Math.max(-1, Math.min(1, normalized));
    samples[i] = clamped * 32767;
  }

  return samples;
}

/**
 * 브라운 노이즈 생성 — 랜덤 워크 적분 (Brownian motion)
 * 화이트 노이즈를 적분하여 저주파 강조 스펙트럼 생성
 */
function generateBrownNoise(): Int16Array {
  const samples = new Int16Array(TOTAL_SAMPLES);

  let lastValue = 0;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    lastValue += white * 0.02;

    // -1 ~ 1 범위로 클램핑
    if (lastValue > 1) lastValue = 1;
    if (lastValue < -1) lastValue = -1;

    samples[i] = lastValue * 32767;
  }

  return samples;
}

// ──────────────────────────────────────────────
// WAV file creation
// ──────────────────────────────────────────────

function samplesToWavBytes(samples: Int16Array): Uint8Array {
  const dataSize = samples.length * 2; // 16-bit = 2 bytes
  const header = createWavHeader(dataSize);

  const wav = new Uint8Array(44 + dataSize);
  wav.set(header, 0);

  // Int16Array → Uint8Array (little-endian)
  const dataView = new DataView(wav.buffer, 44);
  for (let i = 0; i < samples.length; i++) {
    dataView.setInt16(i * 2, samples[i], true);
  }

  return wav;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * 노이즈 WAV 파일을 생성하고 캐시 디렉토리에 저장 → 파일 URI 반환.
 * 이미 캐시된 경우 기존 URI을 즉시 반환.
 */
export async function getNoiseFileUri(type: NoiseType): Promise<string | null> {
  // 캐시 확인
  const cached = cachedUris.get(type);
  if (cached) {
    const file = new File(cached);
    if (file.exists) return cached;
  }

  try {
    // PCM 샘플 생성
    const samples = type === 'pink-noise'
      ? generatePinkNoise()
      : generateBrownNoise();

    // WAV 바이트 배열 생성
    const wavBytes = samplesToWavBytes(samples);

    // 캐시 디렉토리에 저장
    const fileName = `${type}-generated.wav`;
    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(wavBytes);

    cachedUris.set(type, file.uri);
    return file.uri;
  } catch {
    return null;
  }
}

/** 노이즈 타입인지 확인 */
export function isGeneratedNoise(soundId: string): boolean {
  return soundId === 'pink-noise' || soundId === 'brown-noise';
}

/** 캐시된 노이즈 파일 삭제 */
export async function clearNoiseCache(): Promise<void> {
  for (const [, uri] of cachedUris) {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {}
  }
  cachedUris.clear();
}
