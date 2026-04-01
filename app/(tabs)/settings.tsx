import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Toggle } from '@/components/ui/Toggle';
import { OptionModal, OptionItem } from '@/components/ui/OptionModal';
import { TermsModal } from '@/components/settings/TermsModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import * as BillingService from '@/services/BillingService';
import { spacing, layout } from '@/theme';
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
  const { settings, updateSettings } = useSettingsStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ────── GENERAL ────── */}
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.group}>

            {/* Theme Radio Group */}
            <View style={styles.themeSection}>
              <View style={styles.themeHeader}>
                <MaterialIcons name="palette" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.rowLabel}>테마</Text>
              </View>
              <View style={styles.radioGroup}>
                {THEME_OPTIONS.map((opt) => {
                  const selected = settings.themeMode === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[styles.radioOption, selected && styles.radioOptionActive]}
                      onPress={() => updateSettings({ themeMode: opt.value })}
                    >
                      <Text style={[styles.radioLabel, selected && styles.radioLabelActive]}>
                        {opt.label}
                      </Text>
                      {selected ? (
                        <MaterialIcons name="check-circle" size={20} color="#ffffff" />
                      ) : (
                        <View style={styles.radioCircle} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Language */}
            <SettingRow
              icon="language"
              label="언어"
              rightText={LANG_LABELS[settings.language]}
              onPress={() => setLangModalVisible(true)}
            />

            <View style={styles.divider} />

            {/* Auto Brightness */}
            <View style={styles.row}>
              <MaterialIcons name="brightness-6" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.rowLabel, { flex: 1 }]}>자동 밝기 감소</Text>
              <Toggle
                value={settings.autoDimBrightness}
                onValueChange={(v) => updateSettings({ autoDimBrightness: v })}
              />
            </View>
          </View>

          {/* ────── AUDIO ────── */}
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <View style={styles.group}>
            <SettingRow
              icon="music-note"
              label="오디오 품질"
              rightText={QUALITY_LABELS[settings.audioQuality]}
              onPress={() => setQualityModalVisible(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="tune"
              label="음량 변화 속도"
              rightText={SPEED_LABELS[settings.volumeChangeSpeed]}
              onPress={() => setSpeedModalVisible(true)}
            />
          </View>

          {/* ────── ACCOUNT ────── */}
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.group}>
            <View style={styles.row}>
              <MaterialIcons
                name="workspace-premium"
                size={20}
                color="#FFD700"
              />
              <Text style={[styles.rowLabel, { flex: 1 }]}>구독 상태</Text>
              <Pressable
                style={styles.badge}
                onPress={() => router.push('/subscription')}
              >
                <Text style={styles.badgeText}>{isPremium ? 'PREMIUM' : 'FREE'}</Text>
              </Pressable>
            </View>
            <View style={styles.divider} />
            <SettingRow
              icon="restore"
              label="구매 복원"
              onPress={async () => {
                await BillingService.restorePurchases();
              }}
            />
          </View>

          {/* ────── INFO ────── */}
          <Text style={styles.sectionTitle}>INFO</Text>
          <View style={styles.group}>
            <SettingRow icon="description" label="개인정보 처리방침" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow icon="article" label="이용약관" onPress={() => setTermsModalVisible(true)} />
            <View style={styles.divider} />
            <SettingRow
              icon="email"
              label="문의하기"
              onPress={() => Linking.openURL('mailto:support@deepsleep.app')}
            />
            <View style={styles.divider} />
            <View style={styles.row}>
              <MaterialIcons name="info-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.rowLabel, { flex: 1 }]}>앱 버전</Text>
              <Text style={styles.rowValue}>v1.0.0</Text>
            </View>
          </View>

          {/* Footer Branding */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>NOCTURNE GLASS V1.0.0</Text>
            <Text style={styles.footerSub}>Celestial Sanctuary Design System</Text>
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

/* ────── Helper Components ────── */

function SettingRow({
  icon,
  label,
  rightText,
  onPress,
}: {
  icon: string;
  label: string;
  rightText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <MaterialIcons name={icon as any} size={20} color="rgba(255,255,255,0.7)" />
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <View style={styles.rowRight}>
        {rightText && <Text style={styles.rowValue}>{rightText}</Text>}
        {onPress && (
          <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
        )}
      </View>
    </Pressable>
  );
}

/* ────── Styles ────── */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  group: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
  },
  // Theme radio
  themeSection: {
    padding: 20,
    gap: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
  },
  radioOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: -0.3,
  },
  radioLabelActive: {
    color: '#ffffff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  // Badge (subscription status)
  badge: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  // Footer
  footer: {
    paddingTop: 32,
    alignItems: 'center',
    gap: 4,
    opacity: 0.3,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  footerSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
  },
});
