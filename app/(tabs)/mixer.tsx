import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '@/hooks/useAudio';
import { useAI } from '@/hooks/useAI';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { SoundDetailSheet } from '@/components/sound/SoundDetailSheet';
import { AIInputSheet } from '@/components/ai/AIInputSheet';
import { AIResultPreview } from '@/components/ai/AIResultPreview';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SoundCategory, SoundConfig, ActiveSoundState, AIPresetResult } from '@/types';
import { getSoundsByCategory, getSoundById } from '@/data/sounds';
import { categories, getCategoryById } from '@/data/categories';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useSoundPreview } from '@/hooks/useSoundPreview';

// Material icon name for each category
const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  'rain-water': 'water-drop',
  'ocean-beach': 'waves',
  'wind-weather': 'air',
  'forest-nature': 'forest',
  'fire-warmth': 'local-fire-department',
  'indoor-ambient': 'home',
  'urban-transport': 'directions-car',
  'musical-tonal': 'music-note',
  'special-environments': 'auto-awesome',
  'seasonal-special': 'eco',
};

// Material icon name for each sound
const SOUND_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  // Rain & Water
  'rain-light': 'water-drop',
  'rain-heavy': 'thunderstorm',
  'thunder': 'bolt',

  'rain-umbrella': 'umbrella',
  'rain-tent': 'holiday-village',
  'rain-car': 'directions-car',
  'stream': 'water',
  // Ocean & Beach
  'wave-gentle': 'waves',
  'wave-rough': 'waves',

  // Wind & Weather
  'wind-gentle': 'air',
  'wind-strong': 'storm',
  'leaves-rustle': 'eco',
  'hail': 'grain',
  // Forest & Nature
  'birds-morning': 'flutter-dash',
  'cuckoo': 'flutter-dash',
  'owl': 'visibility',
  'crow': 'flutter-dash',
  'crickets': 'grass',
  'frogs': 'pest-control',
  'grass-insects': 'grass',
  // Fire & Warmth
  'campfire': 'local-fire-department',
  'fireplace': 'fireplace',
  'candle': 'local-fire-department',

  // Indoor & Ambient
  'air-conditioner': 'ac-unit',
  'fan': 'mode-fan-off',
  'clock-tick': 'schedule',
  'keyboard-typing': 'keyboard',
  'cat-purr': 'pets',
  'fridge-hum': 'kitchen',
  // Urban & Transport
  'traffic-distant': 'traffic',
  'train-rails': 'train',
  'cafe-chatter': 'local-cafe',
  'airplane-cabin': 'flight',

  // Musical & Tonal
  'white-noise': 'graphic-eq',
  'pink-noise': 'graphic-eq',
  'brown-noise': 'graphic-eq',
  'binaural-beats': 'psychology',
  'singing-bowl': 'notifications',
  'wind-chime': 'notifications-active',
  'music-box': 'music-note',
  // Special Environments
  'cave-echo': 'landscape',
  'temple-bells': 'temple-buddhist',
  'hot-spring': 'hot-tub',
  // ASMR
  'whispering': 'record-voice-over',
  'hair-brushing': 'brush',
  // Seasonal & Special
  'cherry-blossom': 'local-florist',
  'snow-walking': 'ac-unit',
  // New sounds
  'waterfall': 'water',
  'fountain': 'water',
  'whale': 'waves',
  'cicadas': 'grass',
  'wolf': 'pets',
  'dolphin': 'waves',
  'washing-machine': 'local-laundry-service',
  'dryer': 'air',
  'page-turning': 'menu-book',
  'bus': 'directions-bus',
  'lofi-beats': 'headphones',
};

