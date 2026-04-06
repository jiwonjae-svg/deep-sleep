/**
 * MediumWidget (4×1) — 재생/정지 + 프리셋명 + 타이머 잔여시간
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WidgetState } from './WidgetTaskHandler';

interface MediumWidgetProps {
  state: WidgetState;
}

export function MediumWidget({ state }: MediumWidgetProps) {
  const timerText = state.remainingMinutes > 0
    ? `${Math.floor(state.remainingMinutes / 60)}:${String(state.remainingMinutes % 60).padStart(2, '0')}`
    : '∞';

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20,20,40,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  timer: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#456eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});
