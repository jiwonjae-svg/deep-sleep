import { SoundConfig } from '@/types';

/**
 * 100개 소리 메타데이터.
 * 파일명은 assets/sounds/ 아래에 위치한다고 가정.
 * isPremium=true 인 소리는 ★ 유료 전용.
 */
export const sounds: SoundConfig[] = [
  // ──────────────────────────────────────────────
  // 1. 비 & 물 (Rain & Water) — 15개
  // ──────────────────────────────────────────────
  { id: 'rain-light', name: '가벼운 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🌦️', fileName: 'rain-light.ogg' },
  { id: 'rain-heavy', name: '폭우', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🌧️', fileName: 'rain-heavy.ogg' },
  { id: 'thunder', name: '천둥번개', category: 'rain-water', type: 'intermittent', isPremium: false, iconEmoji: '⛈️', fileName: 'thunder.ogg' },
  { id: 'rain-eaves', name: '처마 빗물', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '💧', fileName: 'rain-eaves.ogg' },
  { id: 'rain-umbrella', name: '우산 위 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '☂️', fileName: 'rain-umbrella.ogg' },
  { id: 'rain-tent', name: '텐트 위 빗소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '⛺', fileName: 'rain-tent.ogg' },
  { id: 'rain-car', name: '차 안 빗소리', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🚗', fileName: 'rain-car.ogg' },
  { id: 'stream', name: '시냇물', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🏞️', fileName: 'stream.ogg' },
  { id: 'valley-water', name: '계곡 물소리', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '⛰️', fileName: 'valley-water.ogg' },
  { id: 'waterfall', name: '폭포', category: 'rain-water', type: 'continuous', isPremium: false, iconEmoji: '🏞️', fileName: 'waterfall.ogg' },
  { id: 'waterfall-far', name: '먼 폭포', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🌫️', fileName: 'waterfall-far.ogg' },
  { id: 'water-drop', name: '물방울', category: 'rain-water', type: 'intermittent', isPremium: false, iconEmoji: '💦', fileName: 'water-drop.ogg' },
  { id: 'faucet', name: '수도꼭지 물소리', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🚰', fileName: 'faucet.ogg' },
  { id: 'fountain', name: '분수', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '⛲', fileName: 'fountain.ogg' },
  { id: 'rain-puddle', name: '빗물 웅덩이', category: 'rain-water', type: 'continuous', isPremium: true, iconEmoji: '🌊', fileName: 'rain-puddle.ogg' },

  // ──────────────────────────────────────────────
  // 2. 바다 & 해변 (Ocean & Beach) — 10개
  // ──────────────────────────────────────────────
  { id: 'wave-gentle', name: '잔잔한 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-gentle.ogg' },
  { id: 'wave-rough', name: '거친 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌊', fileName: 'wave-rough.ogg' },
  { id: 'wave-sand', name: '해변 모래 위 파도', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🏖️', fileName: 'wave-sand.ogg' },
  { id: 'wave-rock', name: '바위에 부딪히는 파도', category: 'ocean-beach', type: 'continuous', isPremium: true, iconEmoji: '🪨', fileName: 'wave-rock.ogg' },
  { id: 'sea-breeze', name: '바닷바람', category: 'ocean-beach', type: 'continuous', isPremium: false, iconEmoji: '🌬️', fileName: 'sea-breeze.ogg' },
  { id: 'seagull', name: '갈매기', category: 'ocean-beach', type: 'intermittent', isPremium: true, iconEmoji: '🐦', fileName: 'seagull.ogg' },
  { id: 'harbor', name: '항구', category: 'ocean-beach', type: 'continuous', isPremium: true, iconEmoji: '⚓', fileName: 'harbor.ogg' },
  { id: 'underwater', name: '수중 소리', category: 'ocean-beach', type: 'continuous', isPremium: true, iconEmoji: '🫧', fileName: 'underwater.ogg' },
  { id: 'boat-wave', name: '보트 위 물결', category: 'ocean-beach', type: 'continuous', isPremium: true, iconEmoji: '⛵', fileName: 'boat-wave.ogg' },
  { id: 'cliff-wind', name: '해안 절벽 바람', category: 'ocean-beach', type: 'continuous', isPremium: true, iconEmoji: '🏔️', fileName: 'cliff-wind.ogg' },

  // ──────────────────────────────────────────────
  // 3. 바람 & 날씨 (Wind & Weather) — 10개
  // ──────────────────────────────────────────────
  { id: 'wind-gentle', name: '부드러운 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍃', fileName: 'wind-gentle.ogg' },
  { id: 'wind-strong', name: '강한 바람', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '💨', fileName: 'wind-strong.ogg' },
  { id: 'leaves-rustle', name: '나뭇잎 바스락', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🍂', fileName: 'leaves-rustle.ogg' },
  { id: 'window-rattle', name: '바람에 끼덕이는 창문', category: 'wind-weather', type: 'intermittent', isPremium: true, iconEmoji: '🪟', fileName: 'window-rattle.ogg' },
  { id: 'blizzard', name: '눈보라', category: 'wind-weather', type: 'continuous', isPremium: true, iconEmoji: '❄️', fileName: 'blizzard.ogg' },
  { id: 'hail', name: '우박', category: 'wind-weather', type: 'continuous', isPremium: false, iconEmoji: '🧊', fileName: 'hail.ogg' },
  { id: 'tornado-wind', name: '토네이도 먼 바람', category: 'wind-weather', type: 'continuous', isPremium: true, iconEmoji: '🌪️', fileName: 'tornado-wind.ogg' },
  { id: 'prairie-wind', name: '황야 바람', category: 'wind-weather', type: 'continuous', isPremium: true, iconEmoji: '🏜️', fileName: 'prairie-wind.ogg' },
  { id: 'mountain-wind', name: '산 꼭대기 바람', category: 'wind-weather', type: 'continuous', isPremium: true, iconEmoji: '🏔️', fileName: 'mountain-wind.ogg' },
  { id: 'bamboo-wind', name: '대나무숲 바람', category: 'wind-weather', type: 'continuous', isPremium: true, iconEmoji: '🎋', fileName: 'bamboo-wind.ogg' },

  // ──────────────────────────────────────────────
  // 4. 숲 & 자연 (Forest & Nature) — 15개
  // ──────────────────────────────────────────────
  { id: 'birds-morning', name: '새소리 (아침)', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐦', fileName: 'birds-morning.ogg' },
  { id: 'cuckoo', name: '뻐꾸기', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🐦‍⬛', fileName: 'cuckoo.ogg' },
  { id: 'owl', name: '올빼미', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🦉', fileName: 'owl.ogg' },
  { id: 'crow', name: '까마귀', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🐦‍⬛', fileName: 'crow.ogg' },
  { id: 'crickets', name: '귀뚜라미', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🦗', fileName: 'crickets.ogg' },
  { id: 'frogs', name: '개구리', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🐸', fileName: 'frogs.ogg' },
  { id: 'cicadas', name: '매미', category: 'forest-nature', type: 'continuous', isPremium: true, iconEmoji: '🪲', fileName: 'cicadas.ogg' },
  { id: 'woodpecker', name: '딱따구리', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🐦', fileName: 'woodpecker.ogg' },
  { id: 'grass-bugs', name: '풀벌레', category: 'forest-nature', type: 'continuous', isPremium: false, iconEmoji: '🌿', fileName: 'grass-bugs.ogg' },
  { id: 'wolf', name: '늑대 울음', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🐺', fileName: 'wolf.ogg' },
  { id: 'deer', name: '사슴 울음', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🦌', fileName: 'deer.ogg' },
  { id: 'fallen-leaves', name: '낙엽 밟는 소리', category: 'forest-nature', type: 'intermittent', isPremium: false, iconEmoji: '🍁', fileName: 'fallen-leaves.ogg' },
  { id: 'branch-snap', name: '나뭇가지 부러짐', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🪵', fileName: 'branch-snap.ogg' },
  { id: 'bees', name: '꿀벌 윙윙', category: 'forest-nature', type: 'continuous', isPremium: true, iconEmoji: '🐝', fileName: 'bees.ogg' },
  { id: 'dragonfly', name: '잠자리 날개짓', category: 'forest-nature', type: 'intermittent', isPremium: true, iconEmoji: '🪰', fileName: 'dragonfly.ogg' },

  // ──────────────────────────────────────────────
  // 5. 불 & 따뜻함 (Fire & Warmth) — 8개
  // ──────────────────────────────────────────────
  { id: 'campfire', name: '모닥불', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🔥', fileName: 'campfire.ogg' },
  { id: 'fireplace', name: '벽난로', category: 'fire-warmth', type: 'continuous', isPremium: false, iconEmoji: '🏠', fileName: 'fireplace.ogg' },
  { id: 'candle', name: '촛불', category: 'fire-warmth', type: 'continuous', isPremium: true, iconEmoji: '🕯️', fileName: 'candle.ogg' },
  { id: 'log-fire', name: '장작 타는 소리', category: 'fire-warmth', type: 'intermittent', isPremium: true, iconEmoji: '🪵', fileName: 'log-fire.ogg' },
  { id: 'charcoal', name: '숯불', category: 'fire-warmth', type: 'continuous', isPremium: true, iconEmoji: '♨️', fileName: 'charcoal.ogg' },
  { id: 'furnace', name: '화덕', category: 'fire-warmth', type: 'continuous', isPremium: true, iconEmoji: '🧱', fileName: 'furnace.ogg' },
  { id: 'match-strike', name: '성냥 긋는 소리', category: 'fire-warmth', type: 'intermittent', isPremium: true, iconEmoji: '🔥', fileName: 'match-strike.ogg' },
  { id: 'furnace-crack', name: '난로 속 나무 부러짐', category: 'fire-warmth', type: 'intermittent', isPremium: true, iconEmoji: '💥', fileName: 'furnace-crack.ogg' },

  // ──────────────────────────────────────────────
  // 6. 실내 & 일상 (Indoor & Ambient) — 12개
  // ──────────────────────────────────────────────
  { id: 'aircon', name: '에어컨', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '❄️', fileName: 'aircon.ogg' },
  { id: 'fan', name: '선풍기', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🌀', fileName: 'fan.ogg' },
  { id: 'clock-tick', name: '시계 째깍', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🕐', fileName: 'clock-tick.ogg' },
  { id: 'washing-machine', name: '세탁기', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🫧', fileName: 'washing-machine.ogg' },
  { id: 'dishwasher', name: '식기세척기', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🍽️', fileName: 'dishwasher.ogg' },
  { id: 'vacuum', name: '청소기', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🧹', fileName: 'vacuum.ogg' },
  { id: 'keyboard', name: '키보드 타이핑', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '⌨️', fileName: 'keyboard.ogg' },
  { id: 'page-turn', name: '종이 넘기는 소리', category: 'indoor-ambient', type: 'intermittent', isPremium: true, iconEmoji: '📖', fileName: 'page-turn.ogg' },
  { id: 'pencil', name: '연필 쓰는 소리', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '✏️', fileName: 'pencil.ogg' },
  { id: 'knitting', name: '뜨개질', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🧶', fileName: 'knitting.ogg' },
  { id: 'cat-purr', name: '고양이 골골송', category: 'indoor-ambient', type: 'continuous', isPremium: false, iconEmoji: '🐱', fileName: 'cat-purr.ogg' },
  { id: 'fridge-hum', name: '냉장고 윙윙', category: 'indoor-ambient', type: 'continuous', isPremium: true, iconEmoji: '🧊', fileName: 'fridge-hum.ogg' },

  // ──────────────────────────────────────────────
  // 7. 도시 & 교통 (Urban & Transport) — 10개
  // ──────────────────────────────────────────────
  { id: 'traffic-far', name: '먼 교통 소리', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '🚗', fileName: 'traffic-far.ogg' },
  { id: 'subway', name: '지하철 내부', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '🚇', fileName: 'subway.ogg' },
  { id: 'train-rail', name: '기차 레일 소리', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '🚂', fileName: 'train-rail.ogg' },
  { id: 'train-horn', name: '기차 경적', category: 'urban-transport', type: 'intermittent', isPremium: true, iconEmoji: '📯', fileName: 'train-horn.ogg' },
  { id: 'airplane', name: '비행기 내부', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '✈️', fileName: 'airplane.ogg' },
  { id: 'cafe-chatter', name: '카페 잡담', category: 'urban-transport', type: 'continuous', isPremium: false, iconEmoji: '☕', fileName: 'cafe-chatter.ogg' },
  { id: 'restaurant', name: '레스토랑', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '🍽️', fileName: 'restaurant.ogg' },
  { id: 'library', name: '도서관', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '📚', fileName: 'library.ogg' },
  { id: 'classroom', name: '교실', category: 'urban-transport', type: 'continuous', isPremium: true, iconEmoji: '🏫', fileName: 'classroom.ogg' },
  { id: 'siren-far', name: '먼 사이렌', category: 'urban-transport', type: 'intermittent', isPremium: true, iconEmoji: '🚨', fileName: 'siren-far.ogg' },

  // ──────────────────────────────────────────────
  // 8. 음악 & 톤 (Musical & Tonal) — 10개
  // ──────────────────────────────────────────────
  { id: 'white-noise', name: '화이트 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '📻', fileName: 'white-noise.ogg' },
  { id: 'pink-noise', name: '핑크 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '🩷', fileName: 'pink-noise.ogg' },
  { id: 'brown-noise', name: '브라운 노이즈', category: 'musical-tonal', type: 'continuous', isPremium: false, iconEmoji: '🟫', fileName: 'brown-noise.ogg' },
  { id: 'binaural', name: '바이노럴 비트', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🧠', fileName: 'binaural.ogg' },
  { id: 'singing-bowl', name: '싱잉볼', category: 'musical-tonal', type: 'intermittent', isPremium: false, iconEmoji: '🔔', fileName: 'singing-bowl.ogg' },
  { id: 'wind-chime', name: '풍경 (윈드차임)', category: 'musical-tonal', type: 'intermittent', isPremium: true, iconEmoji: '🎐', fileName: 'wind-chime.ogg' },
  { id: 'music-box', name: '오르골', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎶', fileName: 'music-box.ogg' },
  { id: 'harp', name: '하프', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎵', fileName: 'harp.ogg' },
  { id: 'jazz-piano', name: '재즈 피아노', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎹', fileName: 'jazz-piano.ogg' },
  { id: 'cello', name: '첼로', category: 'musical-tonal', type: 'continuous', isPremium: true, iconEmoji: '🎻', fileName: 'cello.ogg' },

  // ──────────────────────────────────────────────
  // 9. 특수 환경 (Special Environments) — 5개
  // ──────────────────────────────────────────────
  { id: 'cave', name: '동굴 반향', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '🕳️', fileName: 'cave.ogg' },
  { id: 'temple-bell', name: '사원 종소리', category: 'special-environments', type: 'intermittent', isPremium: true, iconEmoji: '🔔', fileName: 'temple-bell.ogg' },
  { id: 'hot-spring', name: '온천', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '♨️', fileName: 'hot-spring.ogg' },
  { id: 'space', name: '우주 엠비언스', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '🚀', fileName: 'space.ogg' },
  { id: 'garden', name: '정원', category: 'special-environments', type: 'continuous', isPremium: true, iconEmoji: '🌻', fileName: 'garden.ogg' },

  // ──────────────────────────────────────────────
  // 10. 계절 & 특별 (Seasonal & Special) — 5개
  // ──────────────────────────────────────────────
  { id: 'cherry-blossom', name: '벚꽃 비', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '🌸', fileName: 'cherry-blossom.ogg' },
  { id: 'rice-field-frogs', name: '논 개구리', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '🐸', fileName: 'rice-field-frogs.ogg' },
  { id: 'autumn-leaves', name: '가을 낙엽비', category: 'seasonal-special', type: 'continuous', isPremium: true, iconEmoji: '🍂', fileName: 'autumn-leaves.ogg' },
  { id: 'snow-walk', name: '눈 밟는 소리', category: 'seasonal-special', type: 'intermittent', isPremium: true, iconEmoji: '🌨️', fileName: 'snow-walk.ogg' },
  { id: 'christmas-bell', name: '크리스마스 벨', category: 'seasonal-special', type: 'intermittent', isPremium: true, iconEmoji: '🎄', fileName: 'christmas-bell.ogg' },
];

export function getSoundById(id: string): SoundConfig | undefined {
  return sounds.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): SoundConfig[] {
  return sounds.filter((s) => s.category === category);
}

/** 모든 유효한 soundId 집합 (AI 응답 검증용) */
export const validSoundIds = new Set(sounds.map((s) => s.id));
