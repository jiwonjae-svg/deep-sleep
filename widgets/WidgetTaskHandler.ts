/**
 * WidgetTaskHandler — Android 위젯 이벤트 처리 (3.5)
 *
 * 위젯 액션(재생/정지/프리셋 전환)을 수신하고
 * AudioService를 호출한다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

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

/**
 * 위젯 액션 핸들러 (Headless JS Task에서 호출)
 *
 * react-native-android-widget의 registerWidgetTaskHandler와 연동.
 * 현재는 구조만 정의 — 실제 네이티브 위젯 바인딩은 라이브러리 설치 후 연결.
 */
export async function handleWidgetAction(
  action: WidgetAction,
  payload?: { presetId?: string },
): Promise<void> {
  switch (action) {
    case 'PLAY_TOGGLE': {
      // AudioService.startMix() or stopAll()
      // → requestWidgetUpdate() 호출
      break;
    }
    case 'APPLY_PRESET': {
      if (!payload?.presetId) break;
      // presetStore에서 프리셋 찾기 → AudioService.applyPreset()
      // → requestWidgetUpdate() 호출
      break;
    }
    case 'WIDGET_ADDED':
    case 'WIDGET_RESIZED':
    case 'WIDGET_REMOVED':
      // 위젯 상태 동기화
      break;
  }
}
