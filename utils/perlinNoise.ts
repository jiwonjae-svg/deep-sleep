/**
 * Perlin Noise 1D 구현.
 * 소리 음량의 자연스러운 변화를 위해 사용.
 */

// Permutation table (256) – 고정 시드
const P: number[] = [];
const PERM: number[] = [];

function initPermutation() {
  for (let i = 0; i < 256; i++) P[i] = i;
  // Fisher-Yates shuffle with fixed seed
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [P[i], P[j]] = [P[j], P[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = P[i & 255];
}

initPermutation();

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad1d(hash: number, x: number): number {
  return (hash & 1) === 0 ? x : -x;
}

/**
 * 1D Perlin noise.  -1 ~ 1 범위의 값을 반환.
 */
export function perlin1d(x: number): number {
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = fade(xf);
  const a = PERM[xi];
  const b = PERM[xi + 1];
  return lerp(grad1d(a, xf), grad1d(b, xf - 1), u);
}

/**
 * 주어진 volumeMin/volumeMax 범위 내에서 Perlin noise 기반 음량 값을 생성.
 *
 * @param time      현재 시간 (초 단위, 보통 Date.now()/1000)
 * @param seed      소리마다 고유한 seed 값 (동시 재생 시 패턴 분리)
 * @param speed     변화 속도: 'slow'=0.003, 'medium'=0.006, 'fast'=0.012
 * @param volumeMin 최소 음량 (0–100)
 * @param volumeMax 최대 음량 (0–100)
 * @returns         0–1 범위의 정규화된 볼륨 (Audio.Sound의 volume으로 직접 사용)
 */
export function getPerlinVolume(
  time: number,
  seed: number,
  speed: 'slow' | 'medium' | 'fast',
  volumeMin: number,
  volumeMax: number,
): number {
  const freq = speed === 'slow' ? 0.003 : speed === 'fast' ? 0.012 : 0.006;
  const noise = perlin1d(time * freq + seed * 100); // -1 ~ 1
  const normalized = (noise + 1) / 2; // 0 ~ 1
  const volume = volumeMin + normalized * (volumeMax - volumeMin); // min ~ max
  return Math.max(0, Math.min(100, volume)) / 100; // 0 ~ 1
}
