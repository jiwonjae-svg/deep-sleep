import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
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
        logo: { width: 100, height: 100 },
        text: { ...typography.body, color: themeColors.textSecondary },
      }),
    [themeColors],
  );

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo/main_logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.text}>준비 중...</Text>
      <ActivityIndicator color={themeColors.accent1} size="small" />
    </View>
  );
}
