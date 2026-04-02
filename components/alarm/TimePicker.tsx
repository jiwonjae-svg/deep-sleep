import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing } from '@/theme';

interface TimePickerProps {
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}

export function TimePicker({ hour, minute, onHourChange, onMinuteChange }: TimePickerProps) {
  const themeColors = useThemeColors();
  const [editingHour, setEditingHour] = useState(false);
  const [editingMinute, setEditingMinute] = useState(false);
  const [hourText, setHourText] = useState('');
  const [minuteText, setMinuteText] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
        column: { alignItems: 'center' },
        arrow: { padding: spacing.sm },
        arrowText: { fontSize: 24, color: themeColors.textSecondary },
        value: { fontFamily: 'monospace', fontSize: 56, fontWeight: '700', color: themeColors.textPrimary, lineHeight: 68 },
        valueInput: {
          fontFamily: 'monospace',
          fontSize: 56,
          fontWeight: '700',
          color: themeColors.textPrimary,
          lineHeight: 68,
          textAlign: 'center',
          minWidth: 80,
          padding: 0,
          borderBottomWidth: 2,
          borderBottomColor: themeColors.accent1,
        },
        colon: { fontSize: 48, fontWeight: '700', color: themeColors.textPrimary, marginTop: -4 },
      }),
    [themeColors],
  );

  const handleHourPress = () => {
    setHourText(String(hour).padStart(2, '0'));
    setEditingHour(true);
  };

  const handleHourSubmit = () => {
    const val = parseInt(hourText, 10);
    if (!isNaN(val) && val >= 0 && val <= 23) {
      onHourChange(val);
    }
    setEditingHour(false);
  };

  const handleMinutePress = () => {
    setMinuteText(String(minute).padStart(2, '0'));
    setEditingMinute(true);
  };

  const handleMinuteSubmit = () => {
    const val = parseInt(minuteText, 10);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      onMinuteChange(val);
    }
    setEditingMinute(false);
  };

  return (
    <View style={styles.container}>
      {/* Hour */}
      <View style={styles.column}>
        <Pressable onPress={() => onHourChange((hour + 1) % 24)} style={styles.arrow}>
          <MaterialIcons name="keyboard-arrow-up" size={32} color={themeColors.textSecondary} />
        </Pressable>
        {editingHour ? (
          <TextInput
            style={styles.valueInput}
            value={hourText}
            onChangeText={(t) => setHourText(t.replace(/[^0-9]/g, '').slice(0, 2))}
            onBlur={handleHourSubmit}
            onSubmitEditing={handleHourSubmit}
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Pressable onPress={handleHourPress}>
            <Text style={styles.value}>{String(hour).padStart(2, '0')}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onHourChange((hour - 1 + 24) % 24)} style={styles.arrow}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={themeColors.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.colon}>:</Text>

      {/* Minute */}
      <View style={styles.column}>
        <Pressable onPress={() => onMinuteChange((minute + 1) % 60)} style={styles.arrow}>
          <MaterialIcons name="keyboard-arrow-up" size={32} color={themeColors.textSecondary} />
        </Pressable>
        {editingMinute ? (
          <TextInput
            style={styles.valueInput}
            value={minuteText}
            onChangeText={(t) => setMinuteText(t.replace(/[^0-9]/g, '').slice(0, 2))}
            onBlur={handleMinuteSubmit}
            onSubmitEditing={handleMinuteSubmit}
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Pressable onPress={handleMinutePress}>
            <Text style={styles.value}>{String(minute).padStart(2, '0')}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onMinuteChange((minute - 1 + 60) % 60)} style={styles.arrow}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={themeColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}
