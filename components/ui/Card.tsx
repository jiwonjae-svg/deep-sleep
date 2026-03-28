import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors, layout } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  accentColor?: string;
  style?: ViewStyle;
}

export function Card({ children, active = false, accentColor, style }: CardProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          padding: layout.cardPadding,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        active: { backgroundColor: themeColors.glassHeavy },
      }),
    [themeColors],
  );

  return (
    <View
      style={[
        styles.base,
        active && styles.active,
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}
