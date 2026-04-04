import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { CoachingTip } from '@/services/SleepCoachingService';

interface CoachingCardProps {
  tips: CoachingTip[];
}

const TYPE_COLORS: Record<string, string> = {
  bedtime: '#7C83FF',
  duration: '#64D2FF',
  sound: '#A78BFA',
  consistency: '#F59E0B',
  trend: '#34D399',
  noise: '#FB923C',
  general: '#94A3B8',
};

export function CoachingCard({ tips }: CoachingCardProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  if (tips.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder }]}>
      <View style={styles.header}>
        <MaterialIcons name="psychology" size={18} color={themeColors.accent1} />
        <Text style={[styles.title, { color: themeColors.textSecondary }]}>{t('coaching.title')}</Text>
      </View>

      {tips.map((tip, i) => {
        const accentColor = TYPE_COLORS[tip.type] ?? themeColors.textMuted;
        return (
          <View key={tip.id} style={[styles.tipRow, i < tips.length - 1 && styles.tipBorder, { borderColor: `${themeColors.glassBorder}80` }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}15` }]}>
              <MaterialIcons name={tip.icon as any} size={18} color={accentColor} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: themeColors.textPrimary }]}>
                {t(tip.titleKey)}
              </Text>
              <Text style={[styles.tipMessage, { color: themeColors.textMuted }]}>
                {t(tip.messageKey, tip.messageParams)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  tipBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipMessage: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});
