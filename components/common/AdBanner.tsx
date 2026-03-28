import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { colors, spacing } from '@/theme';

// react-native-google-mobile-ads requires a native build (not available in Expo Go)
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {
  // Expo Go: native module not available, ads disabled
}

const AD_UNIT_ID = TestIds?.BANNER ?? 'ca-app-pub-xxxxxxxx/xxxxxxxx';

export function AdBanner() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  // Don't show ads for premium users, during playback, or in Expo Go
  if (!BannerAd || isPremium || isPlaying) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    paddingVertical: spacing.xs,
  },
});
