import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toggle } from '@/components/ui/Toggle';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import * as BillingService from '@/services/BillingService';
import { colors, typography, spacing, layout } from '@/theme';
import { AppLanguage, AudioQuality, VolumeChangeSpeed } from '@/types';

const QUALITY_LABELS: Record<AudioQuality, string> = { low: '낮음', medium: '보통', high: '높음' };
const SPEED_LABELS: Record<VolumeChangeSpeed, string> = { slow: '느림', medium: '보통', fast: '빠름' };
const LANG_LABELS: Record<AppLanguage, string> = { ko: '한국어', en: 'English' };

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const cycleQuality = () => {
    const order: AudioQuality[] = ['low', 'medium', 'high'];
    const idx = order.indexOf(settings.audioQuality);
    updateSettings({ audioQuality: order[(idx + 1) % 3] });
  };

  const cycleSpeed = () => {
    const order: VolumeChangeSpeed[] = ['slow', 'medium', 'fast'];
    const idx = order.indexOf(settings.volumeChangeSpeed);
    updateSettings({ volumeChangeSpeed: order[(idx + 1) % 3] });
  };

  const cycleLang = () => {
    updateSettings({ language: settings.language === 'ko' ? 'en' : 'ko' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* General */}
        <Text style={styles.sectionTitle}>일반</Text>
        <View style={styles.group}>
          <SettingRow
            icon="🌙"
            label="다크 모드"
            right={<Toggle value={settings.darkMode} onValueChange={(v) => updateSettings({ darkMode: v })} />}
          />
          <Divider />
          <SettingRow icon="🌐" label="언어" rightText={LANG_LABELS[settings.language]} onPress={cycleLang} />
          <Divider />
          <SettingRow
            icon="📱"
            label="자동 수면 화면"
            right={
              <Toggle
                value={settings.autoSleepScreen}
                onValueChange={(v) => updateSettings({ autoSleepScreen: v })}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="🔅"
            label="자동 밝기 감소"
            right={
              <Toggle
                value={settings.autoDimBrightness}
                onValueChange={(v) => updateSettings({ autoDimBrightness: v })}
              />
            }
          />
        </View>

        {/* Audio */}
        <Text style={styles.sectionTitle}>오디오</Text>
        <View style={styles.group}>
          <SettingRow
            icon="🎵"
            label="오디오 품질"
            rightText={QUALITY_LABELS[settings.audioQuality]}
            onPress={cycleQuality}
          />
          <Divider />
          <SettingRow
            icon="〰️"
            label="음량 변화 속도"
            rightText={SPEED_LABELS[settings.volumeChangeSpeed]}
            onPress={cycleSpeed}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.group}>
          <SettingRow
            icon="👑"
            label="구독 상태"
            rightText={isPremium ? 'Premium' : '무료'}
            onPress={() => router.push('/subscription')}
          />
          <Divider />
          <SettingRow
            icon="🔄"
            label="구매 복원"
            onPress={async () => {
              await BillingService.restorePurchases();
            }}
          />
        </View>

        {/* Info */}
        <Text style={styles.sectionTitle}>정보</Text>
        <View style={styles.group}>
          <SettingRow icon="📄" label="개인정보 처리방침" onPress={() => {}} />
          <Divider />
          <SettingRow icon="📋" label="이용약관" onPress={() => {}} />
          <Divider />
          <SettingRow icon="📧" label="문의하기" onPress={() => Linking.openURL('mailto:support@deepsleep.app')} />
          <Divider />
          <SettingRow icon="ℹ️" label="앱 버전" rightText="v1.0.0" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  right,
  rightText,
  onPress,
}: {
  icon: string;
  label: string;
  right?: React.ReactNode;
  rightText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress && !right}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? (
        <View style={styles.rowRight}>
          {rightText && <Text style={styles.rowValue}>{rightText}</Text>}
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    height: layout.headerHeight,
    justifyContent: 'center',
  },
  title: { ...typography.h1, color: colors.textPrimary },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  group: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: layout.cardPadding,
    gap: spacing.md,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowValue: { ...typography.body, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.glassBorder, marginLeft: 52 },
});
