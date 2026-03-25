import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AIPresetResult } from '@/types';
import { getSoundById } from '@/data/sounds';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing, layout } from '@/theme';

interface AIResultPreviewProps {
  result: AIPresetResult;
  onApply: () => void;
  onRetry: () => void;
  onSaveAsPreset: () => void;
  onCancel: () => void;
}

export function AIResultPreview({
  result,
  onApply,
  onRetry,
  onSaveAsPreset,
  onCancel,
}: AIResultPreviewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{result.preset_name}</Text>
      <Text style={styles.desc}>{result.description}</Text>

      <ScrollView style={styles.soundList}>
        {result.sounds.map((s) => {
          const meta = getSoundById(s.soundId);
          if (!meta) return null;
          return (
            <View key={s.soundId} style={styles.soundRow}>
              <Text style={styles.emoji}>{meta.iconEmoji}</Text>
              <View style={styles.soundInfo}>
                <Text style={styles.soundName}>{meta.name}</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barMin,
                      { width: `${s.volumeMin}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.barRange,
                      { left: `${s.volumeMin}%`, width: `${s.volumeMax - s.volumeMin}%` },
                    ]}
                  />
                </View>
                <Text style={styles.soundMeta}>
                  {s.volumeMin}%–{s.volumeMax}% · {s.frequency}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <Button title="적용" onPress={onApply} />
        <View style={styles.secondaryActions}>
          <Button title="다시 추천" onPress={onRetry} variant="secondary" style={{ flex: 1 }} />
          <Button title="프리셋 저장" onPress={onSaveAsPreset} variant="secondary" style={{ flex: 1 }} />
        </View>
        <Button title="취소" onPress={onCancel} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
  },
  soundList: {
    maxHeight: 250,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  emoji: { fontSize: 24 },
  soundInfo: { flex: 1, gap: 4 },
  soundName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassMedium,
    position: 'relative',
    overflow: 'hidden',
  },
  barMin: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'transparent',
  },
  barRange: {
    position: 'absolute',
    height: 4,
    backgroundColor: colors.accent1,
    borderRadius: 2,
  },
  soundMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
