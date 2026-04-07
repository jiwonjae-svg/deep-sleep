import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingPatternSelector } from '@/components/breathing/BreathingPatternSelector';
import { useBreathingStore, BREATHING_PATTERNS } from '@/stores/useBreathingStore';
import { useThemeColors } from '@/theme';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/ui/GradientBackground';

export default function BreathingScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { t } = useTranslation();
  const {
    isSessionActive,
    selectedPatternId,
    completedCycles,
    targetCycles,
    currentPhaseIndex,
    startSession,
    stopSession,
    tick,
  } = useBreathingStore();

  const pattern = useMemo(
    () => BREATHING_PATTERNS.find((p) => p.id === selectedPatternId),
    [selectedPatternId],
  );

  const prevPhaseRef = useRef(currentPhaseIndex);

  // Tick every second during session
  useEffect(() => {
    if (!isSessionActive) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [isSessionActive, tick]);

  // Haptic feedback on phase change
  useEffect(() => {
    if (isSessionActive && currentPhaseIndex !== prevPhaseRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    prevPhaseRef.current = currentPhaseIndex;
  }, [currentPhaseIndex, isSessionActive]);

  return (
    <GradientBackground overlay overlayOpacity={0.45}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t('breathing.title', { defaultValue: '호흡 가이드' })}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Breathing Circle */}
          <View style={styles.circleWrapper}>
            <BreathingCircle />
          </View>

          {/* Cycle counter */}
          {isSessionActive && (
            <Text style={styles.cycleText}>
              {completedCycles} / {targetCycles} {t('breathing.cycles', { defaultValue: '사이클' })}
            </Text>
          )}

          {/* Session complete message */}
          {!isSessionActive && completedCycles > 0 && (
            <Text style={styles.completeText}>
              {t('breathing.complete', { defaultValue: '호흡 운동 완료!' })}
            </Text>
          )}

          {/* Pattern selector (hidden during session) */}
          {!isSessionActive && (
            <View style={styles.selectorWrapper}>
              <Text style={styles.sectionTitle}>
                {t('breathing.selectPattern', { defaultValue: '호흡 패턴' })}
              </Text>
              <BreathingPatternSelector />
            </View>
          )}

          {/* Start / Stop button */}
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: isSessionActive ? '#ef4444' : themeColors.accent1 },
            ]}
            onPress={() => (isSessionActive ? stopSession() : startSession())}
          >
            <MaterialIcons
              name={isSessionActive ? 'stop' : 'play-arrow'}
              size={24}
              color="#ffffff"
            />
            <Text style={styles.actionBtnText}>
              {isSessionActive
                ? t('breathing.stop', { defaultValue: '중지' })
                : t('breathing.start', { defaultValue: '시작' })}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    gap: 32,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  completeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: 1,
  },
  selectorWrapper: {
    width: '100%',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 9999,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
