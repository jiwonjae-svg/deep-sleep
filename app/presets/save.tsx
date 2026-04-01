import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { Button } from '@/components/ui/Button';
import { getSoundById } from '@/data/sounds';
import { useThemeColors, typography, spacing, layout } from '@/theme';

export default function PresetSaveScreen() {
  const router = useRouter();
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const addPreset = usePresetStore((s) => s.addPreset);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        header: { paddingHorizontal: layout.screenPaddingH, height: layout.headerHeight, justifyContent: 'center' },
        title: { ...typography.h1, color: themeColors.textPrimary },
        content: { flex: 1, paddingHorizontal: layout.screenPaddingH, gap: spacing.md, paddingBottom: spacing['2xl'] },
        preview: { backgroundColor: themeColors.glassLight, borderRadius: layout.borderRadiusMd, padding: layout.cardPadding, gap: spacing.sm, borderWidth: 1, borderColor: themeColors.glassBorder },
        previewLabel: { ...typography.caption, color: themeColors.textMuted },
        soundRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
          height: 160,
          borderRadius: layout.borderRadiusMd,
          backgroundColor: themeColors.bgSecondary,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          borderStyle: 'dashed',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
        },
        imagePlaceholderText: { ...typography.caption, color: themeColors.textMuted },
        selectedImage: { width: '100%', height: '100%', borderRadius: layout.borderRadiusMd },
        inputLabel: { ...typography.bodyMedium, color: themeColors.textSecondary, marginTop: spacing.sm },
        input: { backgroundColor: themeColors.bgSecondary, borderRadius: layout.borderRadiusSm, borderWidth: 1, borderColor: themeColors.glassBorder, padding: layout.cardPadding, ...typography.body, color: themeColors.textPrimary },
        inputMultiline: { height: 80, textAlignVertical: 'top' },
      }),
    [themeColors],
  );

  const soundsList = Array.from(activeSounds.values());

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

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>프리셋 저장</Text>
        </View>

        <View style={styles.content}>
          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>포함된 소리 ({soundsList.length})</Text>
            <View style={styles.soundRow}>
              {soundsList.map((s) => {
                const soundInfo = getSoundById(s.soundId);
                return (
                  <View key={s.soundId} style={styles.soundChip}>
                    <Text style={styles.soundChipText}>{soundInfo?.name ?? s.soundId}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Image upload */}
          <Pressable style={styles.imagePlaceholder} onPress={handlePickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.selectedImage} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="image-outline" size={36} color={themeColors.textMuted} />
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
            placeholderTextColor={themeColors.textMuted}
          />

          {/* Description input */}
          <Text style={styles.inputLabel}>설명 (선택)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="이 프리셋에 대한 간단한 설명"
            placeholderTextColor={themeColors.textMuted}
            maxLength={100}
            multiline
            numberOfLines={3}
          />

          <View style={{ flex: 1 }} />

          {/* Save */}
          <Button
            title="저장하기"
            variant="primary"
            onPress={handleSave}
            disabled={name.trim().length === 0}
          />

          <Button
            title="취소"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


