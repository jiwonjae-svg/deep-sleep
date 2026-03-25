import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MascotImage } from '@/components/common/MascotImage';
import { colors, typography, spacing } from '@/theme';

interface OnboardingSlideProps {
  title: string;
  description: string;
  mascotPose: string;
}

export function OnboardingSlide({ title, description, mascotPose }: OnboardingSlideProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <MascotImage pose={mascotPose} size={250} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
