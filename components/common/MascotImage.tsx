import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MascotImageProps {
  pose?: string;
  size?: number;
}

/**
 * 마스코트 이미지 컴포넌트.
 * TODO: 실제 이미지 에셋으로 교체
 * 현재는 이모지 placeholder를 사용.
 */
export function MascotImage({ pose = 'standby', size = 200 }: MascotImageProps) {
  const emoji = POSE_EMOJIS[pose] ?? '🐻';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
    </View>
  );
}

const POSE_EMOJIS: Record<string, string> = {
  standby: '🐻',
  sleeping: '😴',
  yawning: '🥱',
  waving: '👋',
  mixing: '🎧',
  alarm: '⏰',
  stretching: '🙆',
  crown: '👑',
  reading: '📖',
  happy: '😊',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {},
});
