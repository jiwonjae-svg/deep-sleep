import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SoundCategory, SoundConfig, ActiveSoundState, AIPresetResult } from '@/types';
import { getSoundsByCategory, getSoundById } from '@/data/sounds';
import { categories, getCategoryById } from '@/data/categories';
import { useThemeColors } from '@/theme';

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

export default function MixerScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activeSounds, activeSoundsMap, isPlaying, soundCount, toggleSound, play, stop } = useAudio();
  const { recommend, isLoading: aiLoading, isPremium, canCall } = useAI();
  const isSubscribed = useSubscriptionStore((s) => s.isPremium);

  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('rain-water');
  const [detailSound, setDetailSound] = useState<SoundConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiResultVisible, setAiResultVisible] = useState(false);
  const [aiResult, setAiResult] = useState<AIPresetResult | null>(null);

  const categorySounds = getSoundsByCategory(selectedCategory);
  const activeSoundIds = new Set(activeSoundsMap.keys());

  const visibleCategories = useMemo(
    () => categories.filter((cat) => getSoundsByCategory(cat.id).length > 0),
    [],
  );

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
    <GradientBackground
      gradients={[
        ['#2d1b69', '#11998e'],
        ['#0f3460', '#1a1a2e'],
        ['#134e5e', '#71b280'],
        ['#1a1a2e', '#16213e'],
      ]}
      duration={10000}
      overlay
      overlayOpacity={0.5}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Header */}
          <Text style={styles.statusLabel}>
            사운드 믹서 {soundCount}/10 활성
          </Text>

          {/* AI Recommendation Button */}
          <View style={styles.aiRow}>
            <Pressable style={styles.aiBtn} onPress={handleAIPress}>
              <MaterialIcons name="auto-awesome" size={18} color={themeColors.accent1} />
              <Text style={styles.aiBtnText}>AI 추천</Text>
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
                      isSelected && styles.categoryIconActive,
                    ]}
                  >
                    <MaterialIcons
                      name={iconName}
                      size={24}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {cat.nameEn?.split(' ')[0]?.toUpperCase() ?? cat.name}
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
                    <Text style={{ fontSize: 18, opacity: isLocked ? 0.5 : 1 }}>
                      {sound.iconEmoji}
                    </Text>
                  </View>
                  <View style={styles.trackInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={[styles.trackName, isLocked && { color: 'rgba(255,255,255,0.5)' }]}
                        numberOfLines={1}
                      >
                        {sound.name}
                      </Text>
                      {isLocked && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.trackDesc, isLocked && { color: 'rgba(255,255,255,0.2)' }]}
                      numberOfLines={1}
                    >
                      {sound.type === 'continuous' ? '연속 재생' : '간헐적'}
                    </Text>
                  </View>
                  <View style={styles.trackActions}>
                    {isLocked ? (
                      <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.3)" />
                    ) : isActive ? (
                      <>
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
                      <Pressable
                        style={styles.trackActionBtn}
                        onPress={() => handleSoundToggle(sound)}
                      >
                        <MaterialIcons name="add" size={20} color="#ffffff" />
                      </Pressable>
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
    </GradientBackground>
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
    marginBottom: 12,
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
});
