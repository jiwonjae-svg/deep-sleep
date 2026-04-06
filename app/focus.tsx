import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusPresetSelector } from '@/components/focus/FocusPresetSelector';
import { FocusStats } from '@/components/focus/FocusStats';

export default function FocusScreen() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  return (
    <GradientBackground overlay overlayOpacity={0.45}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            {t('focus.title', { defaultValue: '집중 모드' })}
          </Text>

          <FocusTimer />

          <FocusPresetSelector />

          <FocusStats />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
