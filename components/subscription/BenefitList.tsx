import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing } from '@/theme';
import { useTranslation } from 'react-i18next';

export function BenefitList() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const BENEFITS = [
    t('subscription.benefits.noAds'),
    t('subscription.benefits.premiumSounds'),
    t('subscription.benefits.unlimitedPresets'),
    t('subscription.benefits.aiRecommend'),
    t('subscription.benefits.panControl'),
    t('subscription.benefits.sleepStats'),
  ];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.md },
        row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        text: { ...typography.bodyMedium, color: themeColors.textPrimary },
      }),
    [themeColors],
  );

  return (
    <View style={styles.container}>
      {BENEFITS.map((b, i) => (
        <View key={i} style={styles.row}>
          <MaterialIcons name="check-circle" size={18} color="#4ade80" />
          <Text style={styles.text}>{b}</Text>
        </View>
      ))}
    </View>
  );
}
