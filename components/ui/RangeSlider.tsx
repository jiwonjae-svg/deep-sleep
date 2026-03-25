import React, { useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography } from '@/theme';

interface RangeSliderProps {
  min: number; // 0–100
  max: number; // 0–100
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  minGap?: number; // minimum gap between handles (default 5)
  trackColor?: string;
  activeColor?: string;
}

export function RangeSlider({
  min,
  max,
  onMinChange,
  onMaxChange,
  minGap = 5,
  trackColor = colors.glassMedium,
  activeColor = colors.accent1,
}: RangeSliderProps) {
  const trackWidth = useSharedValue(0);
  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      minX.value = (min / 100) * w;
      maxX.value = (max / 100) * w;
    },
    [min, max],
  );

  const toPct = useCallback(
    (x: number): number => {
      const w = trackWidth.value;
      if (w === 0) return 0;
      return Math.round((Math.max(0, Math.min(x, w)) / w) * 100);
    },
    [],
  );

  const updateMin = useCallback(
    (x: number) => {
      let pct = toPct(x);
      if (pct > max - minGap) pct = max - minGap;
      if (pct < 0) pct = 0;
      onMinChange(pct);
    },
    [max, minGap, onMinChange, toPct],
  );

  const updateMax = useCallback(
    (x: number) => {
      let pct = toPct(x);
      if (pct < min + minGap) pct = min + minGap;
      if (pct > 100) pct = 100;
      onMaxChange(pct);
    },
    [min, minGap, onMaxChange, toPct],
  );

  const minPan = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(e.x, trackWidth.value));
      minX.value = newX;
      runOnJS(updateMin)(newX);
    })
    .hitSlop({ top: 16, bottom: 16, left: 8, right: 8 });

  const maxPan = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(e.x, trackWidth.value));
      maxX.value = newX;
      runOnJS(updateMax)(newX);
    })
    .hitSlop({ top: 16, bottom: 16, left: 8, right: 8 });

  const activeStyle = useAnimatedStyle(() => ({
    left: minX.value,
    width: maxX.value - minX.value,
  }));

  const minHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minX.value - 12 }],
  }));

  const maxHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxX.value - 12 }],
  }));

  return (
    <View>
      <View style={styles.container} onLayout={onLayout}>
        {/* Background track */}
        <View style={[styles.track, { backgroundColor: trackColor }]} />

        {/* Active range */}
        <Animated.View style={[styles.activeTrack, { backgroundColor: activeColor }, activeStyle]} />

        {/* Min handle */}
        <GestureDetector gesture={minPan}>
          <Animated.View style={[styles.handle, { backgroundColor: activeColor }, minHandleStyle]} />
        </GestureDetector>

        {/* Max handle */}
        <GestureDetector gesture={maxPan}>
          <Animated.View style={[styles.handle, { backgroundColor: activeColor }, maxHandleStyle]} />
        </GestureDetector>
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.label}>{min}%</Text>
        <Text style={styles.label}>{max}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
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
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
