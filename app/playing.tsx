import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Brightness from 'expo-brightness';
import { useAudio } from '@/hooks/useAudio';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useThemeColors, typography } from '@/theme';
import { formatRemainingTime, getCurrentTimeString } from '@/utils/formatTime';
import { useTranslation } from 'react-i18next';

const SHOW_DURATION = 3000; // 3초 후 다시 어두워짐
const DIM_BRIGHTNESS = 0.01; // 수면 화면 최소 밝기

export default function PlayingScreen() {
  const router = useRouter();
  const { isPlaying, stop, soundCount } = useAudio();
  const timer = useTimerStore();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const autoDim = useSettingsStore((s) => s.settings.autoDimBrightness);

  const [clock, setClock] = useState(getCurrentTimeString());
  const [timerText, setTimerText] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: '#000000' },
        content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
        clock: { fontFamily: 'monospace', fontSize: 60, fontWeight: '200', color: themeColors.white, letterSpacing: 4 },
        timer: { fontFamily: 'monospace', fontSize: 18, color: themeColors.accent2 },
        stopArea: { alignItems: 'center', paddingBottom: 60, gap: 8 },
        stopBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
        stopIcon: { color: themeColors.white, fontSize: 20 },
        stopHint: { fontSize: 12, color: 'rgba(255,255,255,0.15)' },
      }),
    [themeColors],
  );

  // Opacity: 탭하면 0.6, 3초 후 0.1로
  const opacity = useSharedValue(0.1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    const id = setInterval(() => setClock(getCurrentTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!timer.isActive) {
      setTimerText('');
      return;
    }
    const id = setInterval(() => {
      const remaining = timer.endTime - Date.now();
      if (remaining <= 0) {
        setTimerText('');
      } else {
        setTimerText(formatRemainingTime(remaining));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timer.isActive, timer.endTime]);

  // 자동 밝기 감소: 수면 화면 진입 시 밝기 최소화, 이탈 시 복원
  const savedBrightness = useRef<number | null>(null);
  useEffect(() => {
    if (!autoDim) return;
    let cancelled = false;
    (async () => {
      try {
        const current = await Brightness.getBrightnessAsync();
        if (cancelled) return;
        savedBrightness.current = current;
        await Brightness.setBrightnessAsync(DIM_BRIGHTNESS);
      } catch {}
    })();
    return () => {
      cancelled = true;
      if (savedBrightness.current !== null) {
        Brightness.setBrightnessAsync(savedBrightness.current).catch(() => {});
        savedBrightness.current = null;
      }
    };
  }, [autoDim]);

  // 재생이 중지되면 자동으로 나가기
  useEffect(() => {
    if (!isPlaying && soundCount === 0) {
      const id = setTimeout(() => router.back(), 500);
      return () => clearTimeout(id);
    }
  }, [isPlaying, soundCount]);

  const handleTap = () => {
    opacity.value = withTiming(0.6, { duration: 300, easing: Easing.out(Easing.ease) });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      opacity.value = withTiming(0.1, { duration: 1000, easing: Easing.in(Easing.ease) });
    }, SHOW_DURATION);
  };

  const handleLongPress = async () => {
    await stop();
    router.back();
  };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <StatusBar hidden />

      <Animated.View style={[styles.content, opacityStyle]}>
        {/* Clock */}
        <Text style={styles.clock}>{clock}</Text>

        {/* Timer */}
        {timerText ? (
          <Text style={styles.timer}>{timerText}</Text>
        ) : null}
      </Animated.View>

      {/* Stop button (always at bottom) */}
      <Animated.View style={[styles.stopArea, opacityStyle]}>
        <Pressable
          style={styles.stopBtn}
          onLongPress={handleLongPress}
          delayLongPress={800}
        >
          <Text style={styles.stopIcon}>■</Text>
        </Pressable>
        <Text style={styles.stopHint}>{t('playing.longPressToStop')}</Text>
      </Animated.View>
    </Pressable>
  );
}


