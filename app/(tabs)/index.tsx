import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Image, FlatList, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useThemeColors, spacing, layout } from '@/theme';
import { formatRemainingTime, msUntilAlarm } from '@/utils/formatTime';
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

  const timerText = timerRemaining > 0 ? formatRemainingTime(timerRemaining) : '00:00';

  // Next alarm
  const nextAlarm = alarms
    .filter((a) => a.enabled)
    .reduce<{ alarm: typeof alarms[0]; ms: number } | null>((best, a) => {
      const ms = msUntilAlarm(a.time.hour, a.time.minute);
      if (!best || ms < best.ms) return { alarm: a, ms };
      return best;
    }, null);

  const alarmCountdownText = nextAlarm
    ? `${formatRemainingTime(nextAlarm.ms)} 뒤에 알람이 울립니다`
    : null;

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
  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Background fade
  const bgOpacity = useSharedValue(0);
  useEffect(() => {
    bgOpacity.value = withTiming(currentPresetImage != null ? 1 : 0, {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentPresetImage]);
  const bgAnimStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  const handlePlayToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      if (currentPreset) applyPreset(currentPreset);
      play();
    }
  };

  const handlePresetSelect = useCallback(
    (preset: Preset, index: number) => {
      setSelectedPresetIndex(index);
      applyPreset(preset);
      setPresetPickerVisible(false);
      if (!isPlaying) play();
    },
    [applyPreset, isPlaying, play],
  );

  const handleTimerStart = (minutes: number) => {
    if (currentPreset) applyPreset(currentPreset);
    startTimer(minutes);
    play();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background: preset image — center-crop, no margins */}
      <Animated.View style={[StyleSheet.absoluteFill, bgAnimStyle]} pointerEvents="none">
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
        {/* Timer Display — glass pill */}
        <Pressable style={styles.timerDisplay} onPress={() => setTimerModalVisible(true)}>
          <Text style={styles.timerTime}>{timerText}</Text>
          <Text style={styles.timerLabel}>수면 타이머</Text>
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
              {currentPreset?.name ?? '프리셋 선택'}
            </Text>
            <Text style={styles.nowPlayingDesc} numberOfLines={1}>
              {currentPreset?.description ?? '탭하여 선택'}
            </Text>
          </Pressable>
          <Animated.View style={playBtnAnimStyle}>
            <Pressable
              style={[
                styles.playBtn,
                { backgroundColor: soundCount > 0 || currentPreset ? themeColors.accent1 : themeColors.bgTertiary },
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
          <Text style={styles.volumeLabel}>마스터 볼륨</Text>
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
        <Text style={styles.pickerTitle}>프리셋 선택</Text>
        <FlatList
          data={allPresets}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
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
                <Text style={styles.pickerItemName}>{item.name}</Text>
                <Text style={styles.pickerItemDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
              {index === selectedPresetIndex && (
                <MaterialIcons name="check-circle" size={20} color={themeColors.accent1} />
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
  timerDisplay: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
  },
  timerTime: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  alarmHint: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 4,
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


