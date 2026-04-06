import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useBreathingStore, BREATHING_PATTERNS } from '@/stores/useBreathingStore';
import { useThemeColors } from '@/theme';

const PHASE_COLORS: Record<string, string> = {
  inhale: '#5B9BD5',
  hold: '#6BCB77',
  exhale: '#FF8C42',
};

export function BreathingCircle() {
  const themeColors = useThemeColors();
  const { isSessionActive, selectedPatternId, currentPhaseIndex, phaseRemainingSec } =
    useBreathingStore();

  const pattern = useMemo(
    () => BREATHING_PATTERNS.find((p) => p.id === selectedPatternId),
    [selectedPatternId],
  );

  const scale = useSharedValue(0.4);
  const bgOpacity = useSharedValue(0.3);

  const currentPhase = pattern?.phases[currentPhaseIndex];

  useEffect(() => {
    if (!isSessionActive || !currentPhase) {
      scale.value = withTiming(0.4, { duration: 300, easing: Easing.out(Easing.ease) });
      bgOpacity.value = withTiming(0.3, { duration: 300 });
      return;
    }

    const dur = currentPhase.durationSec * 1000;
    switch (currentPhase.type) {
      case 'inhale':
        scale.value = withTiming(1.0, { duration: dur, easing: Easing.inOut(Easing.ease) });
        bgOpacity.value = withTiming(0.8, { duration: dur });
        break;
      case 'hold':
        // keep current scale
        break;
      case 'exhale':
        scale.value = withTiming(0.4, { duration: dur, easing: Easing.inOut(Easing.ease) });
        bgOpacity.value = withTiming(0.3, { duration: dur });
        break;
    }
  }, [isSessionActive, currentPhaseIndex, currentPhase]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: bgOpacity.value,
  }));

  const phaseColor = currentPhase ? PHASE_COLORS[currentPhase.type] : themeColors.accent1;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: phaseColor, borderColor: phaseColor },
          animatedCircleStyle,
        ]}
      />
      <View style={styles.centerContent}>
        <Text style={styles.countdown}>{phaseRemainingSec}</Text>
        {isSessionActive && (
          <Text style={styles.secondLabel}>초</Text>
        )}
        {currentPhase && (
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>
            {currentPhase.label}
          </Text>
        )}
      </View>
    </View>
  );
}

const SIZE = 240;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
  },
  centerContent: {
    alignItems: 'center',
  },
  countdown: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  secondLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: -4,
    marginBottom: 4,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
