import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingPatternSelector } from '@/components/breathing/BreathingPatternSelector';
import { useBreathingStore, BREATHING_PATTERNS } from '@/stores/useBreathingStore';
import { useThemeColors, typography, spacing, layout } from '@/theme';
import { useTranslation } from 'react-i18next';

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
        headerTitle: {
          fontSize: 16,
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        closeBtn: {
          padding: spacing.xs,
        },
        content: {
          alignItems: 'center',
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
      }),
    [themeColors],
  );

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
            <Text style={styles.headerTitle}>
              {t('breathing.title', { defaultValue: '호흡 가이드' })}
            </Text>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={22} color={themeColors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.content}>
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
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}
