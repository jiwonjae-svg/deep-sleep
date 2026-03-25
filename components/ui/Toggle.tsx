import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled = false }: ToggleProps) {
  const offset = useSharedValue(value ? 14 : 0);

  React.useEffect(() => {
    offset.value = withTiming(value ? 14 : 0, { duration: 200 });
  }, [value]);

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

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

const styles = StyleSheet.create({
  track: {
    width: 32,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.glassMedium,
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  trackActive: {
    backgroundColor: colors.accent2,
  },
  handle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  handleActive: {
    backgroundColor: colors.white,
  },
  handleInactive: {
    backgroundColor: '#888DAA',
  },
});
