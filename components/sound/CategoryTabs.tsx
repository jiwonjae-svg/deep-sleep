import React, { useMemo } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { categories } from '@/data/categories';
import { getSoundsByCategory } from '@/data/sounds';
import { SoundCategory } from '@/types';
import { useThemeColors } from '@/theme';
import { spacing } from '@/theme';
import { useTranslation } from 'react-i18next';

interface CategoryTabsProps {
  selectedCategory: SoundCategory;
  onSelect: (category: SoundCategory) => void;
}

export function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const visibleCategories = useMemo(
    () => categories.filter((cat) => getSoundsByCategory(cat.id).length > 0),
    [],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {visibleCategories.map((cat) => {
        const isSelected = cat.id === selectedCategory;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? themeColors.accent1 : 'rgba(255,255,255,0.08)',
                borderColor: isSelected ? themeColors.accent1 : 'rgba(255,255,255,0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: isSelected ? themeColors.white : themeColors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {t(`categories.${cat.id}`, { defaultValue: cat.name })}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 24,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    alignItems: 'center',
  },
  pill: {
    borderRadius: 9999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: spacing.base,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
