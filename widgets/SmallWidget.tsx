/**
 * SmallWidget (2×1) — 재생/정지 버튼 + 현재 프리셋명
 *
 * react-native-android-widget의 FlexWidget으로 구현.
 * 실제 위젯 렌더링은 라이브러리 설치 후 활성화.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WidgetState } from './WidgetTaskHandler';

interface SmallWidgetProps {
  state: WidgetState;
}

export function SmallWidget({ state }: SmallWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.presetName} numberOfLines={1}>
        {state.presetName || 'Deep Sleep'}
      </Text>
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
  presetName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#456eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
});
