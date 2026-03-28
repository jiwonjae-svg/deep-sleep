import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, typography, layout } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const themeColors = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: { height: 52, borderRadius: 26, overflow: 'hidden' },
        gradient: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 8,
        },
        primaryText: { ...typography.button, color: '#ffffff' },
        secondary: {
          height: 48,
          borderRadius: 24,
          backgroundColor: themeColors.glassMedium,
          borderWidth: 1,
          borderColor: themeColors.accent1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          gap: 8,
        },
        secondaryText: { ...typography.button, color: themeColors.accent1 },
        ghost: {
          height: 48,
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          gap: 8,
        },
        ghostText: { ...typography.button, color: themeColors.textSecondary },
      }),
    [themeColors],
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          { opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={[themeColors.accent1, themeColors.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.ghost,
        { opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? themeColors.accent1 : themeColors.textSecondary} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              variant === 'secondary' ? styles.secondaryText : styles.ghostText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
