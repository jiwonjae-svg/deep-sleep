// ⚠️ 첫 번째 import여야 함: Expo Go 콘솔 억제 설정 (LogBox + console 인터셉터)
// Babel이 모든 import를 hoist하므로 파일 내 순서가 로드 순서를 결정한다.
import '@/utils/setupDevSuppressions';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@/i18n'; // i18n 초기화
import { usePresetStore } from '@/stores/usePresetStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAIStore } from '@/stores/useAIStore';
import { initAudioMode, cleanupAudio } from '@/services/AudioService';
import { configureNotifications } from '@/services/AlarmService';
import { ThemeProvider, useThemeColors, useIsDarkTheme } from '@/theme';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { STORAGE_KEYS } from '@/utils/constants';
import i18n from '@/i18n';
// import { initBilling } from '@/services/BillingService';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
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
        <Stack.Screen name="playing" options={{ animation: 'fade' }} />
        <Stack.Screen name="alarm-dismiss" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="subscription" options={{ animation: 'fade', presentation: 'modal' }} />
        <Stack.Screen name="breathing" options={{ animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
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
        />\n      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
