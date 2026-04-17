/**
 * MediumWidget (4×1) — 재생/정지 + 프리셋명 + 타이머 잔여시간
 */

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetState } from './WidgetTaskHandler';

interface MediumWidgetProps {
  state: WidgetState;
}

export function MediumWidget({ state }: MediumWidgetProps) {
  const timerText = state.remainingMinutes > 0
    ? `${Math.floor(state.remainingMinutes / 60)}:${String(state.remainingMinutes % 60).padStart(2, '0')}`
    : '∞';

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
      <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
        <TextWidget
          text={state.presetName || 'Deep Sleep'}
          style={{ fontSize: 14, color: '#ffffff' }}
          maxLines={1}
        />
        <TextWidget
          text={timerText}
          style={{ fontSize: 12, color: '#99ffffff' }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#456eea',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        clickAction="PLAY_TOGGLE"
      >
        <TextWidget
          text={state.isPlaying ? '⏸' : '▶'}
          style={{ fontSize: 18, color: '#ffffff' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
