/**
 * LargeWidget (4×2) — 재생/정지 + 프리셋명 + 타이머 + 즐겨찾기 프리셋 3개
 */

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetState } from './WidgetTaskHandler';

interface LargeWidgetProps {
  state: WidgetState;
  favoritePresets: { id: string; name: string }[];
}

export function LargeWidget({ state, favoritePresets }: LargeWidgetProps) {
  const timerText = state.remainingMinutes > 0
    ? `${Math.floor(state.remainingMinutes / 60)}:${String(state.remainingMinutes % 60).padStart(2, '0')}`
    : '∞';

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        backgroundColor: '#141428',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'space-between',
        height: 'match_parent',
        width: 'match_parent',
      }}
    >
      {/* Top row: status + play button */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={state.presetName || 'Deep Sleep'}
            style={{ fontSize: 16, color: '#ffffff' }}
            maxLines={1}
          />
          <TextWidget
            text={timerText}
            style={{ fontSize: 12, color: '#99ffffff' }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#456eea',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          clickAction="PLAY_TOGGLE"
        >
          <TextWidget
            text={state.isPlaying ? '⏸' : '▶'}
            style={{ fontSize: 20, color: '#ffffff' }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Bottom row: favorite presets */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
          marginTop: 12,
        }}
      >
        {favoritePresets.slice(0, 3).map((p) => (
          <FlexWidget
            key={p.id}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#1fffffff',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 4,
            }}
            clickAction="APPLY_PRESET"
            clickActionData={{ presetId: p.id }}
          >
            <TextWidget
              text={p.name}
              style={{ fontSize: 12, color: '#ccffffff' }}
              maxLines={1}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
