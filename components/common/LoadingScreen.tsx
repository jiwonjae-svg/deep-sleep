import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MascotImage } from './MascotImage';
import { useThemeColors, typography, spacing } from '@/theme';

export function LoadingScreen() {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: themeColors.bgPrimary,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.base,
        },
        text: { ...typography.body, color: themeColors.textSecondary },
      }),
    [themeColors],
  );

  return (
    <View style={styles.container}>
      <MascotImage pose="standby" size={120} />
      <Text style={styles.text}>잠곰이가 준비 중...</Text>
      <ActivityIndicator color={themeColors.accent1} size="small" />
    </View>
  );
}
