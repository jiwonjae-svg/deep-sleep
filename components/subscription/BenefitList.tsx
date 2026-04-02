import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing } from '@/theme';

const BENEFITS = [
  '모든 광고 제거',
  '61개 프리미엄 소리',
  '무제한 프리셋 저장',
  'AI 사운드 추천',
  '팬(Pan) 조절',
  '상세 수면 통계',
];

export function BenefitList() {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: spacing.md },
        row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        text: { ...typography.bodyMedium, color: themeColors.textPrimary },
      }),
    [themeColors],
  );

  return (
    <View style={styles.container}>
      {BENEFITS.map((b, i) => (
        <View key={i} style={styles.row}>
          <MaterialIcons name="check-circle" size={18} color="#4ade80" />
          <Text style={styles.text}>{b}</Text>
        </View>
      ))}
    </View>
  );
}
