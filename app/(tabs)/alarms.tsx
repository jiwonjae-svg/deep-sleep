import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlarm } from '@/hooks/useAlarm';
import { Toggle } from '@/components/ui/Toggle';
import { useThemeColors, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { msUntilAlarm, msUntilSpecificDate, formatRemainingTimeLong } from '@/utils/formatTime';
import { Alarm } from '@/types';

export default function AlarmsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const { alarms, toggleAlarm } = useAlarm();
  const DAY_LABELS = t('alarms.days', { returnObjects: true }) as string[];

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const filteredAlarms = useMemo(() => {
    if (!searchText.trim()) return alarms;
    const q = searchText.trim().toLowerCase();
    return alarms.filter(
      (a) =>
        (a.label ?? '').toLowerCase().includes(q) ||
        `${String(a.time.hour).padStart(2, '0')}:${String(a.time.minute).padStart(2, '0')}`.includes(q),
    );
  }, [alarms, searchText]);

  const computeNextAlarm = useCallback(() => {
    const active = alarms.filter((a) => a.enabled);
    if (active.length === 0) return null;
    const best = active.reduce<{ ms: number; label: string } | null>((acc, a) => {
      const ms = a.specificDate
        ? msUntilSpecificDate(a.specificDate, a.time.hour, a.time.minute)
        : msUntilAlarm(a.time.hour, a.time.minute);
      if (ms <= 0) return acc;
      if (!acc || ms < acc.ms) return { ms, label: formatRemainingTimeLong(ms) };
      return acc;
    }, null);
    return best ? `${best.label} ${t('alarms.countdownSuffix')}` : null;
  }, [alarms, t]);

  const [nextAlarmText, setNextAlarmText] = useState(computeNextAlarm);
  useEffect(() => {
    setNextAlarmText(computeNextAlarm());
    const id = setInterval(() => setNextAlarmText(computeNextAlarm()), 30_000);
    return () => clearInterval(id);
  }, [computeNextAlarm]);

  const renderAlarmItem = ({ item }: { item: Alarm }) => {
    const timeStr = `${String(item.time.hour).padStart(2, '0')}:${String(item.time.minute).padStart(2, '0')}`;
    const isPast = item.specificDate
      ? msUntilSpecificDate(item.specificDate, item.time.hour, item.time.minute) <= 0
      : false;
    const dimmed = !item.enabled || isPast;
    return (
      <Pressable
        style={[
          styles.alarmCard,
          item.enabled && !isPast && styles.alarmCardActive,
          isPast && { opacity: 0.5 },
        ]}
        onPress={() => router.push({ pathname: '/alarms/edit', params: { id: item.id } })}
      >
        {/* Time */}
        <View style={styles.alarmTime}>
          <Text style={[styles.timeText, dimmed && styles.timeTextDisabled]}>
            {timeStr}
          </Text>
        </View>

        {/* Info: label + days */}
        <View style={styles.alarmInfo}>
          {!!item.label && (
            <Text
              style={[styles.alarmLabel, dimmed && { color: 'rgba(255,255,255,0.4)' }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          )}
          <View style={styles.daysRow}>
            {item.specificDate ? (
              <Text style={[styles.dayText, styles.dayTextActive, dimmed && { opacity: 0.5 }]}>
                {item.specificDate}
              </Text>
            ) : (
              item.days.map((active, i) => (
                <Text
                  key={i}
                  style={[
                    styles.dayText,
                    active && styles.dayTextActive,
                    dimmed && { opacity: 0.5 },
                  ]}
                >
                  {DAY_LABELS[i]}
                </Text>
              ))
            )}
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

        {/* Search */}
        <View style={styles.searchRow}>
          {searchVisible ? (
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder={t('alarms.searchPlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.4)"
                autoFocus
              />
              <Pressable onPress={() => { setSearchVisible(false); setSearchText(''); }}>
                <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flex: 1 }} />
              <Pressable style={styles.searchBtn} onPress={() => setSearchVisible(true)}>
                <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </>
          )}
        </View>

        {alarms.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="alarm" size={72} color="rgba(255,255,255,0.25)" />
            </View>
            <Text style={styles.emptyText}>{t('alarms.empty')}</Text>
            <Text style={styles.emptyHint}>{t('alarms.emptyHint')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAlarms}
            keyExtractor={(item) => item.id}
            renderItem={renderAlarmItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: themeColors.accent1, shadowColor: themeColors.accent1 }]}
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
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 32,
    lineHeight: 32,
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    padding: 0,
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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

