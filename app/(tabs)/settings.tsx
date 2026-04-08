import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Modal } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { AppLanguage, AudioQuality, VolumeChangeSpeed, ThemeMode, ThemeColor } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsStore();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const { t } = useTranslation();

  const QUALITY_OPTIONS: OptionItem<AudioQuality>[] = [
    { value: 'low', label: t('settings.qualityLow') },
    { value: 'medium', label: t('settings.qualityMedium') },
    { value: 'high', label: t('settings.qualityHigh') },
  ];
  const QUALITY_LABELS: Record<AudioQuality, string> = { low: t('settings.qualityLow'), medium: t('settings.qualityMedium'), high: t('settings.qualityHigh') };

  const SPEED_OPTIONS: OptionItem<VolumeChangeSpeed>[] = [
    { value: 'slow', label: t('settings.speedSlow') },
    { value: 'medium', label: t('settings.speedMedium') },
    { value: 'fast', label: t('settings.speedFast') },
  ];
  const SPEED_LABELS: Record<VolumeChangeSpeed, string> = { slow: t('settings.speedSlow'), medium: t('settings.speedMedium'), fast: t('settings.speedFast') };

  const LANG_OPTIONS: OptionItem<AppLanguage>[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
  ];
  const LANG_LABELS: Record<AppLanguage, string> = { ko: '한국어', en: 'English' };

  const THEME_COLORS: { value: ThemeColor; label: string }[] = [
    { value: '#456eea', label: t('colors.blue') },
    { value: '#8b5cf6', label: t('colors.purple') },
    { value: '#a855f7', label: t('colors.violet') },
    { value: '#6366f1', label: t('colors.indigo') },
    { value: '#ec4899', label: t('colors.pink') },
    { value: '#f43f5e', label: t('colors.rose') },
    { value: '#ef4444', label: t('colors.red') },
    { value: '#f97316', label: t('colors.orange') },
    { value: '#eab308', label: t('colors.yellow') },
    { value: '#22c55e', label: t('colors.green') },
    { value: '#14b8a6', label: t('colors.teal') },
    { value: '#06b6d4', label: t('colors.cyan') },
  ];

  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [medicalModalVisible, setMedicalModalVisible] = useState(false);
  const [themeColorModalVisible, setThemeColorModalVisible] = useState(false);

  return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* ────── GENERAL ────── */}
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.group}>

            {/* Theme Color */}
            <View style={styles.themeSection}>
              <View style={styles.themeHeader}>
                <MaterialIcons name="palette" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.rowLabel, { flex: 1 }]}>{t('settings.themeColor')}</Text>
                <Pressable onPress={() => setThemeColorModalVisible(true)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: settings.themeColor || '#456eea' }} />
                    <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Language */}
            <SettingRow
              icon="language"
              label={t('settings.language')}
              rightText={LANG_LABELS[settings.language]}
              onPress={() => setLangModalVisible(true)}
            />

            <View style={styles.divider} />

            {/* Auto Brightness */}
            <View style={styles.row}>
              <MaterialIcons name="brightness-6" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.rowLabel, { flex: 1 }]}>{t('settings.autoDimBrightness')}</Text>
              <Toggle
                value={settings.autoDimBrightness}
                onValueChange={(v) => updateSettings({ autoDimBrightness: v })}
              />
            </View>

            <View style={styles.divider} />

          </View>

          {/* ────── AUDIO ────── */}
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <View style={styles.group}>
            <SettingRow
              icon="music-note"
              label={t('settings.audioQuality')}
              rightText={QUALITY_LABELS[settings.audioQuality]}
              onPress={() => setQualityModalVisible(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="tune"
              label={t('settings.volumeChangeSpeed')}
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
              <Text style={[styles.rowLabel, { flex: 1 }]}>{t('settings.subscriptionStatus')}</Text>
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
              label={t('settings.restorePurchases')}
              onPress={async () => {
                await BillingService.restorePurchases();
              }}
            />
          </View>

          {/* ────── INFO ────── */}
          <Text style={styles.sectionTitle}>INFO</Text>
          <View style={styles.group}>
            <SettingRow icon="description" label={t('settings.privacyPolicy')} onPress={() => setPrivacyModalVisible(true)} />
            <View style={styles.divider} />
            <SettingRow icon="article" label={t('settings.termsOfService')} onPress={() => setTermsModalVisible(true)} />
            <View style={styles.divider} />
            <SettingRow icon="medical-services" label={t('settings.medicalDisclaimer')} onPress={() => setMedicalModalVisible(true)} />
            <View style={styles.divider} />
            <SettingRow
              icon="email"
              label={t('settings.contact')}
              onPress={() => Linking.openURL('mailto:support@deepsleep.app')}
            />
            <View style={styles.divider} />
            <View style={styles.row}>
              <MaterialIcons name="info-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.rowLabel, { flex: 1 }]}>{t('settings.appVersion')}</Text>
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
          title={t('settings.audioQuality')}
          options={QUALITY_OPTIONS}
          selected={settings.audioQuality}
          onSelect={(v) => updateSettings({ audioQuality: v })}
          onClose={() => setQualityModalVisible(false)}
        />
        <OptionModal
          visible={speedModalVisible}
          title={t('settings.volumeChangeSpeed')}
          options={SPEED_OPTIONS}
          selected={settings.volumeChangeSpeed}
          onSelect={(v) => updateSettings({ volumeChangeSpeed: v })}
          onClose={() => setSpeedModalVisible(false)}
        />
        <OptionModal
          visible={langModalVisible}
          title={t('settings.language')}
          options={LANG_OPTIONS}
          selected={settings.language}
          onSelect={(v) => updateSettings({ language: v })}
          onClose={() => setLangModalVisible(false)}
        />
        <TermsModal
          visible={termsModalVisible}
          onClose={() => setTermsModalVisible(false)}
        />
        <TermsModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
          mode="privacy"
        />
        <TermsModal
          visible={medicalModalVisible}
          onClose={() => setMedicalModalVisible(false)}
          mode="medical"
        />
        <ThemeColorModal
          visible={themeColorModalVisible}
          colors={THEME_COLORS}
          selected={settings.themeColor || '#456eea'}
          onSelect={(v) => updateSettings({ themeColor: v as any })}
          onClose={() => setThemeColorModalVisible(false)}
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

function ThemeColorModal({
  visible,
  colors: colorOptions,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  colors: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const [tempSelected, setTempSelected] = React.useState(selected);
  const { t: tt } = useTranslation();
  React.useEffect(() => {
    if (visible) setTempSelected(selected);
  }, [visible, selected]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 }} onPress={onClose}>
        <Pressable style={{
          backgroundColor: 'rgba(17,21,31,0.95)',
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        }} onPress={(e) => e.stopPropagation()}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: 20 }}>
            {tt('settings.themeColor')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 4 }}
          >
            {colorOptions.map((c) => {
              const isSel = c.value === tempSelected;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => setTempSelected(c.value)}
                  style={{ alignItems: 'center', gap: 6 }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: c.value,
                    borderWidth: isSel ? 3 : 0,
                    borderColor: '#ffffff',
                  }}>
                    {isSel && (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialIcons name="check" size={22} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: isSel ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            style={{
              marginTop: 24,
              backgroundColor: tempSelected,
              borderRadius: 9999,
              paddingVertical: 14,
              alignItems: 'center',
            }}
            onPress={() => { onSelect(tempSelected); onClose(); }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#ffffff' }}>
              {tt('common.ok')}
            </Text>
          </Pressable>
          <Pressable style={{ marginTop: 8, paddingVertical: 10, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{tt('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
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
