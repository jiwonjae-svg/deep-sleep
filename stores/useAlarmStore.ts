import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, CustomAlarmSound } from '@/types';

const STORAGE_KEY = '@alarms';
const CUSTOM_SOUNDS_KEY = '@alarm_custom_sounds';

interface AlarmStoreState {
  alarms: Alarm[];
  customAlarmSounds: CustomAlarmSound[];
  loaded: boolean;
}

interface AlarmStoreActions {
  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (id: string, partial: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  addCustomAlarmSound: (sound: CustomAlarmSound) => Promise<void>;
  removeCustomAlarmSound: (id: string) => Promise<void>;
}

export const useAlarmStore = create<AlarmStoreState & AlarmStoreActions>((set, get) => ({
  alarms: [],
  customAlarmSounds: [],
  loaded: false,

  loadAlarms: async () => {
    try {
      const [alarmJson, soundsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(CUSTOM_SOUNDS_KEY),
      ]);
      const alarms: Alarm[] = alarmJson ? JSON.parse(alarmJson) : [];
      const customAlarmSounds: CustomAlarmSound[] = soundsJson ? JSON.parse(soundsJson) : [];
      set({ alarms, customAlarmSounds, loaded: true });
    } catch {
      set({ alarms: [], customAlarmSounds: [], loaded: true });
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

  addCustomAlarmSound: async (sound) => {
    const updated = [...get().customAlarmSounds, sound];
    set({ customAlarmSounds: updated });
    await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updated));
  },

  removeCustomAlarmSound: async (id) => {
    const updated = get().customAlarmSounds.filter((s) => s.id !== id);
    set({ customAlarmSounds: updated });
    await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updated));
  },
}));
