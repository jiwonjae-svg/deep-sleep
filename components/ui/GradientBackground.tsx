import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const DEFAULT_GRADIENTS: [string, string][] = [
  ['#2d1b69', '#11998e'],
  ['#8e2de2', '#4a00e0'],
  ['#0f3460', '#e94560'],
  ['#134e5e', '#71b280'],
];

interface GradientBackgroundProps {
  gradients?: [string, string][];
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

  const [colorsA, setColorsA] = useState(gradients[0]);
  const [colorsB, setColorsB] = useState(gradients[1 % gradients.length]);

  const advance = useCallback(() => {
    if (showARef.current) {
      indexBRef.current = (indexARef.current + 1) % gradients.length;
      setColorsB(gradients[indexBRef.current]);
      showARef.current = false;
      opacityB.value = withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      indexARef.current = (indexBRef.current + 1) % gradients.length;
      setColorsA(gradients[indexARef.current]);
      showARef.current = true;
      opacityB.value = withTiming(0, {
        duration: 2000,
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
        colors={colorsA}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyleB]}>
        <LinearGradient
          colors={colorsB}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
