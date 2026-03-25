import { useCallback, useEffect, useState } from 'react';
import { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import * as BillingService from '@/services/BillingService';

/**
 * 구독 상태 및 결제 플로우 훅.
 */
export function useSubscription() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const loaded = useSubscriptionStore((s) => s.loaded);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    BillingService.getPackages().then(setPackages);
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const result = await BillingService.purchasePackage(pkg);
      return result;
    } finally {
      setPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    return await BillingService.restorePurchases();
  }, []);

  return { isPremium, loaded, packages, purchasing, purchase, restore };
}
