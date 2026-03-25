import { useCallback } from 'react';
import { useAIStore } from '@/stores/useAIStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import * as AIService from '@/services/AIService';
import { AIPresetResult } from '@/types';

/**
 * AI 사운드 추천 통합 훅.
 */
export function useAI() {
  const dailyCallCount = useAIStore((s) => s.dailyCallCount);
  const lastResult = useAIStore((s) => s.lastResult);
  const isLoading = useAIStore((s) => s.isLoading);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const canCall = useAIStore((s) => s.canCallAPI);

  /** AI 추천 요청 */
  const recommend = useCallback(
    async (userInput: string): Promise<AIPresetResult | null> => {
      const store = useAIStore.getState();

      if (!isPremium) return null;
      if (!store.canCallAPI()) return null;

      store.setLoading(true);

      try {
        const result = await AIService.recommend(userInput);
        await store.incrementCallCount();
        store.setLastResult(result);
        return result;
      } catch {
        return null;
      } finally {
        store.setLoading(false);
      }
    },
    [isPremium],
  );

  return {
    dailyCallCount,
    lastResult,
    isLoading,
    isPremium,
    canCall: canCall(),
    recommend,
  };
}
