import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Image, ImageSourcePropType, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePresetStore } from '@/stores/usePresetStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useAudio } from '@/hooks/useAudio';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { useThemeColors, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { applyPreset, soundCount } = useAudio();
  const { defaultPresets, customPresets, deletePreset } = usePresetStore();
  const allPresets = useMemo(
    () => [...defaultPresets, ...customPresets],
    [defaultPresets, customPresets],
  );

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const filteredPresets = useMemo(() => {
    if (!searchText.trim()) return allPresets;
    const q = searchText.trim().toLowerCase();
    return allPresets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
    );
  }, [allPresets, searchText]);

  const handlePresetPress = useCallback(
    (preset: Preset) => {
      if (AdService.canShowInterstitial()) {
        AdService.recordInterstitialShown();
      }
      // 프리셋 소리만 로드 (자동 재생하지 않음)
      const store = useAudioStore.getState();
      store.setPresetSounds(preset.sounds);
      store.setActivePresetId(preset.id);
    },
    [],
  );

  const handleDeletePreset = useCallback(
    (preset: Preset) => {
      Alert.alert(t('presets.deleteTitle'), t('presets.deleteConfirm', { name: preset.name }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deletePreset(preset.id) },
      ]);
    },
    [deletePreset],
  );

  const handleEditPreset = useCallback(
    (preset: Preset) => {
      router.push({ pathname: '/presets/save', params: { presetId: preset.id } });
    },
    [router],
  );

  return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top bar with search */}
        <View style={styles.topBar}>
          {searchVisible ? (
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder={t('presets.searchPlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.4)"
                autoFocus
              />
              <Pressable onPress={() => { setSearchVisible(false); setSearchText(''); }}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flex: 1 }} />
              <Pressable style={styles.searchBtn} onPress={() => setSearchVisible(true)}>
                <MaterialIcons name="search" size={24} color="#ffffff" />
              </Pressable>
            </>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredPresets.map((preset) => {
            const defaultImg = PRESET_IMAGES[preset.id];
            const customImg = preset.imageUri ? { uri: preset.imageUri } : null;
            const img = defaultImg ?? customImg;
            const soundNames = preset.sounds
              .slice(0, 4)
              .map((s) => {
                const snd = getSoundById(s.soundId);
                return snd ? t(`sounds.${snd.id}`, { defaultValue: snd.name }) : s.soundId;
              });
            const extra = preset.sounds.length - 4;

            return (
              <Pressable
                key={preset.id}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => handlePresetPress(preset)}
              >
                {/* Background image */}
                {img && (
                  <View style={styles.cardImageWrap}>
                    <Image source={img} style={styles.cardImage} resizeMode="cover" />
                  </View>
                )}
                {/* Edit/Delete buttons — custom presets only */}
                {!preset.isDefault && (
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.cardActionBtn}
                      onPress={() => handleEditPreset(preset)}
                    >
                      <MaterialIcons name="edit" size={16} color="#ffffff" />
                    </Pressable>
                    <Pressable
                      style={styles.cardActionBtn}
                      onPress={() => handleDeletePreset(preset)}
                    >
                      <MaterialIcons name="delete-outline" size={16} color="#ffffff" />
                    </Pressable>
                  </View>
                )}
                {/* Glass content overlay */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{preset.isDefault ? t(`defaultPresets.${preset.id}`, { defaultValue: preset.name }) : preset.name}</Text>
                  {!!(preset.isDefault ? t(`defaultPresets.${preset.id}-desc`, { defaultValue: preset.description }) : preset.description) && (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {preset.isDefault ? t(`defaultPresets.${preset.id}-desc`, { defaultValue: preset.description }) : preset.description}
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

        {/* FAB — 항상 표시 */}
        <Pressable
          style={[styles.fab, { backgroundColor: themeColors.accent1, shadowColor: themeColors.accent1 }]}
          onPress={() => router.push('/presets/save')}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </Pressable>
      </SafeAreaView>
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    padding: 0,
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
  cardActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  cardActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    bottom: 32,
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


