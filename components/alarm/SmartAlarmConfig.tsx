import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Toggle } from '@/components/ui/Toggle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SmartAlarmConfig as SmartAlarmConfigType, SmartAlarmSensitivity } from '@/types';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';

interface Props {
  config: SmartAlarmConfigType | null | undefined;
  onChange: (config: SmartAlarmConfigType | null) => void;
}

const WINDOW_OPTIONS = [10, 20, 30];
const SENSITIVITY_OPTIONS: SmartAlarmSensitivity[] = ['low', 'medium', 'high'];

export function SmartAlarmConfigView({ config, onChange }: Props) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const enabled = config?.enabled ?? false;
  const windowMinutes = config?.windowMinutes ?? 30;
  const sensitivity = config?.sensitivity ?? 'medium';

  const windowIdx = WINDOW_OPTIONS.indexOf(windowMinutes);
  const sensitivityIdx = SENSITIVITY_OPTIONS.indexOf(sensitivity);

  const windowLabels = WINDOW_OPTIONS.map((m) => t('smartAlarm.windowMin', { min: m, defaultValue: `${m}분` }));
  const sensitivityLabels = [
    t('smartAlarm.sensitivityLow', { defaultValue: '낮음' }),
    t('smartAlarm.sensitivityMedium', { defaultValue: '보통' }),
    t('smartAlarm.sensitivityHigh', { defaultValue: '높음' }),
  ];

  const handleToggle = (val: boolean) => {
    if (val) {
      onChange({ enabled: true, windowMinutes: 30, sensitivity: 'medium' });
    } else {
      onChange(null);
    }
  };

  const handleWindowChange = (idx: number) => {
    onChange({ enabled: true, windowMinutes: WINDOW_OPTIONS[idx], sensitivity });
  };

  const handleSensitivityChange = (idx: number) => {
    onChange({ enabled: true, windowMinutes, sensitivity: SENSITIVITY_OPTIONS[idx] });
  };

  return (
    <View>
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{t('smartAlarm.title', { defaultValue: '스마트 알람' })}</Text>
          <Text style={styles.hint}>{t('smartAlarm.desc', { defaultValue: '가벼운 수면에서 자연스럽게 깨워줍니다' })}</Text>
        </View>
        <Toggle value={enabled} onValueChange={handleToggle} />
      </View>

      {enabled && (
        <View style={styles.configArea}>
          {/* Info banner */}
          <View style={[styles.infoBanner, { borderColor: themeColors.glassBorder }]}>
            <MaterialIcons name="info-outline" size={16} color={themeColors.accent1} />
            <Text style={styles.infoText}>
              {t('smartAlarm.placementHint', { defaultValue: '스마트폰을 매트리스 위에 놓아주세요. 충전 중 사용을 권장합니다.' })}
            </Text>
          </View>

          {/* Window setting */}
          <Text style={styles.subLabel}>{t('smartAlarm.window', { defaultValue: '감지 윈도우' })}</Text>
          <SegmentedControl
            options={windowLabels}
            selectedIndex={windowIdx >= 0 ? windowIdx : 2}
            onSelect={handleWindowChange}
          />

          {/* Sensitivity */}
          <Text style={styles.subLabel}>{t('smartAlarm.sensitivity', { defaultValue: '민감도' })}</Text>
          <SegmentedControl
            options={sensitivityLabels}
            selectedIndex={sensitivityIdx >= 0 ? sensitivityIdx : 1}
            onSelect={handleSensitivityChange}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  hint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  configArea: { marginTop: 8, gap: 8 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
});
