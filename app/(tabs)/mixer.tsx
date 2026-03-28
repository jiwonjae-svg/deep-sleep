import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudio } from '@/hooks/useAudio';
import { CategoryTabs } from '@/components/sound/CategoryTabs';
import { SoundGrid } from '@/components/sound/SoundGrid';
import { ActiveSoundsBar } from '@/components/sound/ActiveSoundsBar';
import { SoundDetailSheet } from '@/components/sound/SoundDetailSheet';
import { SoundCategory, SoundConfig } from '@/types';
import { getSoundsByCategory } from '@/data/sounds';
import { getCategoryById } from '@/data/categories';
import { useThemeColors } from '@/theme';
import { typography, layout } from '@/theme';
import * as AdService from '@/services/AdService';

export default function MixerScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activeSounds, isPlaying, soundCount, toggleSound, play, stop } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('rain-water');
  const [detailSound, setDetailSound] = useState<SoundConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

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
        gridPad: { paddingHorizontal: layout.screenPaddingH },
      }),
    [themeColors],
  );

  const handleCategoryChange = useCallback((cat: SoundCategory) => {
    setSelectedCategory(cat);
    AdService.shouldShowProbabilisticInterstitial();
  }, []);

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
        <Text style={styles.count}>{soundCount}/10 활성</Text>
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
    </SafeAreaView>
  );
}