export default function MixerScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const { activeSounds, activeSoundsMap, isPlaying, soundCount, toggleSound, play, stop } = useAudio();
  const { recommend, isLoading: aiLoading, isPremium, canCall } = useAI();
  const isSubscribed = useSubscriptionStore((s) => s.isPremium);

  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('rain-water');
  const [detailSound, setDetailSound] = useState<SoundConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Sound preview
  const { previewingSoundId, togglePreview, stopPreview: stopSoundPreview } = useSoundPreview();

  // AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiResultVisible, setAiResultVisible] = useState(false);
  const [aiResult, setAiResult] = useState<AIPresetResult | null>(null);

  const categorySounds = useMemo(
    () => [...getSoundsByCategory(selectedCategory)].sort((a, b) => Number(a.isPremium) - Number(b.isPremium)),
    [selectedCategory],
  );
  const activeSoundIds = new Set(activeSoundsMap.keys());

  const visibleCategories = useMemo(
    () => categories.filter((cat) => getSoundsByCategory(cat.id).length > 0),
    [],
  );

  const handleAIPress = useCallback(() => {
    if (!isPremium) { router.push('/subscription'); return; }
    if (!canCall) {
      Alert.alert(t('mixer.dailyLimit'), t('mixer.dailyLimitMessage'));
      return;
    }
    setAiSheetVisible(true);
  }, [isPremium, canCall, router]);

  const handleAISubmit = useCallback(async (input: string) => {
    setAiSheetVisible(false);
    const result = await recommend(input);
    if (result) { setAiResult(result); setAiResultVisible(true); }
    else Alert.alert(t('common.error'), t('mixer.aiError'));
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
    Alert.alert(t('mixer.savedComplete'), t('mixer.savedMessage', { name: aiResult.preset_name }));
  }, [aiResult]);

  const handleSoundToggle = useCallback(
    (sound: SoundConfig) => {
      const result = toggleSound(sound.id);
      if (result === 'premium_required') router.push('/subscription');
    },
    [toggleSound, router],
  );

  const handleSoundSettings = useCallback((sound: SoundConfig) => {
    setDetailSound(sound);
    setSheetVisible(true);
  }, []);

  const handlePlayToggle = async () => {
    if (isPlaying) await stop();
    else await play();
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Header */}
          <Text style={styles.statusLabel}>
            {t('mixer.title')} {soundCount}/10 {t('mixer.activeCount', { count: soundCount }).split('/')[1]?.replace(/\d+\s*/, '') || ''}
          </Text>

          {/* Active Sounds Chip List */}
          {soundCount > 0 && (
            <View style={styles.activeChipsRow}>
              {Array.from(activeSoundsMap.entries()).map(([id]) => {
                const soundInfo = getSoundById(id);
                return (
                  <Pressable
                    key={id}
                    style={styles.activeChip}
                    onPress={() => toggleSound(id)}
                  >
                    <MaterialIcons name={SOUND_ICONS[id] ?? 'music-note'} size={12} color="#ffffff" />
                    <Text style={styles.activeChipText}>{soundInfo?.name ?? id}</Text>
                    <MaterialIcons name="close" size={12} color="rgba(255,255,255,0.5)" />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* AI Recommendation Button */}
          <View style={styles.aiRow}>
            <Pressable style={styles.aiBtn} onPress={handleAIPress}>
              <MaterialIcons name="auto-awesome" size={18} color={themeColors.accent1} />
              <Text style={styles.aiBtnText}>{t('ai.recommendTitle')}</Text>
              {!isPremium && (
                <MaterialIcons name="lock" size={14} color="rgba(255,255,255,0.4)" />
              )}
            </Pressable>
          </View>

          {/* Category Icon Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
            style={styles.categoryScroll}
          >
            {visibleCategories.map((cat) => {
              const isSelected = cat.id === selectedCategory;
              const iconName = CATEGORY_ICONS[cat.id] ?? 'music-note';
              return (
                <Pressable
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => setSelectedCategory(cat.id as SoundCategory)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      isSelected && {
                        backgroundColor: themeColors.accent1,
                        borderColor: themeColors.accent1,
                        shadowColor: themeColors.accent1,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.4,
                        shadowRadius: 20,
                        elevation: 6,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={iconName}
                      size={24}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {t(`categories.${cat.id}`, { defaultValue: cat.nameEn?.split(' ')[0]?.toUpperCase() ?? cat.name })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Track List */}
          <View style={styles.trackList}>
            {categorySounds.map((sound) => {
              const isActive = activeSoundIds.has(sound.id);
              const isLocked = sound.isPremium && !isSubscribed;

              return (
                <View
                  key={sound.id}
                  style={[
                    styles.trackItem,
                    isActive && styles.trackItemActive,
                    isLocked && styles.trackItemLocked,
                  ]}
                >
                  {isLocked && <View style={styles.trackLockedOverlay} />}
                  <View
                    style={[
                      styles.trackIcon,
                      isLocked && { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
                    ]}
                  >
                    <MaterialIcons
                      name={SOUND_ICONS[sound.id] ?? 'music-note'}
                      size={22}
                      color={isLocked ? 'rgba(255,255,255,0.3)' : '#ffffff'}
                    />
                  </View>
                  <View style={styles.trackInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={[styles.trackName, isLocked && { color: 'rgba(255,255,255,0.5)' }]}
                        numberOfLines={1}
                      >
                        {t(`sounds.${sound.id}`, { defaultValue: sound.name })}
                      </Text>
                      {isLocked && (
                        <View style={[styles.premiumBadge, { backgroundColor: themeColors.accent1 }]}>
                          <Text style={styles.premiumBadgeText}>PLUS</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.trackDesc, isLocked && { color: 'rgba(255,255,255,0.2)' }]}
                      numberOfLines={1}
                    >
                      {sound.type === 'continuous' ? t('soundType.continuous') : t('soundType.intermittent')}
                    </Text>
                  </View>
                  <View style={styles.trackActions}>
                    {isLocked ? (
                      <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.3)" />
                    ) : isActive ? (
                      <>
                        <Pressable
                          style={[styles.trackActionBtn, previewingSoundId === sound.id && styles.trackActionBtnActive]}
                          onPress={() => togglePreview(sound.id)}
                        >
                          <MaterialIcons name={previewingSoundId === sound.id ? 'stop' : 'play-arrow'} size={20} color={previewingSoundId === sound.id ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
                        </Pressable>
                        <Pressable
                          style={styles.trackActionBtn}
                          onPress={() => handleSoundSettings(sound)}
                        >
                          <MaterialIcons name="settings" size={20} color="rgba(255,255,255,0.7)" />
                        </Pressable>
                        <Pressable
                          style={styles.trackActionBtn}
                          onPress={() => handleSoundToggle(sound)}
                        >
                          <MaterialIcons name="remove" size={20} color="#ffffff" />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable
                          style={[styles.trackActionBtn, previewingSoundId === sound.id && styles.trackActionBtnActive]}
                          onPress={() => togglePreview(sound.id)}
                        >
                          <MaterialIcons name={previewingSoundId === sound.id ? 'stop' : 'play-arrow'} size={20} color={previewingSoundId === sound.id ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
                        </Pressable>
                        <Pressable
                          style={styles.trackActionBtn}
                          onPress={() => handleSoundToggle(sound)}
                        >
                          <MaterialIcons name="add" size={20} color="#ffffff" />
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

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
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  // Status header
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  activeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  activeChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  // AI button
  aiRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  aiBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  // Category tabs
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 24,
  },
  categoryRow: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'flex-start',
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconActive: {
    backgroundColor: '#456eea',
    borderColor: '#456eea',
    shadowColor: '#456eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  // Track list
  trackList: {
    paddingHorizontal: 24,
    gap: 10,
  },
  trackItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trackItemActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  trackItemLocked: {
    opacity: 0.7,
    overflow: 'hidden',
  },
  trackLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 32,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  trackDesc: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  premiumBadge: {
    backgroundColor: '#456eea',
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  premiumBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackActionBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
