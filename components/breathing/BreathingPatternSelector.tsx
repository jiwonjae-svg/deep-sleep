import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useBreathingStore, BREATHING_PATTERNS } from '@/stores/useBreathingStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { useThemeColors, typography, spacing } from '@/theme';
import { useTranslation } from 'react-i18next';

export function BreathingPatternSelector() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const { selectedPatternId, setPattern, isSessionActive } = useBreathingStore();
  const isSubscribed = useSubscriptionStore((s) => s.isPremium);

  return (
    <View style={styles.container}>
      {BREATHING_PATTERNS.map((pattern) => {
        const isSelected = pattern.id === selectedPatternId;
        const isLocked = pattern.isPremium && !isSubscribed;

        return (
          <Pressable
            key={pattern.id}
            style={[
              styles.card,
              isSelected && { borderColor: themeColors.accent1, backgroundColor: 'rgba(255,255,255,0.12)' },
              isLocked && styles.locked,
            ]}
            onPress={() => !isSessionActive && !isLocked && setPattern(pattern.id)}
            disabled={isSessionActive}
          >
            <View style={styles.row}>
              <Text style={[styles.name, isLocked && styles.lockedText]}>
                {t(`breathing.patterns.${pattern.id}`, { defaultValue: pattern.name })}
              </Text>
              {isLocked && (
                <MaterialIcons name="lock" size={14} color="rgba(255,255,255,0.4)" />
              )}
            </View>
            <Text style={[styles.desc, isLocked && styles.lockedText]}>
              {pattern.phases.map((p) => `${p.durationSec}s`).join(' - ')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  desc: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    letterSpacing: 1,
  },
  locked: {
    opacity: 0.5,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.4)',
  },
});
