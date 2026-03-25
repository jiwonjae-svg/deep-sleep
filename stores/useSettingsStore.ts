import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';

const STORAGE_KEY = '@settings';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  language: 'ko',
  autoSleepScreen: true,
  autoDimBrightness: true,
  audioQuality: 'medium',
  volumeChangeSpeed: 'medium',
  defaultSnoozeMinutes: 5,
  defaultAlarmSoundId: 'alarm-default',
};

interface SettingsStoreState {
  settings: AppSettings;
  loaded: boolean;
}

interface SettingsStoreActions {
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const saved: Partial<AppSettings> = JSON.parse(json);
        set({ settings: { ...DEFAULT_SETTINGS, ...saved }, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  updateSettings: async (partial) => {
    const next = { ...get().settings, ...partial };
    set({ settings: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));
