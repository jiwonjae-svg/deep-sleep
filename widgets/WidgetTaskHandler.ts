/**
 * WidgetTaskHandler — Android 위젯 이벤트 처리 (3.5)
 *
 * 위젯 액션(재생/정지/프리셋 전환)을 수신하고
 * AudioService를 호출한다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioStore } from '@/stores/useAudioStore';
import { usePresetStore } from '@/stores/usePresetStore';
import * as AudioService from '@/services/AudioService';

export type WidgetAction =
  | 'PLAY_TOGGLE'
  | 'APPLY_PRESET'
  | 'WIDGET_ADDED'
  | 'WIDGET_RESIZED'
  | 'WIDGET_REMOVED';

export interface WidgetState {
  isPlaying: boolean;
  presetName: string;
  remainingMinutes: number;
  favoritePresetIds: string[];
}

const WIDGET_STATE_KEY = '@widget/state';

/** 위젯 상태를 SharedPreferences(AsyncStorage)에 저장 */
export async function saveWidgetState(state: WidgetState): Promise<void> {
  await AsyncStorage.setItem(WIDGET_STATE_KEY, JSON.stringify(state));
}

/** 위젯 상태 읽기 */
export async function loadWidgetState(): Promise<WidgetState | null> {
  const json = await AsyncStorage.getItem(WIDGET_STATE_KEY);
  if (!json) return null;
  return JSON.parse(json) as WidgetState;
}

/** 현재 오디오 상태를 기반으로 위젯 상태 동기화 후 저장 */
export async function syncAndSaveWidgetState(): Promise<void> {
  const audioState = useAudioStore.getState();
  const presetId = audioState.activePresetId;
  let presetName = 'Deep Sleep';
  if (presetId) {
    const all = [
      ...usePresetStore.getState().defaultPresets,
      ...usePresetStore.getState().customPresets,
    ];
    presetName = all.find((p) => p.id === presetId)?.name ?? presetName;
  }
  const state: WidgetState = {
    isPlaying: audioState.isPlaying,
    presetName,
    remainingMinutes: 0,
    favoritePresetIds: [],
  };
  await saveWidgetState(state);
}

/**
 * 위젯 액션 핸들러 (Headless JS Task에서 호출)
 *
 * react-native-android-widget의 registerWidgetTaskHandler와 연동.
 */
export async function handleWidgetAction(
  action: WidgetAction,
  payload?: { presetId?: string },
): Promise<void> {
  switch (action) {
    case 'PLAY_TOGGLE': {
      const { isPlaying, activeSounds } = useAudioStore.getState();
      if (isPlaying) {
        AudioService.stopAll();
      } else if (activeSounds.size > 0) {
        await AudioService.startMix();
      }
      await syncAndSaveWidgetState();
      break;
    }
    case 'APPLY_PRESET': {
      if (!payload?.presetId) break;
      const presets = [
        ...usePresetStore.getState().defaultPresets,
        ...usePresetStore.getState().customPresets,
      ];
      const preset = presets.find((p) => p.id === payload.presetId);
      if (preset) {
        AudioService.stopAll();
        for (const sound of preset.sounds) {
          useAudioStore.getState().toggleSound(sound.soundId, {
            volumeMin: sound.volumeMin,
            volumeMax: sound.volumeMax,
            frequency: sound.frequency,
            pan: sound.pan,
          });
        }
        await AudioService.startMix();
      }
      await syncAndSaveWidgetState();
      break;
    }
    case 'WIDGET_ADDED':
    case 'WIDGET_RESIZED':
    case 'WIDGET_REMOVED':
      await syncAndSaveWidgetState();
      break;
  }
}
