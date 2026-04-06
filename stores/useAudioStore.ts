import { create } from 'zustand';
import { ActiveSoundState } from '@/types';

interface AudioStoreState {
  /** 사용자가 믹서에서 직접 선택한 소리들 */
  activeSounds: Map<string, ActiveSoundState>;
  /** 프리셋에서 재생 중인 소리들 (믹서와 분리) */
  presetSounds: Map<string, ActiveSoundState>;
  /** 재생 중 여부 */
  isPlaying: boolean;
  /** 마스터 볼륨 (0–100) */
  masterVolume: number;
  /** 현재 적용된 프리셋 ID (null이면 커스텀) */
  activePresetId: string | null;
}

interface AudioStoreActions {
  toggleSound: (soundId: string, defaults?: Partial<ActiveSoundState>) => void;
  removeSound: (soundId: string) => void;
  updateSoundState: (soundId: string, partial: Partial<ActiveSoundState>) => void;
  setActiveSounds: (sounds: ActiveSoundState[]) => void;
  setPresetSounds: (sounds: ActiveSoundState[]) => void;
  clearPresetSounds: () => void;
  clearAllSounds: () => void;
  setPlaying: (playing: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setActivePresetId: (id: string | null) => void;
}

const MAX_SIMULTANEOUS_SOUNDS = 10;

export const useAudioStore = create<AudioStoreState & AudioStoreActions>((set, get) => ({
  activeSounds: new Map(),
  presetSounds: new Map(),
  isPlaying: false,
  masterVolume: 80,
  activePresetId: null,

  toggleSound: (soundId, defaults) => {
    const { activeSounds } = get();
    const next = new Map(activeSounds);
    if (next.has(soundId)) {
      next.delete(soundId);
    } else {
      if (next.size >= MAX_SIMULTANEOUS_SOUNDS) return; // 10개 제한
      next.set(soundId, {
        soundId,
        volumeMin: 30,
        volumeMax: 70,
        frequency: 'continuous',
        pan: 0,
        ...defaults,
      });
    }
    set({ activeSounds: next });
  },

  removeSound: (soundId) => {
    const next = new Map(get().activeSounds);
    next.delete(soundId);
    set({ activeSounds: next });
  },

  updateSoundState: (soundId, partial) => {
    const next = new Map(get().activeSounds);
    const existing = next.get(soundId);
    if (existing) {
      next.set(soundId, { ...existing, ...partial });
      set({ activeSounds: next });
    }
  },

  setActiveSounds: (sounds) => {
    const next = new Map<string, ActiveSoundState>();
    for (const s of sounds.slice(0, MAX_SIMULTANEOUS_SOUNDS)) {
      next.set(s.soundId, s);
    }
    set({ activeSounds: next });
  },

  setPresetSounds: (sounds) => {
    const next = new Map<string, ActiveSoundState>();
    for (const s of sounds.slice(0, MAX_SIMULTANEOUS_SOUNDS)) {
      next.set(s.soundId, s);
    }
    set({ presetSounds: next });
  },

  clearPresetSounds: () => set({ presetSounds: new Map(), activePresetId: null }),

  clearAllSounds: () => set({ activeSounds: new Map(), presetSounds: new Map(), activePresetId: null }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(100, volume)) }),

  setActivePresetId: (id) => set({ activePresetId: id }),
}));
