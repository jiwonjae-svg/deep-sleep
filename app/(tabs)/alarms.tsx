import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlarm } from '@/hooks/useAlarm';
import { AlarmCard } from '@/components/alarm/AlarmCard';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { msUntilAlarm, formatRemainingTime } from '@/utils/formatTime';

export default function AlarmsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { alarms, toggleAlarm } = useAlarm();

  const nextAlarmText = useMemo(() => {
    const active = alarms.filter((a) => a.enabled);
    if (active.length === 0) return null;
    const best = active.reduce<{ ms: number; label: string } | null>((acc, a) => {
      const ms = msUntilAlarm(a.time.hour, a.time.minute);
      if (!acc || ms < acc.ms) return { ms, label: formatRemainingTime(ms) };
      return acc;
    }, null);
    return best ? `${best.label} 뒤에 알람이 울립니다` : null;
  }, [alarms]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        header: {
          paddingHorizontal: layout.screenPaddingH,
          height: layout.headerHeight,
          justifyContent: 'center',
        },
        title: { ...typography.h1, color: '#ffffff' },
        countdown: {
          fontSize: 20,
          fontWeight: '800',
          color: themeColors.accent1,
          textAlign: 'center',
          paddingHorizontal: layout.screenPaddingH,
          paddingBottom: spacing.md,
          textShadowColor: 'rgba(69,110,234,0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        },
        list: { paddingHorizontal: layout.screenPaddingH, paddingBottom: 120 },
        empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
        emptyImage: { width: 200, height: 200, marginBottom: spacing.sm },
        emptyText: { ...typography.h3, color: '#ffffff' },
        emptyHint: { ...typography.caption, color: 'rgba(255,255,255,0.4)' },
        fab: {
          position: 'absolute',
          bottom: 100,
          right: layout.screenPaddingH,
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: themeColors.accent1,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: themeColors.accent1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
        },
      }),
    [themeColors],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>알람</Text>
      </View>

      {/* Countdown */}
      {nextAlarmText && (
        <Text style={styles.countdown}>{nextAlarmText}</Text>
      )}

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Image
            source={require('@/assets/images/empty/empty-alarms.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>설정된 알람이 없습니다</Text>
          <Text style={styles.emptyHint}>우하단 + 버튼으로 알람을 추가해주세요</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={() => toggleAlarm(item.id)}
              onPress={() =>
                router.push({ pathname: '/alarms/edit', params: { id: item.id } })
              }
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/alarms/edit')}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

