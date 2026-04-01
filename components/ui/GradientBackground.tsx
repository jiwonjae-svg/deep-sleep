import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export type GradientDef = {
  colors: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

const DEFAULT_GRADIENTS: GradientDef[] = [
  { colors: ['#2d1b69', '#11998e'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  { colors: ['#0f3460', '#e94560', '#1a1a2e'], start: { x: 0, y: 0.3 }, end: { x: 1, y: 0.7 } },
  { colors: ['#134e5e', '#71b280'], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  { colors: ['#1a1a2e', '#456eea', '#0f3460'], start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  { colors: ['#0d0221', '#0a7e8c', '#1b0845'], start: { x: 0, y: 0 }, end: { x: 1, y: 0.8 } },
  { colors: ['#16213e', '#e94560', '#533483'], start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  { colors: ['#1a1a2e', '#2d1b69', '#11998e'], start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  { colors: ['#0b0f19', '#456eea', '#134e5e'], start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
];

interface GradientBackgroundProps {
  gradients?: GradientDef[];
  duration?: number;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({
  children,
  gradients = DEFAULT_GRADIENTS,
  duration = 8000,
  overlay = true,
  overlayOpacity = 0.4,
  style,
}: GradientBackgroundProps) {
  const showARef = useRef(true);
  const indexARef = useRef(0);
  const indexBRef = useRef(1 % gradients.length);
  const opacityB = useSharedValue(0);

  const [gradA, setGradA] = useState(gradients[0]);
  const [gradB, setGradB] = useState(gradients[1 % gradients.length]);

  const advance = useCallback(() => {
    if (showARef.current) {
      indexBRef.current = (indexARef.current + 1) % gradients.length;
      setGradB(gradients[indexBRef.current]);
      showARef.current = false;
      opacityB.value = withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      indexARef.current = (indexBRef.current + 1) % gradients.length;
      setGradA(gradients[indexARef.current]);
      showARef.current = true;
      opacityB.value = withTiming(0, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [gradients, opacityB]);

  useEffect(() => {
    const timer = setInterval(advance, duration);
    return () => clearInterval(timer);
  }, [duration, advance]);

  const animatedStyleB = useAnimatedStyle(() => ({
    opacity: opacityB.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradA.colors}
        start={gradA.start ?? { x: 0, y: 0 }}
        end={gradA.end ?? { x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyleB]}>
        <LinearGradient
          colors={gradB.colors}
          start={gradB.start ?? { x: 0, y: 0 }}
          end={gradB.end ?? { x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {overlay && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000', opacity: overlayOpacity },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
