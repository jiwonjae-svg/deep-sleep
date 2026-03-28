import React, { useRef, useState } from 'react';
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
import { colors, typography, spacing, layout } from '@/theme';
import { STORAGE_KEYS } from '@/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    title: 'Deep Sleep에 오신 것을 환영합니다',
    description: '100가지 자연의 소리로 완벽한 수면 환경을 만들어보세요.',
  },
  {
    title: '나만의 사운드 믹스',
    description: '최대 10개의 소리를 동시에 조합하고 볼륨을 세밀하게 조절하세요.',
  },
  {
    title: '스마트 알람',
    description: '자연스러운 페이드인 알람과 수학 문제 해제로 상쾌한 아침을 시작하세요.',
  },
  {
    title: '편안한 잠자리',
    description: '타이머 설정 후 수면 모드에서 방해 없이 숙면하세요.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { requestNotification } = usePermissions();

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
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        <Button
          title={isLast ? '시작하기' : '다음'}
          variant="primary"
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dotActive: {
    backgroundColor: colors.accent1,
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
