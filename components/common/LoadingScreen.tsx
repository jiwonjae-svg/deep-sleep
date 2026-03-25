import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MascotImage } from './MascotImage';
import { colors, typography, spacing } from '@/theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <MascotImage pose="standby" size={120} />
      <Text style={styles.text}>잠곰이가 준비 중...</Text>
      <ActivityIndicator color={colors.accent1} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
