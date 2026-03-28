// ──────────────────────────────────────────────
// Sound & Audio
// ──────────────────────────────────────────────

export type SoundCategory =
  | 'rain-water'
  | 'ocean-beach'
  | 'wind-weather'
  | 'forest-nature'
  | 'fire-warmth'
  | 'indoor-ambient'
  | 'urban-transport'
  | 'musical-tonal'
  | 'special-environments'
  | 'seasonal-special';

export type SoundType = 'continuous' | 'intermittent';

export type Frequency = 'continuous' | 'frequent' | 'occasional' | 'rare';

export interface SoundConfig {
  id: string;
  name: string;
  category: SoundCategory;
  type: SoundType;
  isPremium: boolean;
  iconEmoji: string;
  fileName: string;
}

export interface ActiveSoundState {
  soundId: string;
  volumeMin: number; // 0–100
  volumeMax: number; // 0–100
  frequency: Frequency;
  pan: number; // -1 (L) ~ 1 (R), default 0
}

// ──────────────────────────────────────────────
// Preset
// ──────────────────────────────────────────────

export interface Preset {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  sounds: ActiveSoundState[];
  createdAt: number;
  updatedAt: number;
}

// ──────────────────────────────────────────────
// Alarm
// ──────────────────────────────────────────────

export type MathDifficulty = 'easy' | 'medium' | 'hard';

export interface Alarm {
  id: string;
  time: { hour: number; minute: number };
  days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  enabled: boolean;
  soundId: string;
  fadeInMinutes: number; // 0 = disabled
  snoozeMinutes: number; // 0 = disabled
  mathDismiss: boolean;
  mathDifficulty: MathDifficulty;
  label: string;
  notificationId: string | null;
}

export interface MathProblem {
  question: string;
  answer: number;
}

// ──────────────────────────────────────────────
// Settings
// ──────────────────────────────────────────────

export type AudioQuality = 'low' | 'medium' | 'high';
export type VolumeChangeSpeed = 'slow' | 'medium' | 'fast';
export type AppLanguage = 'ko' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
  language: AppLanguage;
  autoSleepScreen: boolean;
  autoDimBrightness: boolean;
  audioQuality: AudioQuality;
  volumeChangeSpeed: VolumeChangeSpeed;
  defaultSnoozeMinutes: number;
  defaultAlarmSoundId: string;
}

// ──────────────────────────────────────────────
// AI Recommendation
// ──────────────────────────────────────────────

export interface AIRecommendedSound {
  soundId: string;
  volumeMin: number;
  volumeMax: number;
  frequency: Frequency;
}

export interface AIPresetResult {
  preset_name: string;
  description: string;
  sounds: AIRecommendedSound[];
}

export interface AIUsageState {
  dailyCallCount: number;
  lastCallDate: string; // 'YYYY-MM-DD'
  lastResult: AIPresetResult | null;
}

// ──────────────────────────────────────────────
// Category metadata
// ──────────────────────────────────────────────

export interface CategoryInfo {
  id: SoundCategory;
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
}
