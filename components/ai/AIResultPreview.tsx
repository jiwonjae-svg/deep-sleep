import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AIPresetResult } from '@/types';
import { getSoundById } from '@/data/sounds';
import { Button } from '@/components/ui/Button';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

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
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.base },
        name: { ...typography.h2, color: themeColors.textPrimary },
        desc: { ...typography.body, color: themeColors.textSecondary },
        soundList: { maxHeight: 250 },
        soundRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.glassBorder,
        },
        emoji: { fontSize: 24 },
        soundInfo: { flex: 1, gap: 4 },
        soundName: { ...typography.bodyMedium, color: themeColors.textPrimary },
        barBg: {
          height: 4,
          borderRadius: 2,
          backgroundColor: themeColors.glassMedium,
          position: 'relative',
          overflow: 'hidden',
        },
        barMin: { position: 'absolute', height: 4, backgroundColor: 'transparent' },
        barRange: { position: 'absolute', height: 4, backgroundColor: themeColors.accent1, borderRadius: 2 },
        soundMeta: { ...typography.caption, color: themeColors.textMuted },
        actions: { gap: spacing.md },
        secondaryActions: { flexDirection: 'row', gap: spacing.md },
      }),
    [themeColors],
  );

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
                <Text style={styles.soundName}>{t(`sounds.${meta.id}`, { defaultValue: meta.name })}</Text>
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
        <Button title={t('ai.apply')} onPress={onApply} />
        <View style={styles.secondaryActions}>
          <Button title={t('ai.retry')} onPress={onRetry} variant="secondary" style={{ flex: 1 }} />
          <Button title={t('ai.saveAsPreset')} onPress={onSaveAsPreset} variant="secondary" style={{ flex: 1 }} />
        </View>
        <Button title={t('common.cancel')} onPress={onCancel} variant="ghost" />
      </View>
    </View>
  );
}
