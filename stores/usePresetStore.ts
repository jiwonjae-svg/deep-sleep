import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preset } from '@/types';
import { defaultPresets } from '@/data/defaultPresets';

const STORAGE_KEY = '@presets/custom';

interface PresetStoreState {
  defaultPresets: Preset[];
  customPresets: Preset[];
  loaded: boolean;
}

interface PresetStoreActions {
  loadPresets: () => Promise<void>;
  addPreset: (preset: Preset) => Promise<void>;
  updatePreset: (id: string, partial: Partial<Preset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
}

export const usePresetStore = create<PresetStoreState & PresetStoreActions>((set, get) => ({
  defaultPresets,
  customPresets: [],
  loaded: false,

  loadPresets: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const customPresets: Preset[] = json ? JSON.parse(json) : [];
      set({ customPresets, loaded: true });
    } catch {
      set({ customPresets: [], loaded: true });
    }
  },

  addPreset: async (preset) => {
    const updated = [...get().customPresets, preset];
    set({ customPresets: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updatePreset: async (id, partial) => {
    const updated = get().customPresets.map((p) =>
      p.id === id ? { ...p, ...partial, updatedAt: Date.now() } : p,
    );
    set({ customPresets: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deletePreset: async (id) => {
    const updated = get().customPresets.filter((p) => p.id !== id);
    set({ customPresets: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));
