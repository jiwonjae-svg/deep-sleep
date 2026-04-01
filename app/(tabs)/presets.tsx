import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePresetStore } from '@/stores/usePresetStore';
import { useAudio } from '@/hooks/useAudio';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { useThemeColors, spacing, layout } from '@/theme';
import * as AdService from '@/services/AdService';

const PRESET_IMAGES: Record<string, ImageSourcePropType> = {
  'preset-rain-night': require('@/assets/images/presets/rainy_presets.png'),
  'preset-forest-night': require('@/assets/images/presets/forest_persets.png'),
  'preset-campfire': require('@/assets/images/presets/campfire_presets.png'),
  'preset-warm-fireplace': require('@/assets/images/presets/fire_presets.png'),
  'preset-cafe': require('@/assets/images/presets/cafe_presets.png'),
};

export default function PresetsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { applyPreset, soundCount } = useAudio();
  const { defaultPresets, customPresets, deletePreset } = usePresetStore();
  const allPresets = useMemo(
    () => [...defaultPresets, ...customPresets],
    [defaultPresets, customPresets],
  );

  const handlePresetPress = useCallback(
    async (preset: Preset) => {
      if (AdService.canShowInterstitial()) {
        AdService.recordInterstitialShown();
      }
      await applyPreset(preset);
    },
    [applyPreset],
  );

  const handlePresetLongPress = useCallback(
    (preset: Preset) => {
      if (preset.isDefault) return;
      Alert.alert('프리셋 삭제', `"${preset.name}"을 삭제하시겠습니까?`, [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deletePreset(preset.id) },
      ]);
    },
    [deletePreset],
  );

  return (
    <GradientBackground
      gradients={[
        ['#134e5e', '#71b280'],
        ['#0f3460', '#1a1a2e'],
        ['#2d1b69', '#11998e'],
        ['#1a1a2e', '#16213e'],
      ]}
      duration={10000}
      overlay
      overlayOpacity={0.5}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top bar with search */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.searchBtn}>
            <MaterialIcons name="search" size={24} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {allPresets.map((preset) => {
            const img = PRESET_IMAGES[preset.id];
            const soundNames = preset.sounds
              .slice(0, 4)
              .map((s) => getSoundById(s.soundId)?.name ?? s.soundId);
            const extra = preset.sounds.length - 4;

            return (
              <Pressable
                key={preset.id}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => handlePresetPress(preset)}
                onLongPress={() => handlePresetLongPress(preset)}
              >
                {/* Background image */}
                {img && (
                  <View style={styles.cardImageWrap}>
                    <Image source={img} style={styles.cardImage} resizeMode="cover" />
                  </View>
                )}
                {/* Glass content overlay */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{preset.name}</Text>
                  {!!preset.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {preset.description}
                    </Text>
                  )}
                  <View style={styles.chipRow}>
                    {soundNames.map((name, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{name}</Text>
                      </View>
                    ))}
                    {extra > 0 && (
                      <Text style={styles.chipExtra}>+{extra}</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FAB */}
        {soundCount > 0 && (
          <Pressable
            style={styles.fab}
            onPress={() => router.push('/presets/save')}
          >
            <MaterialIcons name="add" size={28} color="#ffffff" />
          </Pressable>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 20,
  },
  // Preset card
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardImageWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    gap: 8,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  chipExtra: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#456eea',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#456eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});


