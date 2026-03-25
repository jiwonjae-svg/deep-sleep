import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing, layout } from '@/theme';
import { AI_MAX_INPUT_LENGTH } from '@/utils/constants';

interface AIInputSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export function AIInputSheet({ visible, onClose, onSubmit, isLoading }: AIInputSheetProps) {
  const [text, setText] = useState('');
  const remaining = AI_MAX_INPUT_LENGTH - text.length;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightPct={0.5}>
      <Text style={styles.title}>✨ AI 사운드 추천</Text>
      <Text style={styles.subtitle}>원하는 분위기나 기분을 설명해주세요</Text>

      <TextInput
        style={styles.input}
        placeholder="오늘 기분이 어떤가요?"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={(t) => setText(t.slice(0, AI_MAX_INPUT_LENGTH))}
        multiline
        maxLength={AI_MAX_INPUT_LENGTH}
        textAlignVertical="top"
      />

      <Text style={[styles.counter, remaining < 30 && styles.counterWarn]}>
        {text.length}/{AI_MAX_INPUT_LENGTH}
      </Text>

      <Button
        title={isLoading ? '추천 중...' : '추천받기'}
        onPress={() => onSubmit(text)}
        disabled={text.trim().length === 0}
        loading={isLoading}
        style={{ marginTop: spacing.base }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  input: {
    backgroundColor: colors.glassLight,
    borderRadius: layout.borderRadiusSm,
    padding: spacing.base,
    color: colors.textPrimary,
    ...typography.body,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  counterWarn: {
    color: colors.warning,
  },
});
