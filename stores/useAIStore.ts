import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIPresetResult, AIUsageState } from '@/types';

const STORAGE_KEY = '@ai/usage';
const MAX_DAILY_CALLS = 20;

interface AIStoreState {
  dailyCallCount: number;
  lastCallDate: string;
  lastResult: AIPresetResult | null;
  isLoading: boolean;
}

interface AIStoreActions {
  loadUsage: () => Promise<void>;
  canCallAPI: () => boolean;
  incrementCallCount: () => Promise<void>;
  setLastResult: (result: AIPresetResult | null) => void;
  setLoading: (loading: boolean) => void;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useAIStore = create<AIStoreState & AIStoreActions>((set, get) => ({
  dailyCallCount: 0,
  lastCallDate: '',
  lastResult: null,
  isLoading: false,

  loadUsage: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const state: AIUsageState = JSON.parse(json);
        const today = todayString();
        if (state.lastCallDate === today) {
          set({
            dailyCallCount: state.dailyCallCount,
            lastCallDate: state.lastCallDate,
            lastResult: state.lastResult,
          });
        } else {
          // 날짜 변경 → 리셋
          set({ dailyCallCount: 0, lastCallDate: today, lastResult: null });
        }
      }
    } catch {
      // ignore
    }
  },

  canCallAPI: () => {
    const { dailyCallCount, lastCallDate } = get();
    const today = todayString();
    if (lastCallDate !== today) return true;
    return dailyCallCount < MAX_DAILY_CALLS;
  },

  incrementCallCount: async () => {
    const today = todayString();
    const { lastCallDate, dailyCallCount } = get();
    const newCount = lastCallDate === today ? dailyCallCount + 1 : 1;
    set({ dailyCallCount: newCount, lastCallDate: today });
    const usage: AIUsageState = {
      dailyCallCount: newCount,
      lastCallDate: today,
      lastResult: get().lastResult,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  },

  setLastResult: (result) => set({ lastResult: result }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
