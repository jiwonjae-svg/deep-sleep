import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, layout } from '@/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((label, i) => {
        const isSelected = i === selectedIndex;
        return (
          <Pressable
            key={i}
            onPress={() => !disabled && onSelect(i)}
            style={[
              styles.segment,
              isSelected && styles.segmentActive,
              disabled && styles.segmentDisabled,
            ]}
          >
            <Text
              style={[
                styles.label,
                isSelected && styles.labelActive,
                disabled && styles.labelDisabled,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassMedium,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  segmentActive: {
    backgroundColor: colors.accent1,
  },
  segmentDisabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.buttonSmall,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
