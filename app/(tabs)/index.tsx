import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Image, FlatList, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
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
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useThemeColors, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { formatRemainingTimeLong, formatTimerPrecise, msUntilAlarm, msUntilSpecificDate } from '@/utils/formatTime';
import { Preset } from '@/types';

// 프리셋 ID → 이미지 매핑
const PRESET_IMAGES: Record<string, ImageSourcePropType> = {
  'preset-rain-night': require('@/assets/images/presets/rainy_presets.png'),
  'preset-forest-night': require('@/assets/images/presets/forest_persets.png'),
  'preset-campfire': require('@/assets/images/presets/campfire_presets.png'),
  'preset-warm-fireplace': require('@/assets/images/presets/fire_presets.png'),
  'preset-cafe': require('@/assets/images/presets/cafe_presets.png'),
};

export default function HomeScreen() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const {
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
  const [presetPickerVisible, setPresetPickerVisible] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const currentPreset = allPresets[selectedPresetIndex] ?? allPresets[0];
  const currentPresetImage = currentPreset
    ? PRESET_IMAGES[currentPreset.id] ?? (currentPreset.imageUri ? { uri: currentPreset.imageUri } : null)
    : null;

  // Timer remaining
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

  const timerPrecise = formatTimerPrecise(timerRemaining);
  const isUnlimited = timer.isActive && timer.durationMinutes >= 99999;
  const isAlarmSync = timer.isActive && timer.isAlarmSync;
  const timerUnitLabel = timerRemaining > 0 && !isUnlimited && !isAlarmSync
    ? (timerRemaining >= 3600000 ? t('home.hourMinLabel') : t('home.minSecLabel'))
    : '';

  // Progress for circular ring (0 to 1)
  const timerProgress = useMemo(() => {
    if (!timer.isActive || isUnlimited || isAlarmSync || timer.durationMinutes <= 0) return 0;
    const totalMs = timer.durationMinutes * 60_000;
    return Math.max(0, Math.min(1, 1 - timerRemaining / totalMs));
  }, [timer.isActive, isUnlimited, isAlarmSync, timer.durationMinutes, timerRemaining]);

  // Next alarm — recompute on alarm changes + every 60s
  const [alarmCountdownText, setAlarmCountdownText] = useState<string | null>(null);
  useEffect(() => {
    const compute = () => {
      const enabled = alarms.filter((a) => a.enabled);
      const best = enabled.reduce<{ ms: number } | null>((acc, a) => {
        const ms = a.specificDate
          ? msUntilSpecificDate(a.specificDate, a.time.hour, a.time.minute)
          : msUntilAlarm(a.time.hour, a.time.minute);
        if (ms <= 0) return acc;
        if (!acc || ms < acc.ms) return { ms };
        return acc;
      }, null);
      if (best && best.ms > 0) {
        setAlarmCountdownText(t('home.alarmCountdown', { time: formatRemainingTimeLong(best.ms) }));
      } else {
        setAlarmCountdownText(null);
      }
    };
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [alarms, t]);

  // Colon blink animation
  const colonOpacity = useSharedValue(1);
  useEffect(() => {
    if (isPlaying && timerRemaining > 0) {
      colonOpacity.value = withRepeat(
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      colonOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isPlaying, timerRemaining > 0]);

  // Pulse animation
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

  // Background fade
  const bgOpacity = useSharedValue(0);
  useEffect(() => {
    bgOpacity.value = withTiming(currentPresetImage != null ? 1 : 0, {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentPresetImage]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      stop();
    } else if (currentPreset) {
      applyPreset(currentPreset);
      // 타이머 미설정 시 자동으로 15분 타이머 시작
      if (!timer.isActive) {
        startTimer(15);
      }
    } else {
      play();
      if (!timer.isActive) {
        startTimer(15);
      }
    }
  };

  const handlePresetSelect = useCallback(
    (preset: Preset, index: number) => {
      setSelectedPresetIndex(index);
      setPresetPickerVisible(false);
      // 재생 중이면 새 프리셋으로 크로스페이드 전환
      if (isPlaying) {
        applyPreset(preset);
      }
    },
    [isPlaying, applyPreset],
  );

  const handleTimerStart = (minutes: number, alarmSync?: boolean) => {
    startTimer(minutes, alarmSync);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background: preset image — center-crop, no margins */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]} pointerEvents="none">
        {currentPresetImage != null && (
          <>
            <Image
              source={currentPresetImage as number}
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
              resizeMode="cover"
            />
            <View style={styles.bgOverlay} />
          </>
        )}
      </Animated.View>

      <View style={styles.content}>
        {/* Timer Display — circular progress ring */}
        <Pressable style={styles.timerContainer} onPress={() => setTimerModalVisible(true)}>
          <View style={styles.ringWrapper}>
            <Svg width={200} height={200} style={{ position: 'absolute' }}>
              {/* Background ring */}
              <Circle
                cx={100}
                cy={100}
                r={88}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={8}
                fill="none"
              />
              {/* Progress ring */}
              {timerProgress > 0 && (
                <Circle
                  cx={100}
                  cy={100}
                  r={88}
                  stroke={themeColors.accent1}
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - timerProgress)}`}
                  rotation={-90}
                  origin="100,100"
                />
              )}
            </Svg>
            {/* Timer content inside ring */}
            <View style={styles.ringContent}>
              {isUnlimited ? (
                <Text style={styles.timerTime}>∞</Text>
              ) : isAlarmSync ? (
                <MaterialIcons name="alarm" size={48} color="rgba(255,255,255,0.9)" />
              ) : (
                <View style={styles.timerRow}>
                  <Text style={styles.timerTime}>{timerPrecise.left}</Text>
                  <Animated.Text style={[styles.timerColon, { opacity: colonOpacity }]}>:</Animated.Text>
                  <Text style={styles.timerTime}>{timerPrecise.right}</Text>
                </View>
              )}
              {timerUnitLabel ? (
                <Text style={styles.timerLabel}>{timerUnitLabel}</Text>
              ) : isAlarmSync ? (
                <Text style={styles.timerLabel}>{t('timer.alarmSync')}</Text>
              ) : (
                <Text style={styles.timerLabel}>{t('home.sleepTimer')}</Text>
              )}
            </View>
          </View>
          {alarmCountdownText && (
            <Text style={styles.alarmHint}>{alarmCountdownText}</Text>
          )}
        </Pressable>

        <View style={{ flex: 1 }} />

        {/* Now Playing Card — glass pill */}
        <View style={styles.nowPlayingCard}>
          <Pressable
            style={styles.nowPlayingInfo}
            onPress={() => setPresetPickerVisible(true)}
          >
            <Text style={styles.nowPlayingName} numberOfLines={1}>
              {currentPreset ? (currentPreset.isDefault ? t(`defaultPresets.${currentPreset.id}`, { defaultValue: currentPreset.name }) : currentPreset.name) : t('home.presetSelect')}
            </Text>
            <Text style={styles.nowPlayingDesc} numberOfLines={1}>
              {currentPreset ? (currentPreset.isDefault ? t(`defaultPresets.${currentPreset.id}-desc`, { defaultValue: currentPreset.description }) : currentPreset.description) : t('home.tapToSelect')}
            </Text>
          </Pressable>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
              style={[
                styles.playBtn,
                { backgroundColor: soundCount > 0 || currentPreset ? themeColors.accent1 : themeColors.bgTertiary, shadowColor: themeColors.accent1 },
              ]}
              onPress={handlePlayToggle}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={28}
                color="#ffffff"
              />
            </Pressable>
          </Animated.View>
        </View>

        {/* Master Volume — glass panel */}
        <View style={styles.volumePanel}>
          <Text style={styles.volumeLabel}>{t('home.masterVolume')}</Text>
          <View style={styles.volumeRow}>
            <MaterialIcons name="volume-down" size={20} color="rgba(255,255,255,0.7)" />
            <View style={{ flex: 1 }}>
              <Slider
                value={masterVolume}
                onValueChange={setVolume}
                activeColor={themeColors.accent1}
              />
            </View>
            <MaterialIcons name="volume-up" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </View>

      {/* Timer Modal */}
      <TimerModal
        visible={timerModalVisible}
        onClose={() => setTimerModalVisible(false)}
        onStart={handleTimerStart}
      />

      {/* Preset Picker Bottom Sheet */}
      <BottomSheet
        visible={presetPickerVisible}
        onClose={() => setPresetPickerVisible(false)}
        maxHeightPct={0.6}
      >
        <Text style={styles.pickerTitle}>{t('home.presetSelect')}</Text>
        <FlatList
          data={allPresets}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          renderItem={({ item, index }) => (
            <Pressable
              style={[
                styles.pickerItem,
                index === selectedPresetIndex && styles.pickerItemActive,
              ]}
              onPress={() => handlePresetSelect(item, index)}
            >
              {(PRESET_IMAGES[item.id] || item.imageUri) ? (
                <Image
                  source={PRESET_IMAGES[item.id] ?? { uri: item.imageUri! }}
                  style={styles.pickerItemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.pickerItemImage, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerItemName}>{item.isDefault ? t(`defaultPresets.${item.id}`, { defaultValue: item.name }) : item.name}</Text>
                <Text style={styles.pickerItemDesc} numberOfLines={1}>
                  {item.isDefault ? t(`defaultPresets.${item.id}-desc`, { defaultValue: item.description }) : item.description}
                </Text>
              </View>
              {index === selectedPresetIndex && (
                <MaterialIcons name="check-circle" size={20} color="#ffffff" />
              )}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.xl,
    paddingBottom: layout.tabBarHeight + 16,
    gap: spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  ringWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerTime: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  timerColon: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    marginHorizontal: 2,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  alarmHint: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  nowPlayingCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    height: 80,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nowPlayingInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
  },
  nowPlayingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  nowPlayingDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#456eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 6,
  },
  volumePanel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 8,
  },
  volumeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pickerItemActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  pickerItemImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  pickerItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  pickerItemDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
});


