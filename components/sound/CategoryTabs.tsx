import React, { useMemo } from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { categories } from '@/data/categories';
import { getSoundsByCategory } from '@/data/sounds';
import { SoundCategory } from '@/types';
import { useThemeColors } from '@/theme';
import { typography, spacing } from '@/theme';

interface CategoryTabsProps {
  selectedCategory: SoundCategory;
  onSelect: (category: SoundCategory) => void;
}

export function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
  const themeColors = useThemeColors();

  // 소리가 하나도 없는 카테고리는 탭에서 제거한다
  const visibleCategories = useMemo(
    () => categories.filter((cat) => getSoundsByCategory(cat.id).length > 0),
    [],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {visibleCategories.map((cat) => {
        const isSelected = cat.id === selectedCategory;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={styles.tab}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.label,
                { color: isSelected ? themeColors.textPrimary : themeColors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
            {isSelected && (
              <View style={[styles.indicator, { backgroundColor: themeColors.accent1 }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
    paddingBottom: spacing.sm,
    alignItems: 'flex-start', // prevent tabs from stretching vertically
  },
  tab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minWidth: 56,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
});
