import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';
import { AppSettings } from '@/types';

const STORAGE_KEY = '@settings';

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  themeColor: '#456eea',
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
    if (partial.language && partial.language !== i18n.language) {
      await i18n.changeLanguage(partial.language);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));
