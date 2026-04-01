import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAudio } from '@/hooks/useAudio';
import { useAI } from '@/hooks/useAI';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { CategoryTabs } from '@/components/sound/CategoryTabs';
import { SoundGrid } from '@/components/sound/SoundGrid';
import { SoundDetailSheet } from '@/components/sound/SoundDetailSheet';
import { AIRecommendButton } from '@/components/ai/AIRecommendButton';
import { AIInputSheet } from '@/components/ai/AIInputSheet';
import { AIResultPreview } from '@/components/ai/AIResultPreview';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Slider } from '@/components/ui/Slider';
import { SoundCategory, SoundConfig, ActiveSoundState, AIPresetResult } from '@/types';
import { getSoundsByCategory, getSoundById } from '@/data/sounds';
import { getCategoryById } from '@/data/categories';
import { useThemeColors } from '@/theme';
import { typography } from '@/theme';

// ??? Pulsing ring ????????????????????????????????????????????????????????????
function PulseRing({ delay, size, color }: { delay: number; size: number; color: string }) {
  const opacity = useSharedValue(0.5);
  const scale = useSharedValue(1);
  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.4, { duration: 2000, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      );
    };
    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

// ??? Active sound mixer row ???????????????????????????????????????????????????
function ActiveSoundRow({
  soundId,
  state,
  themeColors,
  onRowPress,
  onVolumeChange,
}: {
  soundId: string;
  state: ActiveSoundState;
  themeColors: ReturnType<typeof useThemeColors>;
  onRowPress: () => void;
  onVolumeChange: (v: number) => void;
}) {
  const meta = getSoundById(soundId);
  const avg = Math.round((state.volumeMin + state.volumeMax) / 2);
  return (
    <Pressable onPress={onRowPress}>
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 32,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          height: 68,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>{meta?.iconEmoji ?? '🎵'}</Text>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
              {meta?.name ?? soundId}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>
              {avg}%
            </Text>
          </View>
          <Slider
            value={avg}
            onValueChange={onVolumeChange}
            trackColor={'rgba(255,255,255,0.08)'}
            activeColor={themeColors.accent1}
            showLabel={false}
          />
        </View>
      </View>
    </Pressable>
  );
}

