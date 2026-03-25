import React from 'react';
import { Text, Pressable, View, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, layout } from '@/theme';
import { SoundConfig } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - layout.screenPaddingH * 2 - layout.gridGap) / 2;

interface SoundCardProps {
  sound: SoundConfig;
  active: boolean;
  isPremium: boolean;
  isLocked: boolean; // premium sound for free user
  volume?: number; // 0–100 current average volume (for display)
  onPress: () => void;
  onLongPress?: () => void;
  categoryColor: string;
}

export function SoundCard({
  sound,
  active,
  isPremium,
  isLocked,
  volume,
  onPress,
  onLongPress,
  categoryColor,
}: SoundCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        active && { borderColor: colors.accent2 },
        isLocked && styles.cardLocked,
        { opacity: pressed ? 0.8 : isLocked ? 0.6 : 1 },
      ]}
    >
      {/* Emoji icon */}
      <Text style={styles.emoji}>{sound.iconEmoji}</Text>

      {/* Top-right indicator */}
      {active && (
        <View style={[styles.badge, { backgroundColor: colors.accent2 }]}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      )}
      {isLocked && !active && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔒</Text>
        </View>
      )}

      {/* Sound name */}
      <Text style={styles.name} numberOfLines={1}>
        {sound.name}
      </Text>

      {/* Volume mini bar (active only) */}
      {active && volume != null && (
        <View style={styles.volumeBarBg}>
          <View style={[styles.volumeBarFill, { width: `${volume}%`, backgroundColor: categoryColor }]} />
        </View>
      )}

      {/* Premium label */}
      {sound.isPremium && !active && (
        <Text style={styles.premiumLabel}>★ Premium</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 100,
    borderRadius: layout.borderRadiusMd,
    backgroundColor: colors.glassLight,
    padding: layout.cardPadding,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardActive: {
    backgroundColor: colors.glassHeavy,
    borderWidth: 2,
  },
  cardLocked: {
    // just reduced opacity handled in press
  },
  emoji: {
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badgeText: {
    fontSize: 14,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 14,
  },
  volumeBarBg: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.glassMedium,
    overflow: 'hidden',
  },
  volumeBarFill: {
    height: 3,
    borderRadius: 1.5,
  },
  premiumLabel: {
    ...typography.overline,
    color: colors.accent3,
    fontSize: 10,
  },
});
