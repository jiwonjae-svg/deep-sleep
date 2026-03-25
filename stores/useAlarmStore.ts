import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '@/types';

const STORAGE_KEY = '@alarms';

interface AlarmStoreState {
  alarms: Alarm[];
  loaded: boolean;
}

interface AlarmStoreActions {
  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (id: string, partial: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
}

export const useAlarmStore = create<AlarmStoreState & AlarmStoreActions>((set, get) => ({
  alarms: [],
  loaded: false,

  loadAlarms: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const alarms: Alarm[] = json ? JSON.parse(json) : [];
      set({ alarms, loaded: true });
    } catch {
      set({ alarms: [], loaded: true });
    }
  },

  addAlarm: async (alarm) => {
    const updated = [...get().alarms, alarm];
    set({ alarms: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updateAlarm: async (id, partial) => {
    const updated = get().alarms.map((a) => (a.id === id ? { ...a, ...partial } : a));
    set({ alarms: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteAlarm: async (id) => {
    const updated = get().alarms.filter((a) => a.id !== id);
    set({ alarms: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleAlarm: async (id) => {
    const alarm = get().alarms.find((a) => a.id === id);
    if (!alarm) return;
    const updated = get().alarms.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a,
    );
    set({ alarms: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));
