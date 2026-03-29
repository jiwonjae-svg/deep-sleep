import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toggle } from '@/components/ui/Toggle';
import { OptionModal, OptionItem } from '@/components/ui/OptionModal';
import { TermsModal } from '@/components/settings/TermsModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import * as BillingService from '@/services/BillingService';
import { useThemeColors, AppColors, typography, spacing, layout } from '@/theme';
import { AppLanguage, AudioQuality, VolumeChangeSpeed, ThemeMode } from '@/types';

const QUALITY_OPTIONS: OptionItem<AudioQuality>[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
];
const QUALITY_LABELS: Record<AudioQuality, string> = { low: '낮음', medium: '보통', high: '높음' };

const SPEED_OPTIONS: OptionItem<VolumeChangeSpeed>[] = [
  { value: 'slow', label: '느림' },
  { value: 'medium', label: '보통' },
  { value: 'fast', label: '빠름' },
];
const SPEED_LABELS: Record<VolumeChangeSpeed, string> = { slow: '느림', medium: '보통', fast: '빠름' };

const LANG_OPTIONS: OptionItem<AppLanguage>[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];
const LANG_LABELS: Record<AppLanguage, string> = { ko: '한국어', en: 'English' };

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: '다크 모드' },
  { value: 'light', label: '라이트 모드' },
  { value: 'system', label: '시스템 설정' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { settings, updateSettings } = useSettingsStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const styles = useMemo(() => makeStyles(themeColors), [themeColors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* General */}
        <Text style={styles.sectionTitle}>일반</Text>
        <View style={styles.group}>
          {/* 테마 모드 — 라디오 버튼 */}
          <View style={styles.themeRow}>
            <Text style={styles.rowIcon}>🎨</Text>
            <View style={styles.themeContent}>
              <Text style={styles.rowLabel}>테마</Text>
              <View style={styles.radioGroup}>
                {THEME_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={styles.radioOption}
                    onPress={() => updateSettings({ themeMode: opt.value })}
                  >
                    <View style={[styles.radioCircle, settings.themeMode === opt.value && styles.radioCircleSelected]}>
                      {settings.themeMode === opt.value && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.radioLabel, settings.themeMode === opt.value && styles.radioLabelSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <Divider styles={styles} />
          <SettingRow
            styles={styles}
            icon="🌐"
            label="언어"
            rightText={LANG_LABELS[settings.language]}
            onPress={() => setLangModalVisible(true)}
          />
          <Divider styles={styles} />
          <SettingRow
            styles={styles}
            icon="📱"
            label="자동 수면 화면"
            right={
              <Toggle
                value={settings.autoSleepScreen}
                onValueChange={(v) => updateSettings({ autoSleepScreen: v })}
              />
            }
          />
          <Divider styles={styles} />
          <SettingRow
            styles={styles}
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
            styles={styles}
            icon="🎵"
            label="오디오 품질"
            rightText={QUALITY_LABELS[settings.audioQuality]}
            onPress={() => setQualityModalVisible(true)}
          />
          <Divider styles={styles} />
          <SettingRow
            styles={styles}
            icon="〰️"
            label="음량 변화 속도"
            rightText={SPEED_LABELS[settings.volumeChangeSpeed]}
            onPress={() => setSpeedModalVisible(true)}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.group}>
          <SettingRow
            styles={styles}
            icon="👑"
            label="구독 상태"
            rightText={isPremium ? 'Premium' : '무료'}
            onPress={() => router.push('/subscription')}
          />
          <Divider styles={styles} />
          <SettingRow
            styles={styles}
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
          <SettingRow styles={styles} icon="📄" label="개인정보 처리방침" onPress={() => {}} />
          <Divider styles={styles} />
          <SettingRow styles={styles} icon="📋" label="이용약관" onPress={() => setTermsModalVisible(true)} />
          <Divider styles={styles} />
          <SettingRow styles={styles} icon="📧" label="문의하기" onPress={() => Linking.openURL('mailto:support@deepsleep.app')} />
          <Divider styles={styles} />
          <SettingRow styles={styles} icon="ℹ️" label="앱 버전" rightText="v1.0.0" />
        </View>
      </ScrollView>

      {/* Modals */}
      <OptionModal
        visible={qualityModalVisible}
        title="오디오 품질"
        options={QUALITY_OPTIONS}
        selected={settings.audioQuality}
        onSelect={(v) => updateSettings({ audioQuality: v })}
        onClose={() => setQualityModalVisible(false)}
      />
      <OptionModal
        visible={speedModalVisible}
        title="음량 변화 속도"
        options={SPEED_OPTIONS}
        selected={settings.volumeChangeSpeed}
        onSelect={(v) => updateSettings({ volumeChangeSpeed: v })}
        onClose={() => setSpeedModalVisible(false)}
      />
      <OptionModal
        visible={langModalVisible}
        title="언어"
        options={LANG_OPTIONS}
        selected={settings.language}
        onSelect={(v) => updateSettings({ language: v })}
        onClose={() => setLangModalVisible(false)}
      />
      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  right,
  rightText,
  onPress,
  styles,
}: {
  icon: string;
  label: string;
  right?: React.ReactNode;
  rightText?: string;
  onPress?: () => void;
  styles: ReturnType<typeof makeStyles>;
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

function Divider({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return <View style={styles.divider} />;
}

function makeStyles(c: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },
    header: {
      paddingHorizontal: layout.screenPaddingH,
      height: layout.headerHeight,
      justifyContent: 'center',
    },
    title: { ...typography.h1, color: c.textPrimary },
    content: {
      paddingHorizontal: layout.screenPaddingH,
      paddingBottom: 100,
      gap: spacing.sm,
    },
    sectionTitle: {
      ...typography.overline,
      color: c.textMuted,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    group: {
      backgroundColor: c.glassLight,
      borderRadius: layout.borderRadiusMd,
      borderWidth: 1,
      borderColor: c.glassBorder,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: layout.cardPadding,
      gap: spacing.md,
    },
    rowIcon: { fontSize: 18 },
    rowLabel: { ...typography.body, color: c.textPrimary, flex: 1 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    rowValue: { ...typography.body, color: c.textSecondary },
    chevron: { fontSize: 20, color: c.textMuted },
    divider: { height: 1, backgroundColor: c.glassBorder, marginLeft: 52 },
    // Theme radio
    themeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: layout.cardPadding,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    themeContent: {
      flex: 1,
      gap: spacing.sm,
    },
    radioGroup: {
      flexDirection: 'column',
      gap: spacing.sm,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingRight: spacing.md,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: c.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioCircleSelected: {
      borderColor: c.accent1,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.accent1,
    },
    radioLabel: {
      ...typography.body,
      color: c.textSecondary,
      fontSize: 13,
    },
    radioLabelSelected: {
      color: c.accent1,
      fontWeight: '600',
    },
  });
}
