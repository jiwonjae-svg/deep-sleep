import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
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



  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          width: 32,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.10)',
          justifyContent: 'center',
          paddingHorizontal: 1,
        },
        trackActive: {
          backgroundColor: themeColors.accent1,
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
        },
        handle: { width: 18, height: 18, borderRadius: 9 },
        handleActive: { backgroundColor: '#ffffff' },
        handleInactive: { backgroundColor: 'rgba(255,255,255,0.5)' },
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
          { transform: [{ translateX: offset }] },
        ]}
      />
    </Pressable>
  );
}
