import { SoundConfig } from '@/types';

/**
 * v1.4 소리 메타데이터 (56개).
 * 배리언트 시스템: 같은 종류의 소리는 soundAssets.ts에서 배리언트 배열로 관리.
 * 파일명은 assets/sounds/ 아래에 위치한다고 가정.
 * isPremium=true 인 소리는 ★ 유료 전용.
 */
export const sounds: SoundConfig[] = [
  // ──────────────────────────────────────────────
  // 비 & 물 (Rain & Water) — 9개 (무료 7 / 유료 2)
  // ──────────────────────────────────────────────
  { id: 'rain-light', name: '가벼운 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🌧️', fileName: 'rain-light-1.mp3' },
  { id: 'rain-heavy', name: '폭우', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🌧️', fileName: 'rain-heavy-1.mp3' },
  { id: 'thunder', name: '천둥번개', category: 'rain-water', type: 'intermittent', isPremium: false, iconEmoji: '⛈️', fileName: 'thunder-1.mp3' },

  { id: 'rain-umbrella', name: '우산 위 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '☂️', fileName: 'rain-umbrella-1.mp3' },
  { id: 'rain-tent', name: '텐트 위 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '⛺', fileName: 'rain-tent-1.mp3' },
  { id: 'rain-car', name: '차 안 빗소리', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🚗', fileName: 'rain-car-1.mp3' },
  { id: 'stream', name: '시냇물', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🏞️', fileName: 'stream-1.mp3' },
  { id: 'waterfall', name: '폭포', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '💧', fileName: 'waterfall-1.mp3' },
  { id: 'fountain', name: '분수', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '⛲', fileName: 'fountain-1.mp3' },

  // ──────────────────────────────────────────────
  // 바다 & 해변 (Ocean & Beach) — 3개 (무료 2 / 유료 1)
  // ──────────────────────────────────────────────
  { id: 'wave-gentle', name: '잔잔한 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-gentle-1.mp3' },
  { id: 'wave-rough', name: '거친 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-rough-1.mp3' },  // wave-gentle-3.mp3 → wave-rough-1.mp3 재연결

  { id: 'whale', name: '고래 소리', category: 'ocean-beach', type: 'intermittent', isPremium: true, iconEmoji: '🐋', fileName: 'whale-1.mp3' },

  // ──────────────────────────────────────────────
  // 바람 & 날씨 (Wind & Weather) — 4개 (무료 4)
  // ──────────────────────────────────────────────
  { id: 'wind-gentle', name: '부드러운 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍃', fileName: 'wind-gentle-1.mp3' },
  { id: 'wind-strong', name: '강한 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '💨', fileName: 'wind-strong-1.mp3' },
  { id: 'leaves-rustle', name: '나뭇잎 바스락', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍂', fileName: 'leaves-rustle-1.mp3' },
  { id: 'hail', name: '우박', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🧊', fileName: 'hail-1.mp3' },

  // ──────────────────────────────────────────────
  // 숨 & 자연 (Forest & Nature) — 8개 (무료 7 / 유료 1)
  // ──────────────────────────────────────────────
  { id: 'birds-morning', name: '새소리 (아침)', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐦', fileName: 'birds-morning-1.mp3' },
  { id: 'cuckoo', name: '뻐꾸기', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🐦‍⬛', fileName: 'cuckoo-1.mp3' },
  { id: 'owl', name: '올빼미', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🦉', fileName: 'owl-1.mp3' },
  { id: 'crow', name: '까마귀', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🐦‍⬛', fileName: 'crow-1.mp3' },
  { id: 'crickets', name: '풀벌레', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🪲', fileName: 'crickets-1.mp3' },
  { id: 'frogs', name: '개구리', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐸', fileName: 'frogs-1.mp3' },
  { id: 'cicadas', name: '매미', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🪲', fileName: 'cicadas-1.mp3' },
  { id: 'wolf', name: '늑대 울음', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🐺', fileName: 'wolf-1.mp3' },

  // ──────────────────────────────────────────────
  // 불 & 따뜻함 (Fire & Warmth) — 3개 (무료 2 / 유료 1)
  // ──────────────────────────────────────────────
  { id: 'campfire', name: '모닥불', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🔥', fileName: 'campfire-1.mp3' },
  { id: 'fireplace', name: '벽난로', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🏠', fileName: 'fireplace-1.mp3' },
  { id: 'candle', name: '촛불', category: 'fire-warmth', type: 'continuous', isPremium: true, iconEmoji: '🕯️', fileName: 'candle-1.mp3' },


  // ──────────────────────────────────────────────
  // 실내 & 일상 (Indoor & Ambient) — 9개 (무료 7 / 유료 2)
  // ──────────────────────────────────────────────
  { id: 'air-conditioner', name: '에어컨', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '❄️', fileName: 'air-conditioner-1.mp3' },
  { id: 'fan', name: '선풍기', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🌀', fileName: 'fan-1.mp3' },
  { id: 'clock-tick', name: '시계 째깍', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🕰️', fileName: 'clock-tick-1.mp3' },
  { id: 'keyboard-typing', name: '키보드 타이핑', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '⌨️', fileName: 'keyboard-typing-1.mp3' },
  { id: 'cat-purr', name: '고양이 골골송', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🐱', fileName: 'cat-purr-1.mp3' },
  { id: 'fridge-hum', name: '냉장고 윙윙', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🧊', fileName: 'fridge-hum-1.mp3' },
  { id: 'washing-machine', name: '세탁기', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🫧', fileName: 'washing-machine-1.mp3' },
  { id: 'dryer', name: '건조기', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '💨', fileName: 'dryer-1.mp3' },
  { id: 'page-turning', name: '페이지 넘김', category: 'indoor-ambient', type: 'intermittent', isPremium: true, iconEmoji: '📖', fileName: 'page-turning-1.mp3' },

  // ──────────────────────────────────────────────
  // 도시 & 교통 (Urban & Transport) — 5개 (무료 3 / 유료 2)
  // ──────────────────────────────────────────────
  { id: 'traffic-distant', name: '먼 교통 소리', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '🚗', fileName: 'traffic-distant-1.mp3' },
  { id: 'train-rails', name: '기차 레일 소리', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '🚂', fileName: 'train-rails-1.mp3' },
  { id: 'cafe-chatter', name: '카페 잡담', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '☕', fileName: 'cafe-chatter-1.mp3' },
  { id: 'airplane-cabin', name: '비행기 내부', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '✈️', fileName: 'airplane-cabin-1.mp3' },

  { id: 'bus', name: '버스 내부', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '🚌', fileName: 'bus-1.mp3' },

  // ──────────────────────────────────────────────
  // 음악 & 톤 (Musical & Tonal) — 8개 (무료 5 / 유료 3)
  // ──────────────────────────────────────────────
  { id: 'white-noise', name: '화이트 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '📻', fileName: 'white-noise-1.mp3' },
  { id: 'pink-noise', name: '핑크 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '🩷', fileName: 'pink-noise-1.mp3' },
  { id: 'brown-noise', name: '브라운 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '🟤', fileName: 'brown-noise-1.mp3' },
  { id: 'binaural-beats', name: '바이노럴 비트', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🧠', fileName: 'binaural-beats-1.mp3' },
  { id: 'singing-bowl', name: '싱잉볼', category: 'musical-tonal', type: 'intermittent', isPremium: false, iconEmoji: '🔔', fileName: 'singing-bowl-1.mp3' },
  { id: 'wind-chime', name: '풍경 (윈드차임)', category: 'musical-tonal', type: 'intermittent', isPremium: true, iconEmoji: '🎐', fileName: 'wind-chime-1.mp3' },
  { id: 'music-box', name: '오르골', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎶', fileName: 'music-box-1.mp3' },
  { id: 'lofi-beats', name: '로파이 비트', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '🎧', fileName: 'lofi-beats-1.mp3' },

  // ──────────────────────────────────────────────
  // 특수 환경 (Special Environments) — 3개 (유료 3)
  // ──────────────────────────────────────────────
  { id: 'cave-echo', name: '동굴 반향', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '🦇', fileName: 'cave-echo-1.mp3' },
  { id: 'temple-bells', name: '사원 종소리', category: 'special-environments', type: 'intermittent', isPremium: true, iconEmoji: '🛕', fileName: 'temple-bells-1.mp3' },
  { id: 'hot-spring', name: '온천', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '♨️', fileName: 'hot-spring-1.mp3' },

  // ──────────────────────────────────────────────
  // ASMR — 2개 (유료 2)
  // ──────────────────────────────────────────────
  { id: 'whispering', name: '속삭임', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '🤫', fileName: 'whispering-1.mp3' },
  { id: 'hair-brushing', name: '헤어 브러싱', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '💇', fileName: 'hair-brushing-1.mp3' },

  // ──────────────────────────────────────────────
  // 계절 & 특별 (Seasonal & Special) — 2개 (유료 2)
  // ──────────────────────────────────────────────
  { id: 'cherry-blossom', name: '벚꽃 비', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '🌸', fileName: 'cherry-blossom-1.mp3' },
  { id: 'snow-walking', name: '눈 밟는 소리', category: 'seasonal-special', type: 'intermittent', isPremium: true, iconEmoji: '❄️', fileName: 'snow-walking-1.mp3' },
];

export function getSoundById(id: string): SoundConfig | undefined {
  return sounds.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): SoundConfig[] {
  return sounds.filter((s) => s.category === category);
}

/** 모든 유효한 soundId 집합 (AI 응답 검증용) */
export const validSoundIds = new Set(sounds.map((s) => s.id));
