import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BenefitList } from '@/components/subscription/BenefitList';
import { PlanCard } from '@/components/subscription/PlanCard';
import { Button } from '@/components/ui/Button';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { useSubscription } from '@/hooks/useSubscription';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

interface PlanInfo {
  id: string;
  title: string;
  price: string;
  period: string;
  recommended?: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, packages, purchasing: isPurchasing, purchase, restore } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const PLANS: PlanInfo[] = [
    { id: 'monthly', title: t('subscription.monthly'), price: t('subscription.monthlyPrice'), period: t('subscription.monthlyPeriod') },
    { id: 'yearly', title: t('subscription.yearly'), price: t('subscription.yearlyPrice'), period: t('subscription.yearlyPeriod'), recommended: true },
    { id: 'lifetime', title: t('subscription.lifetime'), price: t('subscription.lifetimePrice'), period: t('subscription.lifetimePeriod') },
  ];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1 },
        closeBtn: { position: 'absolute', top: 56, right: layout.screenPaddingH, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
        content: { alignItems: 'center', padding: layout.screenPaddingH, paddingTop: spacing['2xl'], gap: spacing.lg },
        title: { ...typography.display, color: themeColors.textPrimary, textAlign: 'center' },
        subtitle: { ...typography.body, color: themeColors.textSecondary, textAlign: 'center' },
        plans: { width: '100%', gap: spacing.md },
        restoreText: { ...typography.bodyMedium, color: themeColors.accent1, textDecorationLine: 'underline' },
        legal: { ...typography.caption, color: themeColors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: spacing.md, paddingBottom: spacing['2xl'] },
      }),
    [themeColors],
  );
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
    <GradientBackground overlay overlayOpacity={0.45}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={themeColors.textSecondary} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            Deep Sleep Premium
          </Animated.Text>
          <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>

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
            title={isPurchasing ? t('subscription.processing') : t('subscription.subscribe')}
            variant="primary"
            onPress={handlePurchase}
            disabled={isPurchasing}
          />

          {/* Restore */}
          <Pressable onPress={restore}>
            <Text style={styles.restoreText}>{t('subscription.restore')}</Text>
          </Pressable>

          {/* Legal */}
          <Text style={styles.legal}>
            {t('subscription.legal')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}


