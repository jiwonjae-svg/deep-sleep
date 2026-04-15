import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useThemeColors, typography, spacing } from '@/theme';

const ONBOARDING_IMAGES = [
  require('@/assets/onboarding1.png'),
  require('@/assets/onboarding2.png'),
  require('@/assets/onboarding3.png'),
  require('@/assets/onboarding4.png'),
];

interface OnboardingSlideProps {
  slideIndex: number;
  title: string;
  description: string;
}

export function OnboardingSlide({ slideIndex, title, description }: OnboardingSlideProps) {
  const { width } = useWindowDimensions();
  const themeColors = useThemeColors();
  const imageSource = ONBOARDING_IMAGES[slideIndex] ?? ONBOARDING_IMAGES[0];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
        image: { width: 260, height: 260, resizeMode: 'contain' },
        title: { ...typography.h1, color: themeColors.textPrimary, textAlign: 'center' },
        description: { ...typography.body, color: themeColors.textSecondary, textAlign: 'center', lineHeight: 24 },
      }),
    [themeColors],
  );

  return (
    <View style={[styles.container, { width }]}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
