import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlarm } from '@/hooks/useAlarm';
import { Toggle } from '@/components/ui/Toggle';
import { useThemeColors, spacing, layout } from '@/theme';
import { msUntilAlarm, formatRemainingTime } from '@/utils/formatTime';
import { Alarm } from '@/types';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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

  const renderAlarmItem = ({ item }: { item: Alarm }) => {
    const timeStr = `${String(item.time.hour).padStart(2, '0')}:${String(item.time.minute).padStart(2, '0')}`;
    return (
      <Pressable
        style={[
          styles.alarmCard,
          item.enabled && styles.alarmCardActive,
        ]}
        onPress={() => router.push({ pathname: '/alarms/edit', params: { id: item.id } })}
      >
        {/* Time */}
        <View style={styles.alarmTime}>
          <Text style={[styles.timeText, !item.enabled && styles.timeTextDisabled]}>
            {timeStr}
          </Text>
        </View>

        {/* Info: label + days */}
        <View style={styles.alarmInfo}>
          {!!item.label && (
            <Text
              style={[styles.alarmLabel, !item.enabled && { color: 'rgba(255,255,255,0.4)' }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          )}
          <View style={styles.daysRow}>
            {item.days.map((active, i) => (
              <Text
                key={i}
                style={[
                  styles.dayText,
                  active && styles.dayTextActive,
                  !item.enabled && { opacity: 0.5 },
                ]}
              >
                {DAY_LABELS[i]}
              </Text>
            ))}
          </View>
        </View>

        {/* Toggle */}
        <Toggle value={item.enabled} onValueChange={() => { toggleAlarm(item.id); }} />
      </Pressable>
    );
  };

  return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Countdown header */}
        {nextAlarmText && (
          <Text style={styles.countdown}>{nextAlarmText}</Text>
        )}

        {/* Search button */}
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.searchBtn}>
            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

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
            renderItem={renderAlarmItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        {/* FAB */}
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/alarms/edit')}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </Pressable>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  countdown: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(69,110,234,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  // Alarm card — based on 02-alarms reference
  alarmCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 32,
    height: 96,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  alarmCardActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  alarmTime: {
    minWidth: 80,
  },
  timeText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(69,110,234,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  timeTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
    textShadowRadius: 0,
  },
  alarmInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  alarmLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
  },
  dayTextActive: {
    color: '#ffffff',
  },
  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#456eea',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#456eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});

