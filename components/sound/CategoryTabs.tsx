import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { categories } from '@/data/categories';
import { SoundCategory } from '@/types';
import { colors, typography, spacing } from '@/theme';

interface CategoryTabsProps {
  selectedCategory: SoundCategory;
  onSelect: (category: SoundCategory) => void;
}

export function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedCategory;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[styles.tab, isSelected && { borderBottomColor: colors.accent1 }]}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, isSelected && styles.labelActive]} numberOfLines={1}>
              {cat.name}
            </Text>
            {isSelected && <View style={[styles.indicator, { backgroundColor: colors.accent1 }]} />}
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
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
  },
  indicator: {
    height: 2,
    borderRadius: 1,
    width: '100%',
    marginTop: 4,
  },
});
