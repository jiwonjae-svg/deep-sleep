/**
 * SmallWidget (2×1) — 재생/정지 버튼 + 현재 프리셋명
 *
 * react-native-android-widget의 FlexWidget/TextWidget 사용.
 */

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetState } from './WidgetTaskHandler';

interface SmallWidgetProps {
  state: WidgetState;
}

export function SmallWidget({ state }: SmallWidgetProps) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#141428',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 'match_parent',
        width: 'match_parent',
      }}
    >
      <TextWidget
        text={state.presetName || 'Deep Sleep'}
        style={{ fontSize: 14, color: '#ffffff' }}
        maxLines={1}
      />
      <FlexWidget
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#456eea',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        clickAction="PLAY_TOGGLE"
      >
        <TextWidget
          text={state.isPlaying ? '⏸' : '▶'}
          style={{ fontSize: 16, color: '#ffffff' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
