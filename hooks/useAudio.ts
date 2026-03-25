import { useCallback } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { ActiveSoundState, Preset } from '@/types';
import { getSoundById } from '@/data/sounds';
import * as AudioService from '@/services/AudioService';

/**
 * 오디오 재생과 관련된 통합 훅.
 * 스토어 + 서비스를 조합하여 컴포넌트에 제공.
 */
export function useAudio() {
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const activePresetId = useAudioStore((s) => s.activePresetId);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const activeSoundsList = Array.from(activeSounds.values());
  const soundCount = activeSoundsList.length;

  /** 소리 토글 (프리미엄 체크 포함) */
  const toggleSound = useCallback(
    (soundId: string, defaults?: Partial<ActiveSoundState>): 'toggled' | 'premium_required' | 'max_reached' => {
      const meta = getSoundById(soundId);
      if (!meta) return 'toggled';

      if (meta.isPremium && !isPremium && !activeSounds.has(soundId)) {
        return 'premium_required';
      }

      const store = useAudioStore.getState();
      if (!store.activeSounds.has(soundId) && store.activeSounds.size >= 10) {
        return 'max_reached';
      }

      store.toggleSound(soundId, defaults);
      return 'toggled';
    },
    [isPremium, activeSounds],
  );

  /** 재생 시작 */
  const play = useCallback(async () => {
    if (soundCount === 0) return;
    await AudioService.startMix();
  }, [soundCount]);

  /** 정지 */
  const stop = useCallback(async () => {
    await AudioService.stopAll();
  }, []);

  /** 프리셋 적용 */
  const applyPreset = useCallback(async (preset: Preset) => {
    await AudioService.applyPreset(preset.sounds, preset.id);
    useAudioStore.getState().setActivePresetId(preset.id);
  }, []);

  /** 마스터 볼륨 변경 */
  const setVolume = useCallback((vol: number) => {
    useAudioStore.getState().setMasterVolume(vol);
  }, []);

  /** 수면 타이머 시작 */
  const startTimer = useCallback((minutes: number) => {
    useTimerStore.getState().startTimer(minutes);
  }, []);

  /** 수면 타이머 취소 */
  const cancelTimer = useCallback(() => {
    useTimerStore.getState().cancelTimer();
  }, []);

  return {
    activeSounds: activeSoundsList,
    activeSoundsMap: activeSounds,
    isPlaying,
    masterVolume,
    activePresetId,
    soundCount,
    toggleSound,
    play,
    stop,
    applyPreset,
    setVolume,
    startTimer,
    cancelTimer,
  };
}
