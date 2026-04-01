import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SoundConfig } from '@/types';
import { SoundCard } from './SoundCard';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { spacing } from '@/theme';

interface SoundGridProps {
  sounds: SoundConfig[];
  categoryColor: string;
  onSoundPress: (sound: SoundConfig) => void;
  onSoundLongPress?: (sound: SoundConfig) => void;
}

export function SoundGrid({
  sounds,
  categoryColor,
  onSoundPress,
  onSoundLongPress,
}: SoundGridProps) {
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const renderItem = ({ item }: { item: SoundConfig }) => {
    const active = activeSounds.has(item.id);
    const isLocked = item.isPremium && !isPremium;
    const state = activeSounds.get(item.id);
    const volume = state ? Math.round((state.volumeMin + state.volumeMax) / 2) : undefined;

    return (
      <View style={styles.cellWrapper}>
        <SoundCard
          sound={item}
          active={active}
          isPremium={isPremium}
          isLocked={isLocked}
          volume={volume}
          onPress={() => onSoundPress(item)}
          onLongPress={() => onSoundLongPress?.(item)}
          categoryColor={categoryColor}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={sounds}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={3}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: spacing.sm,
  },
  cellWrapper: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
});
