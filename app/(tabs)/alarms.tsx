import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlarm } from '@/hooks/useAlarm';
import { AlarmCard } from '@/components/alarm/AlarmCard';
import { colors, typography, spacing, layout } from '@/theme';

export default function AlarmsScreen() {
  const router = useRouter();
  const { alarms, toggleAlarm } = useAlarm();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>알람</Text>
        <Pressable onPress={() => router.push('/alarms/edit')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.accent1} />
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
          <Text style={styles.emptyHint}>우상단 + 버튼으로 알람을 추가해주세요</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    height: layout.headerHeight,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 100,
  },
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
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
