import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { MathProblem as MathProblemType } from '@/types';
import { useThemeColors, typography, spacing, layout } from '@/theme';

interface MathProblemProps {
  problem: MathProblemType;
  onSolved: () => void;
  onWrong: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

export function MathProblemView({ problem, onSolved, onWrong }: MathProblemProps) {
  const [input, setInput] = useState('');
  const themeColors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { alignItems: 'center', gap: spacing.xl },
        question: { ...typography.h1, color: themeColors.textPrimary, textAlign: 'center' },
        inputContainer: {
          backgroundColor: themeColors.glassLight,
          borderRadius: layout.borderRadiusSm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          minWidth: 200,
          alignItems: 'center',
        },
        input: { ...typography.h1, color: themeColors.textPrimary, textAlign: 'center' },
        keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, maxWidth: 240 },
        key: {
          width: 64,
          height: 64,
          borderRadius: layout.borderRadiusMd,
          backgroundColor: themeColors.glassMedium,
          alignItems: 'center',
          justifyContent: 'center',
        },
        keyConfirm: { backgroundColor: themeColors.accent2 },
        keyText: { ...typography.h2, color: themeColors.textPrimary },
        keyConfirmText: { color: '#ffffff' },
      }),
    [themeColors],
  );

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setInput((prev) => prev.slice(0, -1));
    } else if (key === '✓') {
      if (parseInt(input, 10) === problem.answer) {
        onSolved();
      } else {
        onWrong();
        setInput('');
      }
    } else {
      if (input.length < 6) {
        setInput((prev) => prev + key);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Problem */}
      <Text style={styles.question}>{problem.question}</Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.input}>{input || '_____'}</Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((key) => {
          const isConfirm = key === '✓';
          return (
            <Pressable
              key={key}
              onPress={() => handleKey(key)}
              style={[styles.key, isConfirm && styles.keyConfirm]}
            >
              <Text style={[styles.keyText, isConfirm && styles.keyConfirmText]}>{key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
