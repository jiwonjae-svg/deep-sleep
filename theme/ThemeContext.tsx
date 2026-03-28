import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, lightColors, AppColors } from './colors';

const ThemeContext = createContext<AppColors>(colors);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const systemScheme = useColorScheme();

  const themeColors = useMemo<AppColors>(() => {
    const effective =
      themeMode === 'system'
        ? systemScheme === 'light'
          ? 'light'
          : 'dark'
        : themeMode;
    return effective === 'light' ? (lightColors as AppColors) : colors;
  }, [themeMode, systemScheme]);

  return <ThemeContext.Provider value={themeColors}>{children}</ThemeContext.Provider>;
}

export function useThemeColors(): AppColors {
  return useContext(ThemeContext);
}

/** StatusBar style 결정 헬퍼 */
export function useIsDarkTheme(): boolean {
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const systemScheme = useColorScheme();
  if (themeMode === 'system') return systemScheme !== 'light';
  return themeMode === 'dark';
}
