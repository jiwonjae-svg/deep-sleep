import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '@/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled = false }: ToggleProps) {
  const offset = useSharedValue(value ? 14 : 0);
  const themeColors = useThemeColors();

  React.useEffect(() => {
    offset.value = withTiming(value ? 14 : 0, { duration: 200 });
  }, [value]);

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          width: 32,
          height: 20,
          borderRadius: 10,
          backgroundColor: themeColors.glassMedium,
          justifyContent: 'center',
          paddingHorizontal: 1,
        },
        trackActive: { backgroundColor: themeColors.accent2 },
        handle: { width: 18, height: 18, borderRadius: 9 },
        handleActive: { backgroundColor: '#ffffff' },
        handleInactive: { backgroundColor: '#888DAA' },
      }),
    [themeColors],
  );

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[styles.track, value && styles.trackActive, disabled && { opacity: 0.4 }]}
    >
      <Animated.View
        style={[
          styles.handle,
          value ? styles.handleActive : styles.handleInactive,
          handleStyle,
        ]}
      />
    </Pressable>
  );
}
