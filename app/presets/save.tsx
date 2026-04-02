import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Modal, FlatList, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { Button } from '@/components/ui/Button';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Slider } from '@/components/ui/Slider';
import { getSoundById, getSoundsByCategory, sounds as allSounds } from '@/data/sounds';
import { categories } from '@/data/categories';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { ActiveSoundState, SoundCategory, SoundConfig } from '@/types';

// Same icon mappings as mixer page
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

const SOUND_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  'rain-light': 'water-drop',
  'thunder': 'bolt',
  'wave-gentle': 'waves',
  'wind-gentle': 'air',
  'birds-morning': 'flutter-dash',
  'crickets': 'grass',
  'campfire': 'local-fire-department',
  'fireplace': 'fireplace',
  'cafe-chatter': 'local-cafe',
  'white-noise': 'graphic-eq',
  'rain-car': 'directions-car',
  'owl': 'visibility',
  'singing-bowl': 'notifications',
  'jazz-piano': 'piano',
  'cat-purr': 'pets',
};

export default function PresetSaveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ presetId?: string }>();
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const addPreset = usePresetStore((s) => s.addPreset);
  const updatePreset = usePresetStore((s) => s.updatePreset);
  const customPresets = usePresetStore((s) => s.customPresets);

  const existingPreset = params.presetId
    ? customPresets.find((p) => p.id === params.presetId)
    : undefined;
  const isEditing = !!existingPreset;

  const [name, setName] = useState(existingPreset?.name ?? '');
  const [description, setDescription] = useState(existingPreset?.description ?? '');
  const [imageUri, setImageUri] = useState<string | null>(existingPreset?.imageUri ?? null);
  const themeColors = useThemeColors();
  const isSubscribed = useSubscriptionStore((s) => s.isPremium);

  const initialSounds = isEditing && existingPreset
    ? existingPreset.sounds
    : Array.from(activeSounds.values());

  const [soundsList, setSoundsList] = useState<ActiveSoundState[]>(initialSounds);
  const [soundEditorVisible, setSoundEditorVisible] = useState(false);
  const [tempSounds, setTempSounds] = useState<ActiveSoundState[]>([]);
  const [editorCategory, setEditorCategory] = useState<SoundCategory>('rain-water');
  const [detailSoundId, setDetailSoundId] = useState<string | null>(null);

  const FREQ_OPTIONS = ['연속', '자주', '가끔', '드물게'];
  const FREQ_VALUES: ('continuous' | 'frequent' | 'occasional' | 'rare')[] = ['continuous', 'frequent', 'occasional', 'rare'];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 22, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateClose = useCallback((cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(cb);
  }, [fadeAnim, scaleAnim]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지를 선택하려면 사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('이름을 입력해주세요');
      return;
    }
    if (soundsList.length === 0) {
      Alert.alert('활성화된 소리가 없습니다');
      return;
    }

    const now = Date.now();
    if (isEditing && existingPreset) {
      updatePreset(existingPreset.id, {
        name: trimmed,
        description: description.trim(),
        imageUri: imageUri ?? null,
        sounds: soundsList,
      });
    } else {
      addPreset({
        id: `custom_${now}`,
        name: trimmed,
        description: description.trim(),
        isDefault: false,
        sounds: soundsList,
        imageUri: imageUri ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }
    animateClose(() => router.back());
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={() => animateClose(() => router.back())} />
      <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isEditing ? '프리셋 수정' : '프리셋 저장'}</Text>

          {/* Preview - tappable to edit sounds */}
          <Pressable
            style={styles.preview}
            onPress={() => {
              setTempSounds([...soundsList]);
              setSoundEditorVisible(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.previewLabel}>포함된 소리 ({soundsList.length})</Text>
              <MaterialIcons name="edit" size={14} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.soundRow}>
              {soundsList.map((s) => {
                const soundInfo = getSoundById(s.soundId);
                return (
                  <View key={s.soundId} style={styles.soundChip}>
                    <Text style={styles.soundChipText}>{soundInfo?.name ?? s.soundId}</Text>
                  </View>
                );
              })}
              {soundsList.length === 0 && (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>탭하여 소리 추가</Text>
              )}
            </View>
          </Pressable>

          {/* Image upload */}
          <Pressable style={styles.imagePlaceholder} onPress={handlePickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.selectedImage} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.4)" />
                <Text style={styles.imagePlaceholderText}>프리셋 이미지 선택 (선택)</Text>
              </>
            )}
          </Pressable>

          {/* Name input */}
          <Text style={styles.inputLabel}>프리셋 이름</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="예: 비오는 숲속"
            placeholderTextColor="rgba(255,255,255,0.4)"
          />

          {/* Description input */}
          <Text style={styles.inputLabel}>설명 (선택)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="이 프리셋에 대한 간단한 설명"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={100}
            multiline
            numberOfLines={3}
          />

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <Button
              title="저장하기"
              variant="primary"
              onPress={handleSave}
              disabled={name.trim().length === 0}
            />
            <Button
              title="취소"
              variant="ghost"
              onPress={() => animateClose(() => router.back())}
            />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Sound Editor Modal */}
      <Modal
        visible={soundEditorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSoundEditorVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: 'rgba(17,21,31,0.97)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: 'rgba(255,255,255,0.15)',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>소리 편집</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{tempSounds.length}/10개 선택됨</Text>
            </View>

            {/* Active sound chips */}
            {tempSounds.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
                {tempSounds.map((s) => {
                  const soundInfo = getSoundById(s.soundId);
                  return (
                    <Pressable
                      key={s.soundId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: 9999,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.20)',
                      }}
                      onPress={() => setTempSounds((prev) => prev.filter((ts) => ts.soundId !== s.soundId))}
                    >
                      <MaterialIcons name={SOUND_ICONS[s.soundId] ?? 'music-note'} size={12} color="#ffffff" />
                      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: '#ffffff' }}>
                        {soundInfo?.name ?? s.soundId}
                      </Text>
                      <MaterialIcons name="close" size={12} color="rgba(255,255,255,0.5)" />
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Category icon tabs — matching mixer page */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16, alignItems: 'flex-start', marginBottom: 16 }}
            >
              {categories.filter((c) => getSoundsByCategory(c.id).length > 0).map((cat) => {
                const isSel = cat.id === editorCategory;
                const iconName = CATEGORY_ICONS[cat.id] ?? 'music-note';
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setEditorCategory(cat.id as SoundCategory)}
                    style={{ alignItems: 'center', gap: 6 }}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 20,
                        backgroundColor: isSel ? themeColors.accent1 : 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        borderColor: isSel ? themeColors.accent1 : 'rgba(255,255,255,0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(isSel ? { shadowColor: themeColors.accent1, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 4 } : {}),
                      }}
                    >
                      <MaterialIcons name={iconName} size={22} color="#ffffff" />
                    </View>
                    <Text style={{
                      fontSize: 9,
                      fontWeight: '700',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: isSel ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    }}>
                      {cat.nameEn?.split(' ')[0]?.toUpperCase() ?? cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Track list — matching mixer page */}
            <FlatList
              data={getSoundsByCategory(editorCategory)}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 280 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}
              renderItem={({ item: sound }) => {
                const isActive = tempSounds.some((s) => s.soundId === sound.id);
                const isLocked = sound.isPremium && !isSubscribed;
                return (
                  <Pressable
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                      borderRadius: 32,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: isActive ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                    onPress={() => {
                      if (isLocked) return;
                      if (isActive) {
                        setTempSounds((prev) => prev.filter((s) => s.soundId !== sound.id));
                      } else {
                        if (tempSounds.length >= 10) return;
                        setTempSounds((prev) => [...prev, { soundId: sound.id, volumeMin: 70, volumeMax: 100, frequency: 'continuous' as const, pan: 0 }]);
                      }
                    }}
                    disabled={isLocked}
                  >
                    {/* Sound icon */}
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MaterialIcons
                        name={SOUND_ICONS[sound.id] ?? 'music-note'}
                        size={20}
                        color={isLocked ? 'rgba(255,255,255,0.3)' : '#ffffff'}
                      />
                    </View>
                    {/* Info */}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isLocked ? 'rgba(255,255,255,0.5)' : '#ffffff', letterSpacing: -0.3 }} numberOfLines={1}>
                          {sound.name}
                        </Text>
                        {isLocked && (
                          <View style={{ backgroundColor: themeColors.accent1, borderRadius: 9999, paddingVertical: 2, paddingHorizontal: 6 }}>
                            <Text style={{ fontSize: 8, fontWeight: '800', letterSpacing: -0.3, textTransform: 'uppercase', color: '#ffffff' }}>PREMIUM</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }} numberOfLines={1}>
                        {sound.type === 'continuous' ? '연속 재생' : '간헐적'}
                      </Text>
                    </View>
                    {/* Action */}
                    {isLocked ? (
                      <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.3)" />
                    ) : isActive ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable
                          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                          onPress={(e) => { e.stopPropagation(); setDetailSoundId(sound.id); }}
                        >
                          <MaterialIcons name="settings" size={18} color="#ffffff" />
                        </Pressable>
                        <Pressable
                          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                          onPress={(e) => { e.stopPropagation(); setTempSounds((prev) => prev.filter((s) => s.soundId !== sound.id)); }}
                        >
                          <MaterialIcons name="remove" size={20} color="#ffffff" />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialIcons name="add" size={20} color="#ffffff" />
                      </View>
                    )}
                  </Pressable>
                );
              }}
            />

            {/* Sound Detail Editing */}
            {detailSoundId && (() => {
              const detailSound = getSoundById(detailSoundId);
              const detailState = tempSounds.find((s) => s.soundId === detailSoundId);
              if (!detailSound || !detailState) return null;
              const isContinuous = detailSound.type === 'continuous';
              const freqIdx = FREQ_VALUES.indexOf(detailState.frequency);
              const updateDetail = (updates: Partial<ActiveSoundState>) => {
                setTempSounds((prev) => prev.map((s) => s.soundId === detailSoundId ? { ...s, ...updates } : s));
              };
              return (
                <View style={{ marginHorizontal: 16, marginBottom: 12, padding: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>{detailSound.name} 설정</Text>
                    <Pressable onPress={() => setDetailSoundId(null)}>
                      <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                    </Pressable>
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>음량 범위</Text>
                  <RangeSlider
                    min={detailState.volumeMin}
                    max={detailState.volumeMax}
                    onMinChange={(v) => updateDetail({ volumeMin: v })}
                    onMaxChange={(v) => updateDetail({ volumeMax: v })}
                  />
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>빈도</Text>
                  <SegmentedControl
                    options={FREQ_OPTIONS}
                    selectedIndex={freqIdx >= 0 ? freqIdx : 0}
                    onSelect={(i) => updateDetail({ frequency: FREQ_VALUES[i] })}
                    disabled={isContinuous}
                  />
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>팬 (좌/우)</Text>
                  <Slider
                    value={Math.round((detailState.pan + 1) * 50)}
                    onValueChange={(v) => updateDetail({ pan: v / 50 - 1 })}
                    showLabel={false}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>L</Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>C</Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>R</Text>
                  </View>
                </View>
              );
            })()}

            {/* Buttons */}
            <View style={{ padding: 16, gap: 10 }}>
              <Pressable
                style={{
                  backgroundColor: themeColors.accent1,
                  borderRadius: 9999,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSoundsList(tempSounds);
                  setSoundEditorVisible(false);
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#ffffff' }}>저장</Text>
              </Pressable>
              <Pressable
                style={{ paddingVertical: 10, alignItems: 'center' }}
                onPress={() => setSoundEditorVisible(false)}
              >
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: 'rgba(17,21,31,0.92)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  preview: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  soundRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  soundChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  soundChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePlaceholderText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  selectedImage: { width: '100%', height: '100%', borderRadius: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  buttonGroup: {
    gap: 12,
    marginTop: 16,
  },
});