// ??? Main Screen ?????????????????????????????????????????????????????????????
export default function MixerScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activeSounds, activeSoundsMap, isPlaying, soundCount, toggleSound, play, stop } = useAudio();
  const { recommend, isLoading: aiLoading, isPremium, canCall } = useAI();

  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('rain-water');
  const [detailSound, setDetailSound] = useState<SoundConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [libraryVisible, setLibraryVisible] = useState(false);

  // AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiResultVisible, setAiResultVisible] = useState(false);
  const [aiResult, setAiResult] = useState<AIPresetResult | null>(null);

  const categorySounds = getSoundsByCategory(selectedCategory);
  const categoryInfo = getCategoryById(selectedCategory);
  const categoryColor = categoryInfo?.color ?? themeColors.accent1;

  const activeSoundIds = Array.from(activeSoundsMap.keys());

  // Play button pulse
  const playScale = useSharedValue(1);
  useEffect(() => {
    if (isPlaying) {
      playScale.value = withRepeat(
        withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      playScale.value = withTiming(1, { duration: 200 });
    }
  }, [isPlaying]);
  const playBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: playScale.value }] }));

  const handleCategoryChange = useCallback((cat: SoundCategory) => {
    setSelectedCategory(cat);
  }, []);

  const handleAIPress = useCallback(() => {
    if (!isPremium) { router.push('/subscription'); return; }
    if (!canCall) {
      Alert.alert('일일 시도 한도', 'AI 추천은 하루에 5번까지 사용할 수 있습니다.');
      return;
    }
    setAiSheetVisible(true);
  }, [isPremium, canCall, router]);

  const handleAISubmit = useCallback(async (input: string) => {
    setAiSheetVisible(false);
    const result = await recommend(input);
    if (result) { setAiResult(result); setAiResultVisible(true); }
    else Alert.alert('오류', 'AI 추천에 실패했습니다. 다시 시도해주세요.');
  }, [recommend]);

  const handleAIApply = useCallback(() => {
    if (!aiResult) return;
    const sounds: ActiveSoundState[] = aiResult.sounds.map((s) => ({ ...s, pan: 0 }));
    useAudioStore.getState().setActiveSounds(sounds);
    setAiResultVisible(false);
    setAiResult(null);
  }, [aiResult]);

  const handleAIRetry = useCallback(() => {
    setAiResultVisible(false);
    setAiResult(null);
    setAiSheetVisible(true);
  }, []);

  const handleAISavePreset = useCallback(() => {
    if (!aiResult) return;
    const sounds: ActiveSoundState[] = aiResult.sounds.map((s) => ({ ...s, pan: 0 }));
    const now = Date.now();
    usePresetStore.getState().addPreset({
      id: `ai_${now}`,
      name: aiResult.preset_name,
      description: aiResult.description,
      isDefault: false,
      sounds,
      createdAt: now,
      updatedAt: now,
    });
    setAiResultVisible(false);
    setAiResult(null);
    Alert.alert('저장 완료', `"${aiResult.preset_name}" 프리셋이 저장되었습니다.`);
  }, [aiResult]);

  const handleSoundPress = useCallback(
    (sound: SoundConfig) => {
      const result = toggleSound(sound.id);
      if (result === 'premium_required') router.push('/subscription');
    },
    [toggleSound, router],
  );

  const handleActiveSoundPress = useCallback(
    (soundId: string) => {
      const meta = getSoundById(soundId);
      if (meta) { setDetailSound(meta); setSheetVisible(true); }
    },
    [],
  );

  const handleVolumeChange = useCallback((soundId: string, v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    useAudioStore.getState().updateSoundState(soundId, {
      volumeMin: Math.max(0, clamped - 8),
      volumeMax: Math.min(100, clamped + 8),
    });
  }, []);

  const handlePlayToggle = async () => {
    if (isPlaying) await stop();
    else await play();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        scroll: { flex: 1 },
        sessionLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          marginTop: 20,
          marginBottom: 4,
        },
        sessionTime: {
          fontSize: 32,
          fontWeight: '800',
          color: '#ffffff',
          textAlign: 'center',
        },
        dialZone: {
          alignItems: 'center',
          justifyContent: 'center',
          height: 180,
        },
        dialBtn: {
          width: 80,
          height: 80,
          borderRadius: 16,
          backgroundColor: themeColors.accent1,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 6,
        },
        dialInnerRing: {
          display: 'none',
        },
        dialIcon: {
          fontSize: 28,
          color: '#ffffff',
        },
        sectionRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingHorizontal: 24,
          marginBottom: 12,
        },
        sectionLabel: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        },
        sectionCount: {
          fontSize: 12,
          fontWeight: '600',
          color: themeColors.accent1,
        },
        mixerRows: {
          paddingHorizontal: 24,
          gap: 10,
        },
        addLayerBtn: {
          height: 68,
          marginHorizontal: 24,
          marginTop: 10,
          borderRadius: 32,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: 'rgba(255,255,255,0.15)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        addLayerText: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        },
        aiRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: 24,
          marginTop: 8,
        },
        emptyHint: {
          textAlign: 'center',
          fontSize: 13,
          fontWeight: '500',
          color: 'rgba(255,255,255,0.4)',
          paddingVertical: 8,
        },
        libHeader: {
          paddingBottom: 16,
        },
        libTitle: {
          fontSize: 26,
          fontWeight: '700',
          color: '#ffffff',
        },
        libSubtitle: {
          fontSize: 13,
          fontWeight: '500',
          color: 'rgba(255,255,255,0.7)',
          marginTop: 4,
        },
      }),
    [themeColors],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Session label + time */}
        <Text style={styles.sessionLabel}>현재 세션</Text>
        <Text style={styles.sessionTime}>{soundCount > 0 ? `${soundCount}개 재생 중` : '—'}</Text>

        {/* Circular play dial */}
        <View style={styles.dialZone}>
          {isPlaying && (
            <>
              <PulseRing delay={0} size={200} color={themeColors.accent1} />
              <PulseRing delay={700} size={160} color={themeColors.accent1} />
            </>
          )}
          <Animated.View style={playBtnStyle}>
            <Pressable style={styles.dialBtn} onPress={handlePlayToggle} disabled={soundCount === 0 && !isPlaying}>
              <Text style={styles.dialIcon}>{isPlaying ? '■' : '▶'}</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Active mixer section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>액티브 믹서</Text>
          <Text style={styles.sectionCount}>{soundCount > 0 ? `${soundCount}개 활성` : '비어 있음'}</Text>
        </View>

        <View style={styles.mixerRows}>
          {activeSoundIds.length === 0 ? (
            <Text style={styles.emptyHint}>레이어를 추가해서 소리를 시작하세요</Text>
          ) : (
            activeSoundIds.map((id) => {
              const state = activeSoundsMap.get(id)!;
              return (
                <ActiveSoundRow
                  key={id}
                  soundId={id}
                  state={state}
                  themeColors={themeColors}
                  onRowPress={() => handleActiveSoundPress(id)}
                  onVolumeChange={(v) => handleVolumeChange(id, v)}
                />
              );
            })
          )}
        </View>

        {/* Add Layer button */}
        <Pressable style={styles.addLayerBtn} onPress={() => setLibraryVisible(true)}>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>＋</Text>
          <Text style={styles.addLayerText}>레이어 추가</Text>
        </Pressable>

        {/* AI recommend */}
        <View style={styles.aiRow}>
          <AIRecommendButton isPremium={isPremium} onPress={handleAIPress} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sound Library bottom sheet */}
      <BottomSheet visible={libraryVisible} onClose={() => setLibraryVisible(false)} maxHeightPct={0.85}>
        <View style={styles.libHeader}>
          <Text style={styles.libTitle}>사운드 라이브러리</Text>
          <Text style={styles.libSubtitle}>레이어를 선택해서 사운드스케이프를 만들어보세요.</Text>
        </View>
        <CategoryTabs selectedCategory={selectedCategory} onSelect={handleCategoryChange} />
        <View style={{ flex: 1 }}>
          <SoundGrid
            sounds={categorySounds}
            categoryColor={categoryColor}
            onSoundPress={handleSoundPress}
          />
        </View>
      </BottomSheet>

      {/* Detail sheet */}
      <SoundDetailSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        sound={detailSound}
      />

      {/* AI input sheet */}
      <AIInputSheet
        visible={aiSheetVisible}
        onClose={() => setAiSheetVisible(false)}
        onSubmit={handleAISubmit}
        isLoading={aiLoading}
      />

      {/* AI result sheet */}
      <BottomSheet
        visible={aiResultVisible}
        onClose={() => { setAiResultVisible(false); setAiResult(null); }}
        maxHeightPct={0.78}
      >
        {aiResult && (
          <AIResultPreview
            result={aiResult}
            onApply={handleAIApply}
            onRetry={handleAIRetry}
            onSaveAsPreset={handleAISavePreset}
            onCancel={() => { setAiResultVisible(false); setAiResult(null); }}
          />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
