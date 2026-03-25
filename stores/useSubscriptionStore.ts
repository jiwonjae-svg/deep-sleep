import { create } from 'zustand';

interface SubscriptionStoreState {
  isPremium: boolean;
  loaded: boolean;
}

interface SubscriptionStoreActions {
  setPremium: (isPremium: boolean) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionStoreState & SubscriptionStoreActions>(
  (set) => ({
    isPremium: false,
    loaded: false,

    setPremium: (isPremium) => set({ isPremium }),
    setLoaded: (loaded) => set({ loaded }),
  }),
);
