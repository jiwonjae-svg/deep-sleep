import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

// ──────────────────────────────────────────────
// Initialization
// ──────────────────────────────────────────────

let initialized = false;

export async function initBilling(apiKey: string): Promise<void> {
  if (initialized) return;

  Purchases.configure({ apiKey });
  initialized = true;

  // 초기 구독 상태 동기화
  await syncSubscriptionState();
}

// ──────────────────────────────────────────────
// Subscription state sync
// ──────────────────────────────────────────────

export async function syncSubscriptionState(): Promise<void> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    const isPremium = Object.keys(info.entitlements.active).length > 0;
    useSubscriptionStore.getState().setPremium(isPremium);
  } catch {
    // 네트워크 오류 등 — 기존 상태 유지
  } finally {
    useSubscriptionStore.getState().setLoaded(true);
  }
}

// ──────────────────────────────────────────────
// Offerings / Packages
// ──────────────────────────────────────────────

export async function getPackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// Purchase
// ──────────────────────────────────────────────

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
    useSubscriptionStore.getState().setPremium(isPremium);
    return { success: isPremium };
  } catch (e: unknown) {
    const error = e as { userCancelled?: boolean; message?: string };
    if (error.userCancelled) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: error.message ?? 'unknown' };
  }
}

// ──────────────────────────────────────────────
// Restore purchases
// ──────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.restorePurchases();
    const isPremium = Object.keys(info.entitlements.active).length > 0;
    useSubscriptionStore.getState().setPremium(isPremium);
    return isPremium;
  } catch {
    return false;
  }
}
