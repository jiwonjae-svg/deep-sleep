/**
 * TimerTransitionService — 타이머 고급 모드: 사운드 전환 (3.4.2)
 *
 * 설정된 스케줄에 따라 프리셋 간 크로스페이드 전환을 관리한다.
 * 예: 빗소리(30분) → 파도(나머지 밤)
 */

import { useTimerStore } from '@/stores/useTimerStore';
import { usePresetStore } from '@/stores/usePresetStore';
import { applyPreset } from '@/services/AudioService';
import { TimerPhase } from '@/types';

let transitionCheckInterval: ReturnType<typeof setInterval> | null = null;
let phaseStartTime = 0;

/**
 * 스케줄 기반 전환 모니터 시작
 * startMix() 이후 호출된다.
 */
export function startTransitionMonitor(): void {
  stopTransitionMonitor();

  const { schedule } = useTimerStore.getState();
  if (!schedule || schedule.phases.length <= 1) return;

  phaseStartTime = Date.now();

  transitionCheckInterval = setInterval(() => {
    const timer = useTimerStore.getState();
    if (!timer.isActive || !timer.schedule) {
      stopTransitionMonitor();
      return;
    }

    const currentPhase = timer.schedule.phases[timer.currentPhaseIndex];
    if (!currentPhase) return;

    const elapsed = Date.now() - phaseStartTime;
    const phaseDurationMs = currentPhase.durationMinutes * 60 * 1000;

    if (elapsed >= phaseDurationMs) {
      const nextIndex = timer.currentPhaseIndex + 1;
      const hasNext = nextIndex < timer.schedule.phases.length;

      if (hasNext || timer.schedule.loopLastPhase) {
        timer.advancePhase();
        phaseStartTime = Date.now();

        const nextPhase = timer.schedule.phases[
          hasNext ? nextIndex : timer.schedule.phases.length - 1
        ];
        transitionToPhase(nextPhase).catch(() => {});
      }
    }
  }, 1000);
}

export function stopTransitionMonitor(): void {
  if (transitionCheckInterval) {
    clearInterval(transitionCheckInterval);
    transitionCheckInterval = null;
  }
  phaseStartTime = 0;
}

async function transitionToPhase(phase: TimerPhase): Promise<void> {
  const presets = usePresetStore.getState();
  const allPresets = [...presets.defaultPresets, ...presets.customPresets];
  const preset = allPresets.find((p) => p.id === phase.presetId);
  if (!preset) return;

  await applyPreset(preset.sounds, preset.id);
}
