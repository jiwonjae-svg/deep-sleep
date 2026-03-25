import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, layout } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  accentColor?: string;
  style?: ViewStyle;
}

export function Card({ children, active = false, accentColor, style }: CardProps) {
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

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusMd,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  active: {
    backgroundColor: colors.glassHeavy,
  },
});
