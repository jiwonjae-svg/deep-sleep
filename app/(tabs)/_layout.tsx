import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemeColors, typography } from '@/theme';
import { layout } from '@/theme/spacing';
import { AdBanner } from '@/components/common/AdBanner';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { View, StyleSheet } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_KEYS = [
  { name: 'index', key: 'tabs.home', iconFocused: 'home' as IconName, iconDefault: 'home-outline' as IconName },
  { name: 'mixer', key: 'tabs.mixer', iconFocused: 'musical-notes' as IconName, iconDefault: 'musical-notes-outline' as IconName },
  { name: 'presets', key: 'tabs.presets', iconFocused: 'albums' as IconName, iconDefault: 'albums-outline' as IconName },
  { name: 'alarms', key: 'tabs.alarms', iconFocused: 'alarm' as IconName, iconDefault: 'alarm-outline' as IconName },
  { name: 'my', key: 'tabs.my', iconFocused: 'person' as IconName, iconDefault: 'person-outline' as IconName },
  { name: 'settings', key: 'tabs.settings', iconFocused: 'settings' as IconName, iconDefault: 'settings-outline' as IconName },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        tabBar: {
          backgroundColor: themeColors.bgPrimary === '#0b0f19'
            ? 'rgba(11,15,25,0.8)'
            : 'rgba(245,245,247,0.92)',
          borderTopWidth: 1,
          borderTopColor: themeColors.glassBorder,
          paddingTop: 8,
        },
        tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
      }),
    [themeColors],
  );

  return (
    <GradientBackground overlay overlayOpacity={0.45}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            ...styles.tabBar,
            height: layout.tabBarHeight + insets.bottom,
            paddingBottom: 8 + insets.bottom,
          },
          tabBarActiveTintColor: themeColors.accent1,
          tabBarInactiveTintColor: themeColors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        {TAB_KEYS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t(tab.key),
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name={focused ? tab.iconFocused : tab.iconDefault}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tabs>
      <AdBanner />
    </GradientBackground>
  );
}
