/**
 * LargeWidget (4×2) — 재생/정지 + 프리셋명 + 타이머 + 즐겨찾기 프리셋 3개
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WidgetState } from './WidgetTaskHandler';

interface LargeWidgetProps {
  state: WidgetState;
  favoritePresets: { id: string; name: string }[];
}

export function LargeWidget({ state, favoritePresets }: LargeWidgetProps) {
  const timerText = state.remainingMinutes > 0
    ? `${Math.floor(state.remainingMinutes / 60)}:${String(state.remainingMinutes % 60).padStart(2, '0')}`
    : '∞';

  return (
    <View style={styles.container}>
      {/* Top row: status + play button */}
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.presetName} numberOfLines={1}>
            {state.presetName || 'Deep Sleep'}
          </Text>
          <Text style={styles.timer}>{timerText}</Text>
        </View>
        <Pressable style={styles.playBtn}>
          <Text style={styles.playIcon}>{state.isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
      </View>

      {/* Bottom row: favorite presets */}
      <View style={styles.presetsRow}>
        {favoritePresets.slice(0, 3).map((p) => (
          <Pressable key={p.id} style={styles.presetChip}>
            <Text style={styles.presetChipText} numberOfLines={1}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(20,20,40,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  timer: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#456eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
