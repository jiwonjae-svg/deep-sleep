import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MascotImage } from '@/components/common/MascotImage';
import { BenefitList } from '@/components/subscription/BenefitList';
import { PlanCard } from '@/components/subscription/PlanCard';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { colors, typography, spacing, layout } from '@/theme';

interface PlanInfo {
  id: string;
  title: string;
  price: string;
  period: string;
  recommended?: boolean;
}

const PLANS: PlanInfo[] = [
  { id: 'monthly', title: '월간', price: '₩3,900', period: '/월' },
  { id: 'yearly', title: '연간', price: '₩29,900', period: '/년', recommended: true },
  { id: 'lifetime', title: '평생', price: '₩79,900', period: '1회 결제' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, packages, purchasing: isPurchasing, purchase, restore } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('yearly');


  // 이미 프리미엄이면 닫기
  useEffect(() => {
    if (isPremium) {
      router.back();
    }
  }, [isPremium]);

  const handlePurchase = async () => {
    const pkg = packages.find((p) => p.identifier?.includes(selectedPlan));
    if (pkg) {
      await purchase(pkg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close button */}
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={colors.textSecondary} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('@/assets/images/promo/premium-banner.png')}
          style={styles.banner}
          resizeMode="contain"
        />
        <MascotImage pose="crown" size={140} />

        <Text style={styles.title}>Deep Sleep Premium</Text>
        <Text style={styles.subtitle}>광고 없이 100가지 소리를 마음껏 즐기세요</Text>

        <BenefitList />

        {/* Plan cards */}
        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              recommended={plan.recommended}
              selected={selectedPlan === plan.id}
              onPress={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        {/* Purchase */}
        <Button
          title={isPurchasing ? '처리 중...' : '구독 시작하기'}
          variant="primary"
          onPress={handlePurchase}
          disabled={isPurchasing}
        />

        {/* Restore */}
        <Pressable onPress={restore}>
          <Text style={styles.restoreText}>이전 구매 복원</Text>
        </Pressable>

        {/* Legal */}
        <Text style={styles.legal}>
          구독은 선택한 기간이 끝날 때 자동으로 갱신됩니다. 구독 기간이 끝나기 24시간 전까지
          취소하지 않으면 자동으로 결제됩니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: layout.screenPaddingH,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    padding: layout.screenPaddingH,
    paddingTop: spacing['2xl'],
    gap: spacing.lg,
  },
  banner: {
    width: '100%',
    height: 100,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  plans: {
    width: '100%',
    gap: spacing.md,
  },
  restoreText: {
    ...typography.bodyMedium,
    color: colors.accent1,
    textDecorationLine: 'underline',
  },
  legal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
});
