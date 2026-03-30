import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { Slider } from '@/components/ui/Slider';
import { MascotImage } from '@/components/common/MascotImage';
import { AIRecommendButton } from '@/components/ai/AIRecommendButton';
import { TimerModal } from '@/components/ui/TimerModal';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { formatRemainingTime, msUntilAlarm, getCurrentTimeString } from '@/utils/formatTime';
import { getSoundById } from '@/data/sounds';

export default function HomeScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const {
    activeSounds,
    isPlaying,
    masterVolume,
    activePresetId,
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
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const [timerModalVisible, setTimerModalVisible] = useState(false);

  // Clock
  const [clock, setClock] = useState(getCurrentTimeString());
  useEffect(() => {
    const id = setInterval(() => setClock(getCurrentTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  // Timer remaining
  const [timerText, setTimerText] = useState('');
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

  // Current preset name
  const currentPreset =
    activePresetId != null
      ? [...presets.defaultPresets, ...presets.customPresets].find((p) => p.id === activePresetId)
      : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: layout.screenPaddingH,
          height: layout.headerHeight,
        },
        logo: { ...typography.h3, color: themeColors.textPrimary },
        nextAlarm: { ...typography.caption, color: themeColors.accent2 },
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
        presetCard: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          padding: layout.cardPadding,
          width: '100%',
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        presetName: { ...typography.h3, color: themeColors.textPrimary },
        presetIcons: { flexDirection: 'row', alignItems: 'center' },
        presetEmoji: { fontSize: 16, marginRight: 2 },
        presetMeta: { ...typography.caption, color: themeColors.textMuted },
        timerText: { ...typography.bodyMedium, color: themeColors.accent2 },
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
        presetNameLabel: { ...typography.caption, color: themeColors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
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
    [themeColors],
  );

  const handleTimerStart = async (minutes: number, preset: import('@/types').Preset | null) => {
    if (preset) {
      await applyPreset(preset);
    }
    startTimer(minutes);
  };

  const handlePlayToggle = async () => {
    if (isPlaying) {
      await stop();
    } else {
      await play();
      router.push('/playing');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🐻 Deep Sleep</Text>
      </View>

      <View style={styles.content}>
        {/* Clock */}
        <Text style={styles.clock}>{clock}</Text>

        {/* Mascot */}
        <MascotImage pose={isPlaying ? 'sleeping' : 'yawning'} size={180} />

        {/* 알람 카운트다운 */}
        {nextAlarm && (
          <Text style={styles.alarmCountdown}>
            {formatRemainingTime(nextAlarm.ms)} 뒤에 알람이 울립니다.
          </Text>
        )}

        {/* Current preset card */}
        {currentPreset && (
          <Pressable style={styles.presetCard} onPress={() => router.push('/presets')}>
            <Text style={styles.presetName}>{currentPreset.name}</Text>
            <View style={styles.presetIcons}>
              {currentPreset.sounds.slice(0, 5).map((s) => (
                <Text key={s.soundId} style={styles.presetEmoji}>
                  {getSoundById(s.soundId)?.iconEmoji ?? '🔊'}
                </Text>
              ))}
              <Text style={styles.presetMeta}> · {currentPreset.sounds.length} 소리</Text>
            </View>
          </Pressable>
        )}

        {soundCount === 0 && !currentPreset && (
          <Pressable style={styles.presetCard} onPress={() => router.push('/mixer')}>
            <Text style={styles.presetName}>소리를 선택해주세요</Text>
            <Text style={styles.presetMeta}>믹서에서 소리를 추가하세요</Text>
          </Pressable>
        )}

        {/* Timer */}
        {timer.isActive && timerText ? (
          <Pressable onPress={() => timer.cancelTimer()}>
            <Text style={styles.timerText}>타이머: {timerText} (탭하여 취소)</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.timerButton} onPress={() => setTimerModalVisible(true)}>
            <Text style={styles.timerButtonText}>⏱ 타이머 설정</Text>
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
        {currentPreset && (
          <Text style={styles.presetNameLabel}>{currentPreset.name}</Text>
        )}

        {/* Master volume */}
        <View style={styles.volumeRow}>
          <Text style={styles.volumeIcon}>🔈</Text>
          <View style={{ flex: 1 }}>
            <Slider value={masterVolume} onValueChange={setVolume} activeColor={themeColors.accent2} />
          </View>
          <Text style={styles.volumeIcon}>🔊</Text>
        </View>

        {/* AI Recommend */}
        <AIRecommendButton
          isPremium={isPremium}
          onPress={() => {
            if (isPremium) {
              // TODO: open AI input sheet
            } else {
              router.push('/subscription');
            }
          }}
        />
      </View>

      <TimerModal
        visible={timerModalVisible}
        onClose={() => setTimerModalVisible(false)}
        onStart={handleTimerStart}
      />
    </SafeAreaView>
  );
}


