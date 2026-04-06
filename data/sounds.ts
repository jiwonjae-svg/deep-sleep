import { SoundConfig } from '@/types';

/**
 * v1.0 초기 릴리즈 소리 메타데이터 (14개).
 * 배리언트 시스템: 같은 종류의 소리는 soundAssets.ts에서 배리언트 배열로 관리.
 * 파일명은 assets/sounds/ 아래에 위치한다고 가정.
 * isPremium=true 인 소리는 ★ 유료 전용.
 */
export const sounds: SoundConfig[] = [
  // ──────────────────────────────────────────────
  // 무료 소리 (10개)
  // ──────────────────────────────────────────────
  { id: 'thunder', name: '천둥번개', category: 'rain-water', type: 'intermittent', isPremium: false, iconEmoji: '⛈️', fileName: 'thunder-1.mp3' },
  { id: 'wave-gentle', name: '잔잔한 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-gentle-1.mp3' },
  { id: 'wind-gentle', name: '부드러운 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍃', fileName: 'wind-gentle-1.mp3' },
  { id: 'birds-morning', name: '새소리 (아침)', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐦', fileName: 'birds-morning-1.mp3' },
  { id: 'crickets', name: '귀뚜라미', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🦗', fileName: 'crickets-1.mp3' },
  { id: 'campfire', name: '모닥불', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🔥', fileName: 'campfire-1.mp3' },
  { id: 'fireplace', name: '벽난로', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🏠', fileName: 'fireplace-1.mp3' },
  { id: 'cafe-chatter', name: '카페 잡담', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '☕', fileName: 'cafe-chatter-1.mp3' },
  { id: 'white-noise', name: '화이트 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '📻', fileName: 'white-noise-1.mp3' },
  { id: 'rain-car', name: '차 안 비소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🚗', fileName: 'rain-car-1.mp3' },

  // ──────────────────────────────────────────────
  // 유료(★) 소리 (4개) — 아직 파일 없는 소리 포함
  // ──────────────────────────────────────────────
  { id: 'owl', name: '올빼미', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🦉', fileName: 'owl.mp3' },

  { id: 'jazz-piano', name: '재즈 피아노', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎹', fileName: 'jazz-piano.mp3' },
  { id: 'cat-purr', name: '고양이 골골송', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🐱', fileName: 'cat-purr.mp3' },
];

export function getSoundById(id: string): SoundConfig | undefined {
  return sounds.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): SoundConfig[] {
  return sounds.filter((s) => s.category === category);
}

/** 모든 유효한 soundId 집합 (AI 응답 검증용) */
export const validSoundIds = new Set(sounds.map((s) => s.id));
