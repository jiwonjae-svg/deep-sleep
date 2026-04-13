import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BenefitList } from '@/components/subscription/BenefitList';
import { PlanCard } from '@/components/subscription/PlanCard';
import { Button } from '@/components/ui/Button';
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

  // 중앙 fade-in/out 애니메이션 (SoundDetailSheet와 동일)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 22, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateClose = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 150, useNativeDriver: true }),
    ]).start(cb);
  };

  const handleClose = () => animateClose(() => router.back());

  const PLANS: PlanInfo[] = [
    { id: 'monthly', title: t('subscription.monthly'), price: t('subscription.monthlyPrice'), period: t('subscription.monthlyPeriod') },
    { id: 'yearly', title: t('subscription.yearly'), price: t('subscription.yearlyPrice'), period: t('subscription.yearlyPeriod'), recommended: true },
    { id: 'lifetime', title: t('subscription.lifetime'), price: t('subscription.lifetimePrice'), period: t('subscription.lifetimePeriod') },
  ];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: layout.screenPaddingH,
        },
        dialog: {
          width: '100%',
          maxHeight: '82%',
          backgroundColor: themeColors.bgSecondary,
          borderRadius: layout.borderRadiusLg,
          padding: layout.screenPaddingH,
          borderWidth: 1,
          borderColor: themeColors.glassBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 10,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        closeBtn: {
          padding: spacing.xs,
        },
        content: { alignItems: 'center', gap: spacing.lg },
        title: { ...typography.display, color: themeColors.textPrimary, textAlign: 'center' },
        subtitle: { ...typography.body, color: themeColors.textSecondary, textAlign: 'center' },
        plans: { width: '100%', gap: spacing.md },
        restoreText: { ...typography.bodyMedium, color: themeColors.accent1, textDecorationLine: 'underline' },
        legal: { ...typography.caption, color: themeColors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
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
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* 백드롭 탭으로 닫기 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

      <Animated.View
        style={[styles.dialog, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Deep Sleep Plus</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={22} color={themeColors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.content}>
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

            {/* Yearly savings text */}
            {selectedPlan === 'yearly' && (
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: themeColors.accent1, textAlign: 'center' }}>
                  {t('subscription.yearlySavings')}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: themeColors.textSecondary, textAlign: 'center' }}>
                  {t('subscription.freeTrialHint')}
                </Text>
              </View>
            )}

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
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}


