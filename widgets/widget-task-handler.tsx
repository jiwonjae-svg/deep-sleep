/**
 * widget-task-handler.tsx — registerWidgetTaskHandler 등록
 *
 * react-native-android-widget가 Headless JS Task로 호출할 핸들러를 등록한다.
 * 이 파일은 app/_layout.tsx에서 import하여 앱 부팅 시 등록된다.
 */
import React from 'react';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { SmallWidget } from './SmallWidget';
import { MediumWidget } from './MediumWidget';
import { LargeWidget } from './LargeWidget';
import { handleWidgetAction, loadWidgetState, syncAndSaveWidgetState, WidgetState } from './WidgetTaskHandler';
import { usePresetStore } from '@/stores/usePresetStore';
import { useAudioStore } from '@/stores/useAudioStore';

const DEFAULT_STATE: WidgetState = {
  isPlaying: false,
  presetName: 'Deep Sleep',
  remainingMinutes: 0,
  favoritePresetIds: [],
};

// 앱 내 재생 상태 변경 시 홈 위젯 자동 갱신
let _prevIsPlaying = useAudioStore.getState().isPlaying;
useAudioStore.subscribe((state) => {
  if (state.isPlaying !== _prevIsPlaying) {
    _prevIsPlaying = state.isPlaying;
    syncAndSaveWidgetState().catch(() => {});
  }
});

registerWidgetTaskHandler(async ({ widgetInfo, widgetAction, clickAction, clickActionData, renderWidget }) => {
  // 클릭 액션 처리
  if (widgetAction === 'WIDGET_CLICK' && clickAction) {
    await handleWidgetAction(
      clickAction as any,
      clickActionData as { presetId?: string },
    );
  }

  // 위젯 상태 로드
  const state = (await loadWidgetState()) ?? DEFAULT_STATE;

  // 즐겨찾기 프리셋 (LargeWidget용)
  const presets = [
    ...usePresetStore.getState().defaultPresets,
    ...usePresetStore.getState().customPresets,
  ];
  const favoritePresets = presets.slice(0, 3).map((p) => ({ id: p.id, name: p.name }));

  // 위젯 이름에 따라 렌더링
  switch (widgetInfo.widgetName) {
    case 'DeepSleepSmall':
      renderWidget(<SmallWidget state={state} />);
      break;
    case 'DeepSleepMedium':
      renderWidget(<MediumWidget state={state} />);
      break;
    case 'DeepSleepLarge':
      renderWidget(<LargeWidget state={state} favoritePresets={favoritePresets} />);
      break;
  }
});
