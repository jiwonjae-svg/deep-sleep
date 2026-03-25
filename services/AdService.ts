import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { AD_INTERSTITIAL_MIN_INTERVAL, AD_DAILY_MAX_INTERSTITIAL } from '@/utils/constants';

// ──────────────────────────────────────────────
// State tracking
// ──────────────────────────────────────────────

let lastInterstitialTime = 0;
let dailyInterstitialCount = 0;
let lastCountDate = '';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function resetDailyCountIfNeeded() {
  const today = todayString();
  if (lastCountDate !== today) {
    dailyInterstitialCount = 0;
    lastCountDate = today;
  }
}

// ──────────────────────────────────────────────
// Interstitial Ad
// ──────────────────────────────────────────────

/**
 * 전면 광고를 표시할 수 있는 상태인지 확인.
 * - 프리미엄 사용자 → 항상 false
 * - 60초 간격 미충족 → false
 * - 하루 20회 초과 → false
 */
export function canShowInterstitial(): boolean {
  if (useSubscriptionStore.getState().isPremium) return false;

  resetDailyCountIfNeeded();

  const now = Date.now();
  if (now - lastInterstitialTime < AD_INTERSTITIAL_MIN_INTERVAL) return false;
  if (dailyInterstitialCount >= AD_DAILY_MAX_INTERSTITIAL) return false;

  return true;
}

/**
 * 전면 광고 표시 시도.
 * react-native-google-mobile-ads의 InterstitialAd를 호출한다.
 * 외부(컴포넌트)에서 실제 광고 인스턴스를 관리하므로,
 * 이 함수는 빈도 제한만 처리하고 표시 가능 여부를 반환한다.
 */
export function recordInterstitialShown(): void {
  lastInterstitialTime = Date.now();
  dailyInterstitialCount += 1;
}

// ──────────────────────────────────────────────
// Banner Ad
// ──────────────────────────────────────────────

/**
 * 배너 광고 표시 여부.
 * - 프리미엄 사용자 → false
 * - 재생 중 → false (AudioStore.isPlaying 확인은 호출부에서)
 */
export function shouldShowBanner(): boolean {
  return !useSubscriptionStore.getState().isPremium;
}

// ──────────────────────────────────────────────
// Probabilistic interstitial (카테고리 탭 등 5회 중 1회)
// ──────────────────────────────────────────────

let probabilityCounter = 0;

/**
 * 확률적 전면 광고 (예: 카테고리 진입 시 5회 중 1회).
 * @returns true면 광고를 표시해야 함
 */
export function shouldShowProbabilisticInterstitial(): boolean {
  if (!canShowInterstitial()) return false;
  probabilityCounter += 1;
  return probabilityCounter % 5 === 0;
}
