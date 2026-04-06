/**
 * 사운드 에셋 정적 require() 맵 — 배리언트 지원.
 * Metro 번들러는 동적 require()를 지원하지 않으므로,
 * 각 사운드 파일을 정적으로 참조해야 합니다.
 *
 * 같은 종류의 소리는 배리언트 배열로 관리하며,
 * 재생 시 랜덤하게 선택됩니다.
 */

import { AVPlaybackSource } from 'expo-av';

/** 기본 사운드 ID → 배리언트 에셋 배열 */
const soundVariants: Record<string, AVPlaybackSource[]> = {
  // 연속 재생 — 배리언트
  'campfire': [
    require('@/assets/sounds/campfire-1.mp3'),
    require('@/assets/sounds/campfire-2.mp3'),
    require('@/assets/sounds/campfire-3.mp3'),
  ],
  'wave-gentle': [
    require('@/assets/sounds/wave-gentle-1.mp3'),
    require('@/assets/sounds/wave-gentle-2.mp3'),
    require('@/assets/sounds/wave-gentle-3.mp3'),
  ],
  'wind-gentle': [
    require('@/assets/sounds/wind-gentle-1.mp3'),
    require('@/assets/sounds/wind-gentle-2.mp3'),
  ],
  'birds-morning': [
    require('@/assets/sounds/birds-morning-1.mp3'),
  ],
  'crickets': [
    require('@/assets/sounds/crickets-1.mp3'),
  ],
  'fireplace': [
    require('@/assets/sounds/fireplace-1.mp3'),
  ],

  // 간헐적 재생
  'thunder': [
    require('@/assets/sounds/thunder-1.mp3'),
  ],

  // 단일 배리언트
  'cafe-chatter': [
    require('@/assets/sounds/cafe-chatter-1.mp3'),
  ],
  'white-noise': [
    require('@/assets/sounds/white-noise-1.mp3'),
  ],
  'singing-bowl': [
    require('@/assets/sounds/singing-bowl-1.mp3'),
  ],

  // 차 안 빗소리 — 5개 배리언트 (15분 원본 분할)
  'rain-car': [
    require('@/assets/sounds/rain-car-1.mp3'),
    require('@/assets/sounds/rain-car-2.mp3'),
    require('@/assets/sounds/rain-car-3.mp3'),
    require('@/assets/sounds/rain-car-4.mp3'),
    require('@/assets/sounds/rain-car-5.mp3'),
  ],

  // 빗소리 — 3개 배리언트 (10분 원본 분할)
  'rain-light': [
    require('@/assets/sounds/rain-light-1.mp3'),
    require('@/assets/sounds/rain-light-2.mp3'),
    require('@/assets/sounds/rain-light-3.mp3'),
  ],
};

/** 랜덤 배리언트 에셋 반환 */
export function getSoundAsset(soundId: string): AVPlaybackSource | null {
  const variants = soundVariants[soundId];
  if (!variants || variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}

/** 모든 배리언트 에셋 배열 반환 (크로스페이드 루핑용) */
export function getSoundVariants(soundId: string): AVPlaybackSource[] {
  return soundVariants[soundId] ?? [];
}

/** 배리언트 개수 반환 */
export function getVariantCount(soundId: string): number {
  return soundVariants[soundId]?.length ?? 0;
}
