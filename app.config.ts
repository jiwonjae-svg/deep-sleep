import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'Deep Sleep',
  slug: 'deep-sleep',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon-512.png',
  scheme: 'deepsleep',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#06080E',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.deepsleep.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon-foreground.png',
      backgroundColor: '#06080E',
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
        sounds: ['./assets/sounds/alarm-default.mp3'],
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_APP_ID || 'ca-app-pub-xxxxxxxx~xxxxxxxx',
      },
    ],
    [
      'react-native-android-widget',
      {
        widgets: [
          {
            name: 'DeepSleepSmall',
            label: 'Deep Sleep',
            minWidth: '110dp',
            minHeight: '40dp',
            description: '재생/정지 + 현재 프리셋',
            previewImage: './assets/images/logo/icon.png',
            resizeMode: 'horizontal|vertical',
            widgetFeatures: 'reconfigurable',
            targetCellWidth: 2,
            targetCellHeight: 1,
          },
          {
            name: 'DeepSleepMedium',
            label: 'Deep Sleep',
            minWidth: '250dp',
            minHeight: '40dp',
            description: '재생/정지 + 프리셋 + 타이머',
            previewImage: './assets/images/logo/icon.png',
            resizeMode: 'horizontal|vertical',
            widgetFeatures: 'reconfigurable',
            targetCellWidth: 4,
            targetCellHeight: 1,
          },
          {
            name: 'DeepSleepLarge',
            label: 'Deep Sleep',
            minWidth: '250dp',
            minHeight: '110dp',
            description: '재생 + 프리셋 목록 + 타이머',
            previewImage: './assets/images/logo/icon.png',
            resizeMode: 'horizontal|vertical',
            widgetFeatures: 'reconfigurable',
            targetCellWidth: 4,
            targetCellHeight: 2,
          },
        ],
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
      projectId: process.env.EAS_PROJECT_ID ?? 'd760548b-c5cb-4d2e-a21c-a4b63aab6542',
    },
  },
});
