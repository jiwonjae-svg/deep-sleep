import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'Deep Sleep',
  slug: 'deep-sleep',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  scheme: 'deepsleep',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0E2A',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.deepsleep.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0E2A',
    },
    permissions: [
      'SCHEDULE_EXACT_ALARM',
      'USE_FULL_SCREEN_INTENT',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'WAKE_LOCK',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    ],
  },
  plugins: [
    'expo-router',
    'expo-asset',
    [
      'expo-notifications',
      {
        sounds: ['./assets/sounds/alarm-default.wav'],
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_APP_ID || 'ca-app-pub-xxxxxxxx~xxxxxxxx',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    revenueCatApiKey: process.env.REVENUECAT_API_KEY,
    admobInterstitialId: process.env.ADMOB_INTERSTITIAL_ID,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
