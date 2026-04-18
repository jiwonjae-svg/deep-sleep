// ⚠️ 첫 번째 import여야 함: Expo Go 콘솔 억제 설정 (LogBox + console 인터셉터)
// Babel이 모든 import를 hoist하므로 파일 내 순서가 로드 순서를 결정한다.
import '@/utils/setupDevSuppressions';
import '@/widgets/widget-task-handler'; // Android 위젯 핸들러 등록
import React, { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/i18n'; // i18n 초기화
import { useTranslation } from 'react-i18next';
import { usePresetStore } from '@/stores/usePresetStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAIStore } from '@/stores/useAIStore';
import { initAudioMode, cleanupAudio } from '@/services/AudioService';
import { configureNotifications, setupAlarmListeners, requestAlarmPermissions, getInitialAlarmNotification, showBatteryOptimizationAlert } from '@/services/AlarmService';
import { ThemeProvider, useThemeColors, useIsDarkTheme } from '@/theme';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { STORAGE_KEYS } from '@/utils/constants';
import i18n from '@/i18n';
import { initBilling } from '@/services/BillingService';
import Constants from 'expo-constants';

// 스플래시 애니메이션 최소 표시 시간 = FADE_IN(400) + ZOOM_FADE(2800) + GAP(400)
const SPLASH_MIN_MS = 3600;

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const t0 = Date.now();
      await initAudioMode();
      // 이전 세션(또는 Fast Refresh)에서 남은 오디오 인스턴스 완전 정리
      // cleanupAudio()는 fadeOut 없이 즉시 정리하므로 레이스 컨디션 없음
      await cleanupAudio();
      configureNotifications();
      await Promise.all([
        usePresetStore.getState().loadPresets(),
        useAlarmStore.getState().loadAlarms(),
        useSettingsStore.getState().loadSettings(),
        useAIStore.getState().loadUsage(),
      ]);
      const lang = useSettingsStore.getState().settings.language;
      if (lang && lang !== i18n.language) {
        await i18n.changeLanguage(lang);
      }
      // RevenueCat 결제 SDK 초기화 (네이티브 빌드에서만 동작)
      const rcKey = Constants.expoConfig?.extra?.revenueCatApiKey as string | undefined;
      if (rcKey) {
        initBilling(rcKey).catch(() => {});
      }
      // 애니메이션 최소 1사이클 보장 — bootstrap이 너무 빠르면 opacity=0인 채로
      // 컴포넌트가 언마운트되어 애니메이션이 보이지 않는 버그 방지
      const remaining = SPLASH_MIN_MS - (Date.now() - t0);
      if (remaining > 0) await new Promise<void>((r) => setTimeout(r, remaining));
      setReady(true);
    }
    bootstrap();
  }, []);

  return (
    <ThemeProvider>
      {ready ? <ThemedApp /> : <LoadingScreen />}
    </ThemeProvider>
  );
}

function ThemedApp() {
  const appColors = useThemeColors();
  const isDark = useIsDarkTheme();
  const router = useRouter();
  const listenerCleanupRef = useRef<(() => void) | null>(null);
  const { t } = useTranslation();

  // 알람 알림 리스너: 알림 탭/스와이프 시 alarm-dismiss 페이지로 이동
  useEffect(() => {
    listenerCleanupRef.current = setupAlarmListeners((alarmId) => {
      router.push({ pathname: '/alarm-dismiss', params: { alarmId } });
    });
    return () => { listenerCleanupRef.current?.(); };
  }, [router]);

  // 콜드 스타트: 앱 종료 상태에서 알림 탭으로 열린 경우 alarm-dismiss로 이동
  // + 온보딩 미완료 시 온보딩 화면으로 자동 리다이렉트
  useEffect(() => {
    (async () => {
      const alarmId = await getInitialAlarmNotification();
      if (alarmId) {
        setTimeout(() => {
          router.push({ pathname: '/alarm-dismiss', params: { alarmId } });
        }, 400);
        return;
      }
      // 온보딩 완료 여부 확인
      const onboardingDone = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      if (!onboardingDone) {
        setTimeout(() => {
          router.replace('/onboarding');
        }, 400);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Android: 정확한 알람 + 알림 권한 요청 + 배터리 최적화 안내
  useEffect(() => {
    requestAlarmPermissions().catch(() => {});
    // 첫 실행 시 배터리 최적화 해제 안내 (Doze Mode 대응)
    AsyncStorage.getItem('@battery_opt_shown').then((shown) => {
      if (!shown) {
        setTimeout(() => {
          showBatteryOptimizationAlert(t);
          AsyncStorage.setItem('@battery_opt_shown', 'true').catch(() => {});
        }, 2000);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: appColors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="alarm-dismiss" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="subscription"
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="breathing"
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="presets/save"
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="alarms/edit"
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
