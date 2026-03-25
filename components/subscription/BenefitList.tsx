import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

const BENEFITS = [
  '모든 광고 제거',
  '61개 프리미엄 소리',
  '무제한 프리셋 저장',
  'AI 사운드 추천',
  '팬(Pan) 조절',
  '상세 수면 통계',
];

export function BenefitList() {
  return (
    <View style={styles.container}>
      {BENEFITS.map((b, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.check}>✅</Text>
          <Text style={styles.text}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  check: {
    fontSize: 16,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
});
