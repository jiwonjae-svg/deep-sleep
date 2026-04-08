import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeColors, typography } from '@/theme';

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
  trackColor,
  activeColor,
}: RangeSliderProps) {
  const themeColors = useThemeColors();
  const resolvedTrackColor = trackColor ?? themeColors.glassMedium;
  const resolvedActiveColor = activeColor ?? themeColors.accent1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { height: 40, justifyContent: 'center' },
        track: { height: 6, borderRadius: 3, position: 'absolute', left: 0, right: 0 },
        activeTrack: { height: 6, borderRadius: 3, position: 'absolute' },
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
        labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
        label: { ...typography.caption, color: themeColors.textSecondary },
      }),
    [themeColors],
  );
  const trackWidth = useSharedValue(0);
  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const startMinX = useSharedValue(0);
  const startMaxX = useSharedValue(0);

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
    .onStart(() => {
      startMinX.value = minX.value;
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(startMinX.value + e.translationX, trackWidth.value));
      minX.value = newX;
      runOnJS(updateMin)(newX);
    })
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20])
    .hitSlop({ top: 16, bottom: 16, left: 8, right: 8 });

  const maxPan = Gesture.Pan()
    .onStart(() => {
      startMaxX.value = maxX.value;
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(startMaxX.value + e.translationX, trackWidth.value));
      maxX.value = newX;
      runOnJS(updateMax)(newX);
    })
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20])
    .hitSlop({ top: 16, bottom: 16, left: 8, right: 8 });

  const activeWidth = useDerivedValue(() => maxX.value - minX.value);
  const minHandlePos = useDerivedValue(() => minX.value - 12);
  const maxHandlePos = useDerivedValue(() => maxX.value - 12);

  return (
    <View>
      <View style={styles.container} onLayout={onLayout}>
        {/* Background track */}
        <View style={[styles.track, { backgroundColor: resolvedTrackColor }]} />

        {/* Active range */}
        <Animated.View style={[styles.activeTrack, { backgroundColor: resolvedActiveColor, left: minX, width: activeWidth }]} />

        {/* Min handle */}
        <GestureDetector gesture={minPan}>
          <Animated.View style={[styles.handle, { backgroundColor: resolvedActiveColor, transform: [{ translateX: minHandlePos }] }]} />
        </GestureDetector>

        {/* Max handle */}
        <GestureDetector gesture={maxPan}>
          <Animated.View style={[styles.handle, { backgroundColor: resolvedActiveColor, transform: [{ translateX: maxHandlePos }] }]} />
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
