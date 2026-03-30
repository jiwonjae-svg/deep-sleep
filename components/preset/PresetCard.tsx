import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';

const PRESET_IMAGES: Record<string, ReturnType<typeof require>> = {
  'preset-rain-night': require('@/assets/images/presets/rainy_presets.png'),
  'preset-forest-night': require('@/assets/images/presets/forest_persets.png'),
  'preset-campfire': require('@/assets/images/presets/campfire_presets.png'),
  'preset-warm-fireplace': require('@/assets/images/presets/fire_presets.png'),
  'preset-cafe': require('@/assets/images/presets/cafe_presets.png'),
};

interface PresetCardProps {
  preset: Preset;
  onPress: () => void;
  onLongPress?: () => void;
}

export function PresetCard({ preset, onPress, onLongPress }: PresetCardProps) {
  const themeColors = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusMd,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        cardImage: {
          width: '100%',
          height: 140,
        },
        cardImageFallback: {
          width: '100%',
          height: 140,
          backgroundColor: themeColors.bgSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cardBody: {
          padding: layout.cardPadding,
          gap: spacing.xs,
        },
        name: {
          ...typography.h3,
          color: themeColors.textPrimary,
        },
        description: {
          ...typography.body,
          color: themeColors.textSecondary,
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginTop: spacing.xs,
        },
        chip: {
          backgroundColor: themeColors.accent1,
          borderRadius: layout.borderRadiusSm,
          paddingVertical: 3,
          paddingHorizontal: spacing.sm,
        },
        chipText: {
          ...typography.caption,
          color: themeColors.white,
          fontWeight: '600',
          fontSize: 11,
        },
        meta: {
          ...typography.caption,
          color: themeColors.textMuted,
        },
      }),
    [themeColors],
  );

  const soundNames = preset.sounds.slice(0, 4).map((s) => getSoundById(s.soundId)?.name ?? s.soundId);
  const extra = preset.sounds.length - 4;
  const img = PRESET_IMAGES[preset.id];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {img ? (
        <Image source={img} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardImageFallback}>
          <Text style={{ fontSize: 40 }}>{preset.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.name}>{preset.name}</Text>
        {!!preset.description && (
          <Text style={styles.description} numberOfLines={1}>
            {preset.description}
          </Text>
        )}
        <View style={styles.footer}>
          {soundNames.map((name, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{name}</Text>
            </View>
          ))}
          {extra > 0 && <Text style={styles.meta}>+{extra}</Text>}
        </View>
      </View>
    </Pressable>
  );
}
