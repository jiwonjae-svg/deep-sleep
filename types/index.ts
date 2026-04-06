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
  imageUri?: string | null;
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
  specificDate?: string | null; // ISO date string (YYYY-MM-DD), alternative to repeat days
  enabled: boolean;
  soundId: string;
  fadeInMinutes: number; // 0 = disabled
  snoozeMinutes: number; // 0 = disabled
  mathDismiss: boolean;
  mathDifficulty: MathDifficulty;
  label: string;
  notificationId: string | null;
  smartAlarm?: SmartAlarmConfig | null;
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
export type ThemeColor = '#456eea' | '#8b5cf6' | '#ec4899' | '#f97316' | '#22c55e' | '#06b6d4' | '#ef4444' | '#14b8a6' | '#a855f7' | '#eab308' | '#6366f1' | '#f43f5e';

export interface AppSettings {
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  language: AppLanguage;
  autoSleepScreen: boolean;
  autoDimBrightness: boolean;
  audioQuality: AudioQuality;
  volumeChangeSpeed: VolumeChangeSpeed;
  defaultSnoozeMinutes: number;
  defaultAlarmSoundId: string;
  // Timer advanced mode (3.4)
  timerFadeOutEnabled: boolean;
  timerFadeOutMinutes: number; // 3, 5, 10
  intelligentTimerEnabled: boolean;
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

// ──────────────────────────────────────────────
// Timer Advanced Mode (3.4)
// ──────────────────────────────────────────────

export type TimerTransitionType = 'crossfade' | 'cut';

export interface TimerPhase {
  presetId: string;
  durationMinutes: number;
  transitionType: TimerTransitionType;
  crossfadeSec: number;
}

export interface TimerSchedule {
  phases: TimerPhase[];
  loopLastPhase: boolean;
}

// ──────────────────────────────────────────────
// Smart Alarm (3.7)
// ──────────────────────────────────────────────

export type SleepStage = 'wake' | 'light' | 'deep' | 'rem';

export type SmartAlarmSensitivity = 'low' | 'medium' | 'high';

export interface SmartAlarmConfig {
  enabled: boolean;
  windowMinutes: number; // 10, 20, 30
  sensitivity: SmartAlarmSensitivity;
}

// ──────────────────────────────────────────────
// Snoring Detection (3.8)
// ──────────────────────────────────────────────

export type SnoringIntensity = 'light' | 'moderate' | 'heavy';

export interface SnoringEvent {
  timestamp: number;
  durationSec: number;
  intensity: SnoringIntensity;
  peakDb: number;
}

export interface SnoringRecord {
  date: string; // YYYY-MM-DD
  events: SnoringEvent[];
  totalSnoringMinutes: number;
  avgIntensity: SnoringIntensity;
}

// ──────────────────────────────────────────────
// Sleep Debt (3.9)
// ──────────────────────────────────────────────

export interface DailyDebtRecord {
  date: string; // YYYY-MM-DD
  actualSleepMinutes: number;
  debtChangeMinutes: number; // positive = deficit, negative = recovery
}

export type DebtTrend = 'increasing' | 'stable' | 'decreasing';

// ──────────────────────────────────────────────
// Focus Mode (3.10)
// ──────────────────────────────────────────────

export type FocusPhase = 'focus' | 'short-break' | 'long-break' | 'idle';

export interface FocusConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface FocusSessionRecord {
  date: string; // YYYY-MM-DD
  totalFocusMinutes: number;
  sessionsCompleted: number;
}
