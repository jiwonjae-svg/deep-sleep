import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { colors, spacing } from '@/theme';

const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxx/xxxxxxxx';

export function AdBanner() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  // Don't show ads for premium users or during playback
  if (isPremium || isPlaying) return null;

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
