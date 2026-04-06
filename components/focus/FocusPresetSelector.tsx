import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { FOCUS_PRESETS, FOCUS_TIMER_PRESETS } from '@/data/focusPresets';
import { useFocusStore } from '@/stores/useFocusStore';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export function FocusPresetSelector() {
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const config = useFocusStore((s) => s.config);
  const setConfig = useFocusStore((s) => s.setConfig);
  const focusSoundPresetId = useFocusStore((s) => s.focusSoundPresetId);
  const setFocusSoundPreset = useFocusStore((s) => s.setFocusSoundPreset);

  const timerLabels = FOCUS_TIMER_PRESETS.map((p) => p.label);
  const currentTimerIdx = FOCUS_TIMER_PRESETS.findIndex(
    (p) => p.focusMinutes === config.focusMinutes,
  );

  const handleTimerSelect = (idx: number) => {
    const preset = FOCUS_TIMER_PRESETS[idx];
    setConfig({
      focusMinutes: preset.focusMinutes,
      shortBreakMinutes: preset.shortBreakMinutes,
      longBreakMinutes: preset.longBreakMinutes,
    });
  };

  return (
    <View style={styles.container}>
      {/* Timer presets */}
      <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
        {t('focus.timerPreset', { defaultValue: '타이머' })}
      </Text>
      <SegmentedControl
        options={timerLabels}
        selectedIndex={currentTimerIdx >= 0 ? currentTimerIdx : 0}
        onSelect={handleTimerSelect}
      />

      {/* Sound presets */}
      <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
        {t('focus.soundPreset', { defaultValue: '집중 사운드' })}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.soundRow}>
        {/* None option */}
        <Pressable
          style={[
            styles.soundCard,
            { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder },
            !focusSoundPresetId && { borderColor: themeColors.accent1, backgroundColor: `${themeColors.accent1}15` },
          ]}
          onPress={() => setFocusSoundPreset(null)}
        >
          <Text style={styles.soundIcon}>🔇</Text>
          <Text style={[styles.soundName, { color: themeColors.textPrimary }]}>
            {t('focus.noSound', { defaultValue: '없음' })}
          </Text>
        </Pressable>

        {FOCUS_PRESETS.map((preset) => (
          <Pressable
            key={preset.id}
            style={[
              styles.soundCard,
              { backgroundColor: themeColors.glassLight, borderColor: themeColors.glassBorder },
              focusSoundPresetId === preset.id && { borderColor: themeColors.accent1, backgroundColor: `${themeColors.accent1}15` },
            ]}
            onPress={() => setFocusSoundPreset(preset.id)}
          >
            <Text style={styles.soundIcon}>{preset.icon}</Text>
            <Text style={[styles.soundName, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {t(preset.nameKey, { defaultValue: preset.id })}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  soundRow: {
    gap: 10,
    paddingBottom: 4,
  },
  soundCard: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  soundIcon: {
    fontSize: 24,
  },
  soundName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
