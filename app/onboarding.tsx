import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { Button } from '@/components/ui/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { requestNotification } = usePermissions();
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const slides: Slide[] = [
    { title: t('onboarding.slide1Title'), description: t('onboarding.slide1Desc') },
    { title: t('onboarding.slide2Title'), description: t('onboarding.slide2Desc') },
    { title: t('onboarding.slide3Title'), description: t('onboarding.slide3Desc') },
    { title: t('onboarding.slide4Title'), description: t('onboarding.slide4Desc') },
  ];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        indicatorRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.xl },
        dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.textMuted },
        dotActive: { backgroundColor: themeColors.accent1, width: 24 },
        footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPaddingH, paddingBottom: spacing['2xl'], gap: spacing.md },
        skipText: { ...typography.body, color: themeColors.textSecondary },
      }),
    [themeColors],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      // 마지막 슬라이드: 알림 권한 요청 후 완료
      await requestNotification();
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View style={{ width: SCREEN_WIDTH }}>
            <OnboardingSlide
              slideIndex={index}
              title={item.title}
              description={item.description}
            />
          </View>
        )}
      />

      {/* Page indicators */}
      <View style={styles.indicatorRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        {!isLast && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        <Button
          title={isLast ? t('common.start') : t('common.next')}
          variant="primary"
          onPress={handleNext}
        />
      </View>
    </View>
  );
}


