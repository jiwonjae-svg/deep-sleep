import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudio } from '@/hooks/useAudio';
import { useAI } from '@/hooks/useAI';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { CategoryTabs } from '@/components/sound/CategoryTabs';
import { SoundGrid } from '@/components/sound/SoundGrid';
import { ActiveSoundsBar } from '@/components/sound/ActiveSoundsBar';
import { SoundDetailSheet } from '@/components/sound/SoundDetailSheet';
import { AIRecommendButton } from '@/components/ai/AIRecommendButton';
import { AIInputSheet } from '@/components/ai/AIInputSheet';
import { AIResultPreview } from '@/components/ai/AIResultPreview';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SoundCategory, SoundConfig, ActiveSoundState, AIPresetResult } from '@/types';
import { getSoundsByCategory } from '@/data/sounds';
import { getCategoryById } from '@/data/categories';
import { useThemeColors } from '@/theme';
import { typography, layout } from '@/theme';

export default function MixerScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activeSounds, isPlaying, soundCount, toggleSound, play, stop } = useAudio();
  const { recommend, isLoading: aiLoading, isPremium, canCall } = useAI();

  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('rain-water');
  const [detailSound, setDetailSound] = useState<SoundConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiResultVisible, setAiResultVisible] = useState(false);
  const [aiResult, setAiResult] = useState<AIPresetResult | null>(null);

  const categorySounds = getSoundsByCategory(selectedCategory);
  const categoryInfo = getCategoryById(selectedCategory);
  const categoryColor = categoryInfo?.color ?? themeColors.accent1;

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
        title: { ...typography.h1, color: themeColors.textPrimary },
        count: { ...typography.caption, color: themeColors.textSecondary },
        headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        gridPad: { paddingHorizontal: layout.screenPaddingH },
      }),
    [themeColors],
  );

  const handleCategoryChange = useCallback((cat: SoundCategory) => {
    setSelectedCategory(cat);
  }, []);

  // AI handlers
  const handleAIPress = useCallback(() => {
    if (!isPremium) {
      router.push('/subscription');
      return;
    }
    if (!canCall) {
      Alert.alert('일일 한도 초과', 'AI 추천은 하루에 최대 5회까지 사용할 수 있습니다.');
      return;
    }
    setAiSheetVisible(true);
  }, [isPremium, canCall, router]);

  const handleAISubmit = useCallback(async (input: string) => {
    setAiSheetVisible(false);
    const result = await recommend(input);
    if (result) {
      setAiResult(result);
      setAiResultVisible(true);
    } else {
      Alert.alert('오류', 'AI 추천에 실패했습니다. 다시 시도해주세요.');
    }
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
    Alert.alert('저장 완료', `"${aiResult.preset_name}" 프리셋이 저장됐습니다.`);
  }, [aiResult]);

  const handleSoundPress = useCallback(
    (sound: SoundConfig) => {
      const result = toggleSound(sound.id);
      if (result === 'premium_required') {
        router.push('/subscription');
      }
    },
    [toggleSound, router],
  );

  const handleSoundLongPress = useCallback(
    (sound: SoundConfig) => {
      if (activeSounds.some((s) => s.soundId === sound.id)) {
        setDetailSound(sound);
        setSheetVisible(true);
      }
    },
    [activeSounds],
  );

  const handleActiveSoundPress = useCallback(
    (soundId: string) => {
      const meta =
        categorySounds.find((s) => s.id === soundId) ??
        getSoundsByCategory('rain-water').find((s) => s.id === soundId);
      if (meta) {
        setDetailSound(meta);
        setSheetVisible(true);
      }
    },
    [categorySounds],
  );

  const handlePlayToggle = async () => {
    if (isPlaying) await stop();
    else await play();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>사운드 믹서</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{soundCount}/10 활성</Text>
          <AIRecommendButton isPremium={isPremium} onPress={handleAIPress} />
        </View>
      </View>

      {/* Category tabs */}
      <CategoryTabs selectedCategory={selectedCategory} onSelect={handleCategoryChange} />

      {/* Sound list — flex:1 로 남은 공간 채움 */}
      <View style={[styles.gridPad, { flex: 1 }]}>
        <SoundGrid
          sounds={categorySounds}
          categoryColor={categoryColor}
          onSoundPress={handleSoundPress}
          onSoundLongPress={handleSoundLongPress}
        />
      </View>

      {/* Active sounds bar */}
      <ActiveSoundsBar onSoundPress={handleActiveSoundPress} onPlayPress={handlePlayToggle} />

      {/* Detail modal */}
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
