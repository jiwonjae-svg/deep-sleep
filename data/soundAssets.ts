/**
 * 사운드 에셋 정적 require() 맵.
 * Metro 번들러는 동적 require()를 지원하지 않으므로,
 * 각 사운드 파일을 정적으로 참조해야 합니다.
 */

import { AVPlaybackSource } from 'expo-av';

const soundAssets: Record<string, AVPlaybackSource> = {
  'rain-light': require('@/assets/sounds/rain-light.mp3'),
  'thunder': require('@/assets/sounds/thunder.mp3'),
  'wave-gentle': require('@/assets/sounds/wave-gentle.mp3'),
  'wind-gentle': require('@/assets/sounds/wind-gentle.mp3'),
  'birds-morning': require('@/assets/sounds/birds-morning.mp3'),
  'crickets': require('@/assets/sounds/crickets.mp3'),
  'campfire': require('@/assets/sounds/campfire.mp3'),
  'fireplace': require('@/assets/sounds/fireplace.mp3'),
  'cafe-chatter': require('@/assets/sounds/cafe-chatter.mp3'),
  'white-noise': require('@/assets/sounds/white-noise.mp3'),
  'rain-car': require('@/assets/sounds/rain-car.mp3'),
  'singing-bowl': require('@/assets/sounds/singing-bowl.mp3'),
  // 아직 파일 없는 프리미엄 소리는 추가 시 여기에 등록
  // 'owl': require('@/assets/sounds/owl.mp3'),
  // 'jazz-piano': require('@/assets/sounds/jazz-piano.mp3'),
  // 'cat-purr': require('@/assets/sounds/cat-purr.mp3'),
};

export function getSoundAsset(soundId: string): AVPlaybackSource | null {
  return soundAssets[soundId] ?? null;
}
