import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useThemeColors, typography, spacing, layout } from '@/theme';

export interface OptionItem<T extends string = string> {
  value: T;
  label: string;
}

interface OptionModalProps<T extends string = string> {
  visible: boolean;
  title: string;
  options: OptionItem<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export function OptionModal<T extends string = string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: OptionModalProps<T>) {
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: { flex: 1, backgroundColor: themeColors.overlay, justifyContent: 'center', paddingHorizontal: layout.screenPaddingH },
        sheet: {
          backgroundColor: themeColors.bgSecondary,
          borderRadius: layout.borderRadiusLg,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
          paddingHorizontal: layout.cardPadding,
          gap: spacing.md,
        },
        title: { ...typography.h3, color: themeColors.textPrimary, textAlign: 'center', paddingBottom: spacing.sm },
        option: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.base,
          paddingHorizontal: spacing.md,
          borderRadius: layout.borderRadiusSm,
        },
        optionSelected: { backgroundColor: themeColors.glassLight },
        optionLabel: { ...typography.body, color: themeColors.textSecondary, flex: 1 },
        optionLabelSelected: { color: themeColors.accent1, fontWeight: '600' },
        check: { color: themeColors.accent1, fontSize: 18, fontWeight: '700' },
        divider: { height: 1, backgroundColor: themeColors.glassBorder },
        cancelBtn: { marginTop: spacing.sm, paddingVertical: spacing.md, alignItems: 'center' },
        cancelText: { ...typography.body, color: themeColors.textMuted },
      }),
    [themeColors],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <Pressable
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={undefined}
          />
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
