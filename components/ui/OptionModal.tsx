import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [tempSelected, setTempSelected] = useState<T>(selected);

  // Sync tempSelected when modal opens or selected changes
  useEffect(() => {
    if (visible) setTempSelected(selected);
  }, [visible, selected]);

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

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
          gap: spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 10,
        },
        title: { ...typography.h3, color: themeColors.textPrimary, textAlign: 'center', paddingBottom: spacing.sm },
        optionsContainer: { gap: 8 },
        option: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderRadius: 24,
        },
        optionSelected: {
          backgroundColor: themeColors.glassMedium,
          borderWidth: 1,
          borderColor: themeColors.glassBorderActive,
        },
        optionLabel: { ...typography.body, color: themeColors.textSecondary, fontWeight: '700', letterSpacing: -0.3 },
        optionLabelSelected: { color: themeColors.textPrimary },
        radioCircle: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
        },
        confirmBtn: {
          marginTop: spacing.sm,
          paddingVertical: spacing.md,
          alignItems: 'center',
          backgroundColor: themeColors.accent1,
          borderRadius: 9999,
        },
        confirmText: { ...typography.body, color: '#ffffff', fontWeight: '700' },
        cancelBtn: { marginTop: spacing.xs, paddingVertical: spacing.md, alignItems: 'center' },
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
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.optionsContainer}>
            {options.map((item) => {
              const isSelected = item.value === tempSelected;
              return (
                <Pressable
                  key={item.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => setTempSelected(item.value)}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {item.label}
                  </Text>
                  {isSelected ? (
                    <MaterialIcons name="check-circle" size={20} color={themeColors.accent1} />
                  ) : (
                    <View style={styles.radioCircle} />
                  )}
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
