import { SoundConfig } from '@/types';

/**
 * v1.0 초기 릴리스 소리 메타데이터 (15개).
 * 전체 100개 소리 목록은 01-project-plan.md 3.1~3.10 참조.
 * 파일명은 assets/sounds/ 아래에 위치한다고 가정.
 * isPremium=true 인 소리는 ★ 유료 전용.
 */
export const sounds: SoundConfig[] = [
  // ──────────────────────────────────────────────
  // 무료 소리 (10개)
  // ──────────────────────────────────────────────
  { id: 'rain-light', name: '가벼운 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🌦️', fileName: 'rain-light.ogg' },
  { id: 'thunder', name: '천둥번개', category: 'rain-water', type: 'intermittent', isPremium: false, iconEmoji: '⛈️', fileName: 'thunder.ogg' },
  { id: 'wave-gentle', name: '잔잔한 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-gentle.ogg' },
  { id: 'wind-gentle', name: '부드러운 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍃', fileName: 'wind-gentle.ogg' },
  { id: 'birds-morning', name: '새소리 (아침)', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐦', fileName: 'birds-morning.ogg' },
  { id: 'crickets', name: '귀뚜라미', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🦗', fileName: 'crickets.ogg' },
  { id: 'campfire', name: '모닥불', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🔥', fileName: 'campfire.ogg' },
  { id: 'fireplace', name: '벽난로', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🏠', fileName: 'fireplace.ogg' },
  { id: 'cafe-chatter', name: '카페 잡담', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '☕', fileName: 'cafe-chatter.ogg' },
  { id: 'white-noise', name: '화이트 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '📻', fileName: 'white-noise.ogg' },

  // ──────────────────────────────────────────────
  // 유료(★) 소리 (5개)
  // ──────────────────────────────────────────────
  { id: 'rain-car', name: '차 안 빗소리', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🚗', fileName: 'rain-car.ogg' },
  { id: 'owl', name: '올빼미', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🦉', fileName: 'owl.ogg' },
  { id: 'singing-bowl', name: '싱잉볼', category: 'musical-tonal', type: 'intermittent', isPremium: true, iconEmoji: '🔔', fileName: 'singing-bowl.ogg' },
  { id: 'jazz-piano', name: '재즈 피아노', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎹', fileName: 'jazz-piano.ogg' },
  { id: 'cat-purr', name: '고양이 골골송', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🐱', fileName: 'cat-purr.ogg' },
];

export function getSoundById(id: string): SoundConfig | undefined {
  return sounds.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): SoundConfig[] {
  return sounds.filter((s) => s.category === category);
}

/** 모든 유효한 soundId 집합 (AI 응답 검증용) */
export const validSoundIds = new Set(sounds.map((s) => s.id));
