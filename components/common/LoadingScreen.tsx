import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';

// 스플래시 애니메이션 파라미터
const FADE_IN_MS = 400;   // 페이드인 구간
const ZOOM_FADE_MS = 2800; // 확대+페이드아웃 구간
const GAP_MS = 400;        // 리셋 인터벌 (불가시 구간)

export function LoadingScreen() {
  const scale = useSharedValue(1.0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // scale: 페이드인 동안 1.0 유지 → 확대·페이드아웃 동안 1.0→1.4 → 불가시 구간에서 1.0으로 복원
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: FADE_IN_MS }),
        withTiming(1.4, { duration: ZOOM_FADE_MS, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: GAP_MS }),
      ),
      -1,
      false,
    );

    // opacity: 페이드인 → 페이드아웃 → 불가시 갭
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: ZOOM_FADE_MS, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: GAP_MS }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GradientBackground overlay overlayOpacity={0.45}>
      <View style={styles.center}>
        <Animated.Image
          source={require('@/assets/images/logo/main_logo.png')}
          style={[styles.logo, animStyle]}
          resizeMode="contain"
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

