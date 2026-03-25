/** 앱 전역 상수 */

export const APP_NAME = 'Deep Sleep';
export const APP_SLUG = 'deep-sleep';

/** 동시 재생 가능한 최대 소리 수 */
export const MAX_SIMULTANEOUS_SOUNDS = 10;

/** 수면 타이머 프리셋 (분) */
export const TIMER_PRESETS = [15, 30, 45, 60, 120] as const;

/** 페이드아웃 시간 (ms) — 수면 타이머 종료 직전 */
export const TIMER_FADEOUT_DURATION = 5 * 60 * 1000; // 5분

/** 수면 타이머 최대 시간 (분) */
export const TIMER_MAX_MINUTES = 480; // 8시간

/** AI 추천 하루 최대 호출 수 */
export const AI_MAX_DAILY_CALLS = 20;

/** AI 입력 최대 글자 수 */
export const AI_MAX_INPUT_LENGTH = 300;

/** AI API 호출 타임아웃 (ms) */
export const AI_API_TIMEOUT = 10_000;

/** 전면 광고 최소 간격 (ms) */
export const AD_INTERSTITIAL_MIN_INTERVAL = 60_000; // 60초

/** 하루 최대 전면 광고 횟수 */
export const AD_DAILY_MAX_INTERSTITIAL = 20;

/** 프리셋 최대 저장 수 (무료) */
export const FREE_MAX_PRESETS = 5;

/** 스누즈 최대 횟수 */
export const MAX_SNOOZE_COUNT = 3;

/** AsyncStorage 키 */
export const STORAGE_KEYS = {
  CUSTOM_PRESETS: '@presets/custom',
  ALARMS: '@alarms',
  SETTINGS: '@settings',
  ONBOARDING_COMPLETED: '@onboarding/completed',
  LAST_AUDIO_STATE: '@audio/lastState',
  AI_USAGE: '@ai/usage',
} as const;
