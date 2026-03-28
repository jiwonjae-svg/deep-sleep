import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useThemeColors, typography, spacing } from '@/theme';

const ONBOARDING_IMAGES = [
  require('@/assets/images/onboarding/onboarding-1.png'),
  require('@/assets/images/onboarding/onboarding-2.png'),
  require('@/assets/images/onboarding/onboarding-3.png'),
  require('@/assets/images/onboarding/onboarding-4.png'),
];

interface OnboardingSlideProps {
  slideIndex: number;
  title: string;
  description: string;
}

export function OnboardingSlide({ slideIndex, title, description }: OnboardingSlideProps) {
  const { width } = useWindowDimensions();
  const themeColors = useThemeColors();
  const source = ONBOARDING_IMAGES[slideIndex] ?? ONBOARDING_IMAGES[0];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
        image: { width: 250, height: 250 },
        title: { ...typography.h1, color: themeColors.textPrimary, textAlign: 'center' },
        description: { ...typography.body, color: themeColors.textSecondary, textAlign: 'center', lineHeight: 24 },
      }),
    [themeColors],
  );

  return (
    <View style={[styles.container, { width }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
