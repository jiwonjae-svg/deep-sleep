import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { Preset } from '@/types';
import { PresetCard } from './PresetCard';
import { useThemeColors, typography, spacing, layout } from '@/theme';

interface PresetListProps {
  defaultPresets: Preset[];
  customPresets: Preset[];
  onPresetPress: (preset: Preset) => void;
  onPresetLongPress?: (preset: Preset) => void;
}

export function PresetList({
  defaultPresets,
  customPresets,
  onPresetPress,
  onPresetLongPress,
}: PresetListProps) {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionTitle: {
          ...typography.h2,
          color: themeColors.textPrimary,
          marginBottom: spacing.md,
        },
        separator: { height: spacing.md },
        sectionSeparator: { height: spacing.xl },
        content: {
          paddingHorizontal: layout.screenPaddingH,
          paddingBottom: 100,
        },
      }),
    [themeColors],
  );

  const sections = [
    { title: '기본 프리셋', data: defaultPresets },
    ...(customPresets.length > 0 ? [{ title: '내 프리셋', data: customPresets }] : []),
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <PresetCard
          preset={item}
          onPress={() => onPresetPress(item)}
          onLongPress={() => onPresetLongPress?.(item)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}


