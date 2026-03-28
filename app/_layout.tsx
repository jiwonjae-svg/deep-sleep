import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, LogBox } from 'react-native';

// Expo Go에서 push notification 자동 등록 시도 시 발생하는 알려진 제한 경고 억제
// (Dev Build 또는 스토어 빌드에서는 발생하지 않음)
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/i18n'; // i18n 초기화
import { usePresetStore } from '@/stores/usePresetStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAIStore } from '@/stores/useAIStore';
import { initAudioMode } from '@/services/AudioService';
import { configureNotifications } from '@/services/AlarmService';
import { colors } from '@/theme';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { STORAGE_KEYS } from '@/utils/constants';
import i18n from '@/i18n';
// import { initBilling } from '@/services/BillingService';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      // 오디오 모드 초기화
      await initAudioMode();

      // 알림 핸들러 설정
      configureNotifications();

      // 스토어 데이터 로딩
      await Promise.all([
        usePresetStore.getState().loadPresets(),
        useAlarmStore.getState().loadAlarms(),
        useSettingsStore.getState().loadSettings(),
        useAIStore.getState().loadUsage(),
      ]);

      // RevenueCat 초기화 (API 키 설정 후 활성화)
      // const rcApiKey = Constants.expoConfig?.extra?.REVENUECAT_API_KEY;
      // if (rcApiKey) await initBilling(rcApiKey);

      // 언어 설정 동기화
      const lang = useSettingsStore.getState().settings.language;
      if (lang && lang !== i18n.language) {
        await i18n.changeLanguage(lang);
      }

      setReady(true);
    }

    bootstrap();
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="playing" options={{ animation: 'fade' }} />
        <Stack.Screen name="alarm-dismiss" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
