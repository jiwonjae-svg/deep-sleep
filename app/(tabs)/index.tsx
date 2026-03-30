import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Image, FlatList, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAudio } from '@/hooks/useAudio';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { Slider } from '@/components/ui/Slider';
import { TimerModal } from '@/components/ui/TimerModal';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { formatRemainingTime, msUntilAlarm, getCurrentTimeString } from '@/utils/formatTime';
import { getSoundById } from '@/data/sounds';

// 프리셋 ID → 이미지 매핑 (정적 require)
const PRESET_IMAGES: Record<string, ReturnType<typeof require>> = {
  'preset-rain-night': require('@/assets/images/presets/rainy_presets.png'),
  'preset-forest-night': require('@/assets/images/presets/forest_persets.png'),
  'preset-campfire': require('@/assets/images/presets/campfire_presets.png'),
  'preset-warm-fireplace': require('@/assets/images/presets/fire_presets.png'),
  'preset-cafe': require('@/assets/images/presets/cafe_presets.png'),
};

export default function HomeScreen() {
  const themeColors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - layout.screenPaddingH * 2;
  const {
    activeSounds,
    isPlaying,
    masterVolume,
    soundCount,
    play,
    stop,
    setVolume,
    startTimer,
    applyPreset,
  } = useAudio();

  const alarms = useAlarmStore((s) => s.alarms);
  const timer = useTimerStore();
  const presets = usePresetStore();

  const allPresets = useMemo(
    () => [...presets.defaultPresets, ...presets.customPresets],
    [presets.defaultPresets, presets.customPresets],
  );

  const [timerModalVisible, setTimerModalVisible] = useState(false);

  // 재생 중 배경으로 사용할 프리셋 이미지
  const [playingBgImg, setPlayingBgImg] = useState<ReturnType<typeof require> | null>(null);

  // 현재 화면에 보이는 프리셋 인덱스 추적
  const visiblePresetRef = useRef(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0) {
      visiblePresetRef.current = viewableItems[0].index ?? 0;
    }
  });

  // Clock
  const [clock, setClock] = useState(getCurrentTimeString());
  useEffect(() => {
    const id = setInterval(() => setClock(getCurrentTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  // Timer remaining (재생 중일 때만 카운트다운)
  const [timerRemaining, setTimerRemaining] = useState(0);
  useEffect(() => {
    if (!timer.isActive) {
      setTimerRemaining(0);
      return;
    }
    setTimerRemaining(Math.max(0, timer.endTime - Date.now()));
  }, [timer.isActive, timer.endTime]);

  useEffect(() => {
    if (!timer.isActive || !isPlaying) return;
    const id = setInterval(() => {
      setTimerRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timer.isActive, isPlaying]);

  const timerText = timerRemaining > 0 ? formatRemainingTime(timerRemaining) : '';

  // Next alarm
  const nextAlarm = alarms
    .filter((a) => a.enabled)
    .reduce<{ alarm: typeof alarms[0]; ms: number } | null>((best, a) => {
      const ms = msUntilAlarm(a.time.hour, a.time.minute);
      if (!best || ms < best.ms) return { alarm: a, ms };
      return best;
    }, null);

  // Pulse animation for play button
  const scale = useSharedValue(1);
  useEffect(() => {
    if (isPlaying) {
      scale.value = withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isPlaying]);

  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 배경 fade 애니메이션
  const bgOpacity = useSharedValue(0);
  useEffect(() => {
    bgOpacity.value = withTiming(isPlaying && playingBgImg != null ? 1 : 0, {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isPlaying, playingBgImg]);
  const bgAnimStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const hasBgImg = isPlaying && playingBgImg != null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
        header: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: layout.screenPaddingH,
          height: layout.headerHeight,
        },
        logoImage: {
          height: layout.headerHeight * 0.7,
          width: 160,
        },
        content: {
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: layout.screenPaddingH,
          gap: spacing.lg,
        },
        clock: {
          fontFamily: 'monospace',
          fontSize: 40,
          fontWeight: '700',
          color: themeColors.textPrimary,
          letterSpacing: 2,
        },
        // Preset carousel card
        presetCarouselCard: {
          width: cardWidth,
          borderRadius: layout.borderRadiusMd,
          overflow: 'hidden',
          backgroundColor: themeColors.glassLight,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        presetCarouselCardActive: {
          borderColor: themeColors.accent1,
          borderWidth: 2,
        },
        presetCardImage: {
          width: cardWidth,
          height: 150,
        },
        presetCardBody: {
          padding: spacing.md,
          gap: spacing.xs,
        },
        presetCardName: { ...typography.h3, color: themeColors.textPrimary },
        presetCardDesc: { ...typography.caption, color: themeColors.textSecondary },
        presetCardSounds: { ...typography.caption, color: themeColors.textMuted },
        timerText: { ...typography.bodyMedium, color: themeColors.accent1 },
        playBtn: {
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 8,
        },
        playIcon: { color: '#ffffff', fontSize: 28, marginLeft: 4 },
        volumeRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: spacing.md },
        volumeIcon: { fontSize: 18 },
        alarmCountdown: { ...typography.caption, color: themeColors.textSecondary, textAlign: 'center' },
        timerButton: {
          backgroundColor: themeColors.glassLight,
          borderRadius: 16,
          paddingVertical: 8,
          paddingHorizontal: spacing.lg,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        timerButtonText: { ...typography.caption, color: themeColors.textSecondary },
      }),
    [themeColors, cardWidth],
  );

  const handleTimerStart = (minutes: number) => {
    const preset = allPresets[visiblePresetRef.current];
    if (preset) applyPreset(preset);
    startTimer(minutes);
    play();
  };

  const renderPresetCard = useCallback(
    ({ item: preset }: { item: import('@/types').Preset }) => {
      const img = PRESET_IMAGES[preset.id];
      const soundNames = preset.sounds
        .map((s) => getSoundById(s.soundId)?.name ?? s.soundId)
        .join(', ');
      return (
        <View
          style={styles.presetCarouselCard}
        >
          {img ? (
            <Image
              source={img}
              style={styles.presetCardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.presetCardImage, { backgroundColor: themeColors.glassLight, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 40 }}>{preset.name.split(' ')[0]}</Text>
            </View>
          )}
          <View style={[
              styles.presetCardBody,
              isPlaying && playingBgImg != null ? { backgroundColor: 'rgba(0,0,0,0.35)' } : null,
            ]}>
            <Text style={[styles.presetCardName, isPlaying && playingBgImg != null ? { color: '#ffffff' } : null]} numberOfLines={1}>{preset.name}</Text>
            <Text style={[styles.presetCardDesc, isPlaying && playingBgImg != null ? { color: 'rgba(255,255,255,0.7)' } : null]} numberOfLines={1}>{preset.description}</Text>
            <Text style={[styles.presetCardSounds, isPlaying && playingBgImg != null ? { color: 'rgba(255,255,255,0.5)' } : null]} numberOfLines={1}>{soundNames}</Text>
          </View>
        </View>
      );
    },
    [styles, themeColors, isPlaying, playingBgImg],
  );

  const handlePlayToggle = () => {
    if (isPlaying) {
      stop();
      setPlayingBgImg(null);
    } else {
      const preset = allPresets[visiblePresetRef.current];
      if (preset) {
        applyPreset(preset);
        setPlayingBgImg(PRESET_IMAGES[preset.id] ?? null);
      }
      play();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 재생 중 배경 이미지 (블러 + 오버레이) */}
      <Animated.View style={[StyleSheet.absoluteFill, bgAnimStyle]} pointerEvents="none">
        {playingBgImg != null && (
          <>
            <Image source={playingBgImg as number} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={20} />
            <View style={styles.bgOverlay} />
          </>
        )}
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo/main_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        {/* Clock */}
        <Text style={[styles.clock, hasBgImg && { color: '#ffffff' }]}>{clock}</Text>

        {/* 프리셋 캐러셀 (마스코트 대체) */}
        <FlatList
          data={allPresets}
          horizontal
          pagingEnabled
          snapToInterval={cardWidth + spacing.sm}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderPresetCard}
          ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
          scrollEnabled={!isPlaying}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          style={{ flexGrow: 0, width: cardWidth }}
        />

        {/* 알람 카운트다운 */}
        {nextAlarm && (
          <Text style={[styles.alarmCountdown, hasBgImg && { color: 'rgba(255,255,255,0.75)' }]}>
            {formatRemainingTime(nextAlarm.ms)} 뒤에 알람이 울립니다.
          </Text>
        )}

        {/* Timer */}
        {timer.isActive && timerText ? (
          <Text style={[styles.timerText, hasBgImg && { color: '#ffffff' }]}>
            {timerText} 동안 소리가 나옵니다.
          </Text>
        ) : (
          <Pressable style={styles.timerButton} onPress={() => setTimerModalVisible(true)}>
            <Text style={styles.timerButtonText}>⏱ 수면 타이머</Text>
          </Pressable>
        )}

        {/* Play button */}
        <Animated.View style={playBtnAnimStyle}>
          <Pressable onPress={handlePlayToggle} disabled={soundCount === 0}>
            <LinearGradient
              colors={soundCount > 0 ? [themeColors.accent1, themeColors.accent2] : [themeColors.textMuted, themeColors.textMuted]}
              style={styles.playBtn}
            >
              <Text style={styles.playIcon}>{isPlaying ? '■' : '▶'}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
        {/* Master volume */}
        <View style={styles.volumeRow}>
          <Text style={styles.volumeIcon}>🔈</Text>
          <View style={{ flex: 1 }}>
            <Slider value={masterVolume} onValueChange={setVolume} activeColor={themeColors.accent1} />
          </View>
          <Text style={styles.volumeIcon}>🔊</Text>
        </View>
      </View>

      <TimerModal
        visible={timerModalVisible}
        onClose={() => setTimerModalVisible(false)}
        onStart={handleTimerStart}
      />
    </SafeAreaView>
  );
}


