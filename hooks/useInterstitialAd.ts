import { useCallback, useEffect, useRef } from 'react';
import { canShowInterstitial, recordInterstitialShown, shouldShowProbabilisticInterstitial } from '@/services/AdService';
import Constants from 'expo-constants';

// react-native-google-mobile-ads requires a native build (not available in Expo Go)
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch {
  // Expo Go: native module not available
}

const AD_UNIT_ID =
  TestIds?.INTERSTITIAL ??
  Constants.expoConfig?.extra?.admobInterstitialId ??
  'ca-app-pub-xxxxxxxx/xxxxxxxx';

/**
 * 전면 광고 로드·표시 훅.
 * 네이티브 빌드에서만 동작하며, Expo Go에서는 no-op.
 */
export function useInterstitialAd() {
  const adRef = useRef<any>(null);
  const loadedRef = useRef(false);

  const loadAd = useCallback(() => {
    if (!InterstitialAd) return;
    try {
      const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });
      ad.addAdEventListener(AdEventType.LOADED, () => {
        loadedRef.current = true;
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        loadedRef.current = false;
        // 닫힌 후 다음 광고 미리 로드
        loadAd();
      });
      ad.addAdEventListener(AdEventType.ERROR, () => {
        loadedRef.current = false;
      });
      ad.load();
      adRef.current = ad;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current = null;
      loadedRef.current = false;
    };
  }, [loadAd]);

  /** 빈도 제한을 확인하고, 조건 충족 시 전면 광고를 표시한다. */
  const showIfReady = useCallback(() => {
    if (!loadedRef.current || !adRef.current) return;
    if (!canShowInterstitial()) return;
    try {
      adRef.current.show();
      recordInterstitialShown();
    } catch {
      // ignore
    }
  }, []);

  /** 확률적 전면 광고: 5회 중 1회 + 빈도 제한 충족 시 표시. */
  const showProbabilistic = useCallback(() => {
    if (!loadedRef.current || !adRef.current) return;
    if (!shouldShowProbabilisticInterstitial()) return;
    try {
      adRef.current.show();
      recordInterstitialShown();
    } catch {
      // ignore
    }
  }, []);

  return { showIfReady, showProbabilistic };
}
