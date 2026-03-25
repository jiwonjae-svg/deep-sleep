import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { SoundConfig, SoundCategory } from '@/types';
import { SoundCard } from './SoundCard';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { colors, layout } from '@/theme';

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
    );
  };

  return (
    <FlatList
      data={sounds}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: layout.gridGap,
    marginBottom: layout.gridGap,
  },
  content: {
    paddingBottom: 120, // space for active sounds bar + tab bar
  },
});
