import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  subtext?: string;
  recommended?: boolean;
  selected: boolean;
  onPress: () => void;
}

export function PlanCard({
  title,
  price,
  period,
  subtext,
  recommended = false,
  selected,
  onPress,
}: PlanCardProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const selectionAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const animatedBorderColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.glassBorder, themeColors.accent1],
  });
  const animatedBgColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.glassLight, themeColors.glassMedium],
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          borderRadius: layout.borderRadiusMd,
          padding: spacing.md,
          alignItems: 'center',
          borderWidth: 2,
          gap: spacing.xs,
        },
        badge: { backgroundColor: themeColors.accent3, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
        badgeText: { ...typography.overline, color: '#000000' },
        title: { ...typography.bodyMedium, color: themeColors.textPrimary },
        price: { ...typography.h2, color: themeColors.textPrimary },
        period: { ...typography.caption, color: themeColors.textSecondary },
        subtext: { ...typography.caption, color: themeColors.accent2 },
      }),
    [themeColors],
  );

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[styles.card, { borderColor: animatedBorderColor, backgroundColor: animatedBgColor }]}
      >
        {recommended && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('subscription.recommended')}</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>{period}</Text>
        {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      </Animated.View>
    </Pressable>
  );
}
