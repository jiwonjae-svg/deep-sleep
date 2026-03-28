import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, typography } from '@/theme';
import { layout } from '@/theme/spacing';
import { AdBanner } from '@/components/common/AdBanner';
import { View, StyleSheet } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: { name: string; title: string; iconFocused: IconName; iconDefault: IconName }[] =
  [
    { name: 'index', title: '홈', iconFocused: 'home', iconDefault: 'home-outline' },
    {
      name: 'mixer',
      title: '믹서',
      iconFocused: 'musical-notes',
      iconDefault: 'musical-notes-outline',
    },
    { name: 'presets', title: '프리셋', iconFocused: 'albums', iconDefault: 'albums-outline' },
    { name: 'alarms', title: '알람', iconFocused: 'alarm', iconDefault: 'alarm-outline' },
    {
      name: 'settings',
      title: '설정',
      iconFocused: 'settings',
      iconDefault: 'settings-outline',
    },
  ];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.bgPrimary },
        tabBar: {
          backgroundColor: themeColors.bgSecondary,
          borderTopWidth: 1,
          borderTopColor: themeColors.glassBorder,
          paddingTop: 4,
        },
        tabLabel: { fontSize: 11, fontWeight: '600' },
      }),
    [themeColors],
  );

  return (
    <View style={styles.container}>
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
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
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
    </View>
  );
}
