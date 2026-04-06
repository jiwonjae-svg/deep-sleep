import { Preset } from '@/types';

/**
 * v1.1 기본 프리셋 5개.
 * rain-light 추가, 빗속 드라이브 프리셋 제거.
 */
export const defaultPresets: Preset[] = [
  {
    id: 'preset-rain-night',
    name: '비 오는 밤',
    description: '빗소리와 천둥이 어우러진 밤',
    isDefault: true,
    sounds: [
      { soundId: 'rain-light', volumeMin: 40, volumeMax: 70, frequency: 'continuous', pan: 0 },
      { soundId: 'thunder', volumeMin: 20, volumeMax: 50, frequency: 'rare', pan: 0 },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'preset-forest-night',
    name: '숲속의 밤',
    description: '숲속 캠핑',
    isDefault: true,
    sounds: [
      { soundId: 'birds-morning', volumeMin: 15, volumeMax: 30, frequency: 'continuous', pan: 0.3 },
      { soundId: 'crickets', volumeMin: 15, volumeMax: 25, frequency: 'continuous', pan: -0.2 },
      { soundId: 'wind-gentle', volumeMin: 15, volumeMax: 30, frequency: 'continuous', pan: 0 },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'preset-campfire',
    name: '캠프파이어',
    description: '캠핑장의 밤',
    isDefault: true,
    sounds: [
      { soundId: 'campfire', volumeMin: 40, volumeMax: 65, frequency: 'continuous', pan: 0 },
      { soundId: 'crickets', volumeMin: 10, volumeMax: 20, frequency: 'continuous', pan: -0.4 },
      { soundId: 'wind-gentle', volumeMin: 15, volumeMax: 30, frequency: 'continuous', pan: 0.2 },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'preset-warm-fireplace',
    name: '따뜻한 벽난로',
    description: '따뜻한 실내에서 겨울 밤',
    isDefault: true,
    sounds: [
      { soundId: 'fireplace', volumeMin: 35, volumeMax: 55, frequency: 'continuous', pan: -0.2 },
      { soundId: 'white-noise', volumeMin: 10, volumeMax: 20, frequency: 'continuous', pan: 0 },
      { soundId: 'wind-gentle', volumeMin: 20, volumeMax: 35, frequency: 'continuous', pan: 0.3 },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'preset-cafe',
    name: '카페',
    description: '카페 분위기 (수면+집중 겸용)',
    isDefault: true,
    sounds: [
      { soundId: 'cafe-chatter', volumeMin: 30, volumeMax: 50, frequency: 'continuous', pan: 0 },
      { soundId: 'white-noise', volumeMin: 10, volumeMax: 20, frequency: 'continuous', pan: 0.2 },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
];
