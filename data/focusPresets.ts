/**
 * 집중 모드 기본 프리셋 데이터
 * 기존 sounds.ts의 사운드 ID를 재사용
 */

import { ActiveSoundState, Preset } from '@/types';

interface FocusPresetDef {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  sounds: ActiveSoundState[];
}

export const FOCUS_PRESETS: FocusPresetDef[] = [
  {
    id: 'focus-cafe',
    nameKey: 'focusPresets.cafe',
    descKey: 'focusPresets.cafe-desc',
    icon: '☕',
    sounds: [
      { soundId: 'cafe-ambience', volumeMin: 0.3, volumeMax: 0.5, frequency: 'continuous', pan: 0 },
    ],
  },
  {
    id: 'focus-rain',
    nameKey: 'focusPresets.rain',
    descKey: 'focusPresets.rain-desc',
    icon: '🌧️',
    sounds: [
      { soundId: 'rain-heavy', volumeMin: 0.4, volumeMax: 0.6, frequency: 'continuous', pan: 0 },
      { soundId: 'thunder-rumble', volumeMin: 0.1, volumeMax: 0.3, frequency: 'occasional', pan: 0 },
    ],
  },
  {
    id: 'focus-brown',
    nameKey: 'focusPresets.brown',
    descKey: 'focusPresets.brown-desc',
    icon: '🔊',
    sounds: [
      { soundId: 'brown-noise', volumeMin: 0.3, volumeMax: 0.5, frequency: 'continuous', pan: 0 },
    ],
  },
  {
    id: 'focus-nature',
    nameKey: 'focusPresets.nature',
    descKey: 'focusPresets.nature-desc',
    icon: '🌿',
    sounds: [
      { soundId: 'birds-morning', volumeMin: 0.2, volumeMax: 0.4, frequency: 'frequent', pan: -0.3 },
      { soundId: 'stream-gentle', volumeMin: 0.3, volumeMax: 0.5, frequency: 'continuous', pan: 0.3 },
    ],
  },
  {
    id: 'focus-library',
    nameKey: 'focusPresets.library',
    descKey: 'focusPresets.library-desc',
    icon: '📚',
    sounds: [
      { soundId: 'clock-ticking', volumeMin: 0.1, volumeMax: 0.2, frequency: 'continuous', pan: 0 },
      { soundId: 'page-turning', volumeMin: 0.05, volumeMax: 0.15, frequency: 'occasional', pan: 0 },
    ],
  },
];

export const FOCUS_TIMER_PRESETS = [
  { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, label: '25/5' },
  { focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 20, label: '50/10' },
  { focusMinutes: 90, shortBreakMinutes: 15, longBreakMinutes: 30, label: '90/15' },
];
