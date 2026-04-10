import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing } from '@/theme';

const ONBOARDING_ICONS: (keyof typeof MaterialIcons.glyphMap)[] = [
  'nightlight-round',
  'music-note',
  'alarm',
  'auto-awesome',
];

interface OnboardingSlideProps {
  slideIndex: number;
  title: string;
  description: string;
}

export function OnboardingSlide({ slideIndex, title, description }: OnboardingSlideProps) {
  const { width } = useWindowDimensions();
  const themeColors = useThemeColors();
  const iconName = ONBOARDING_ICONS[slideIndex] ?? ONBOARDING_ICONS[0];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
        iconContainer: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
        title: { ...typography.h1, color: themeColors.textPrimary, textAlign: 'center' },
        description: { ...typography.body, color: themeColors.textSecondary, textAlign: 'center', lineHeight: 24 },
      }),
    [themeColors],
  );

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={iconName} size={80} color="rgba(255,255,255,0.5)" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
