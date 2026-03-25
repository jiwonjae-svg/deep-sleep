import React, { useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography } from '@/theme';

interface SliderProps {
  value: number; // 0–100
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  trackColor?: string;
  activeColor?: string;
  showLabel?: boolean;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  trackColor = colors.glassMedium,
  activeColor = colors.accent2,
  showLabel = false,
}: SliderProps) {
  const trackWidth = useSharedValue(0);
  const handleX = useSharedValue(0);

  const range = maximumValue - minimumValue;
  const normalised = (value - minimumValue) / range;

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      handleX.value = normalised * w;
    },
    [normalised],
  );

  const updateValue = useCallback(
    (x: number) => {
      const w = trackWidth.value;
      if (w === 0) return;
      const clamped = Math.max(0, Math.min(x, w));
      const pct = clamped / w;
      const v = Math.round(minimumValue + pct * range);
      onValueChange(v);
    },
    [minimumValue, range, onValueChange],
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(e.x, trackWidth.value));
      handleX.value = newX;
      runOnJS(updateValue)(newX);
    })
    .hitSlop({ top: 16, bottom: 16, left: 8, right: 8 });

  const tap = Gesture.Tap().onEnd((e) => {
    const newX = Math.max(0, Math.min(e.x, trackWidth.value));
    handleX.value = newX;
    runOnJS(updateValue)(newX);
  });

  const gesture = Gesture.Race(pan, tap);

  const activeStyle = useAnimatedStyle(() => ({
    width: handleX.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: handleX.value - 12 }],
  }));

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View style={styles.container} onLayout={onLayout}>
          <View style={[styles.track, { backgroundColor: trackColor }]} />
          <Animated.View style={[styles.activeTrack, { backgroundColor: activeColor }, activeStyle]} />
          <Animated.View style={[styles.handle, { backgroundColor: activeColor }, handleStyle]} />
        </View>
      </GestureDetector>
      {showLabel && (
        <Text style={styles.label}>{value}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  handle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
