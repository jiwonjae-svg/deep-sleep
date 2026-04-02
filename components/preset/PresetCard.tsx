import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import { useThemeColors } from '@/theme';
import { typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

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
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 32,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          minHeight: 220,
        },
        cardImage: {
          width: '100%',
          height: 140,
        },
        cardImageFallback: {
          width: '100%',
          height: 140,
          backgroundColor: 'rgba(255,255,255,0.04)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        cardBody: {
          padding: layout.cardPadding,
          gap: spacing.xs,
        },
        name: {
          fontSize: 17,
          fontWeight: '700',
          color: '#ffffff',
        },
        description: {
          fontSize: 13,
          fontWeight: '500',
          color: 'rgba(255,255,255,0.7)',
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginTop: spacing.xs,
        },
        chip: {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          paddingVertical: 3,
          paddingHorizontal: spacing.sm,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        },
        chipText: {
          fontSize: 11,
          fontWeight: '600',
          color: 'rgba(255,255,255,0.7)',
        },
        meta: {
          fontSize: 11,
          fontWeight: '600',
          color: 'rgba(255,255,255,0.4)',
        },
      }),
    [themeColors],
  );

  const { t } = useTranslation();
  const soundNames = preset.sounds.slice(0, 4).map((s) => {
    const snd = getSoundById(s.soundId);
    return snd ? t(`sounds.${snd.id}`, { defaultValue: snd.name }) : s.soundId;
  });
  const extra = preset.sounds.length - 4;
  const img = PRESET_IMAGES[preset.id];
  const displayName = preset.isDefault ? t(`defaultPresets.${preset.id}`, { defaultValue: preset.name }) : preset.name;
  const displayDesc = preset.isDefault ? t(`defaultPresets.${preset.id}-desc`, { defaultValue: preset.description }) : preset.description;

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
          <Text style={{ fontSize: 40 }}>{displayName.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.name}>{displayName}</Text>
        {!!displayDesc && (
          <Text style={styles.description} numberOfLines={1}>
            {displayDesc}
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
