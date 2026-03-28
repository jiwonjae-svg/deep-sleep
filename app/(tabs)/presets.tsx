import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePresetStore } from '@/stores/usePresetStore';
import { useAudio } from '@/hooks/useAudio';
import { PresetList } from '@/components/preset/PresetList';
import { Preset } from '@/types';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import * as AdService from '@/services/AdService';

export default function PresetsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { applyPreset, soundCount } = useAudio();
  const { defaultPresets, customPresets, deletePreset } = usePresetStore();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        header: {
          paddingHorizontal: layout.screenPaddingH,
          height: layout.headerHeight,
          justifyContent: 'center',
        },
        title: { ...typography.h1, color: themeColors.textPrimary },
        fab: {
          position: 'absolute',
          bottom: 100,
          right: layout.screenPaddingH,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: themeColors.accent1,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
      }),
    [themeColors],
  );

  const handlePresetPress = useCallback(
    async (preset: Preset) => {
      // 광고
      if (AdService.canShowInterstitial()) {
        AdService.recordInterstitialShown();
        // TODO: show actual interstitial ad
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>프리셋</Text>
      </View>

      {/* Preset list */}
      <PresetList
        defaultPresets={defaultPresets}
        customPresets={customPresets}
        onPresetPress={handlePresetPress}
        onPresetLongPress={handlePresetLongPress}
      />

      {/* FAB — save current */}
      {soundCount > 0 && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/presets/save')}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}


