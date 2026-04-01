export const colors = {
  // Nocturne Glass — surface hierarchy
  bgPrimary: '#0b0f19',          // background / surface-dim
  bgSecondary: '#11151f',        // surface-container
  bgTertiary: '#191e2a',         // surface-container-high
  bgElevated: '#242936',         // surface-container-highest

  // Glassmorphism
  glassLight: 'rgba(255,255,255,0.08)',
  glassMedium: 'rgba(255,255,255,0.18)',
  glassHeavy: 'rgba(255,255,255,0.30)',
  glassBorder: 'rgba(255,255,255,0.15)',
  glassBorderActive: 'rgba(255,255,255,0.30)',

  // Accent
  accent1: '#456eea',            // primary blue
  accent2: '#ffb59b',            // tertiary warm peach
  accent3: '#b4c5ff',            // secondary-fixed-dim

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  textAccent: '#456eea',

  // Semantic
  success: '#4ade80',
  warning: '#ffb59b',
  error: '#ff6b6b',
  info: '#456eea',

  // Category accent colors
  category: {
    'rain-water': '#5B9BD5',
    'ocean-beach': '#2E86AB',
    'wind-weather': '#87CEEB',
    'forest-nature': '#6BCB77',
    'fire-warmth': '#FF8C42',
    'indoor-ambient': '#D4A574',
    'urban-transport': '#8D93AB',
    'musical-tonal': '#9B72CF',
    'special-environments': '#2EC4B6',
    'seasonal-special': '#E8A0BF',
  } as Record<string, string>,

  // Sleep mode
  sleepBg: '#000000',
  sleepClockDefault: 'rgba(255,255,255,0.08)',
  sleepClockActive: 'rgba(255,255,255,0.60)',
  sleepIcon: 'rgba(69,110,234,0.15)',
  sleepStop: 'rgba(255,107,107,0.30)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const lightColors = {
  // Light mode — soft warm surfaces
  bgPrimary: '#f5f5f7',
  bgSecondary: '#ffffff',
  bgTertiary: '#ebedf0',
  bgElevated: '#ffffff',

  glassLight: 'rgba(0,0,0,0.04)',
  glassMedium: 'rgba(0,0,0,0.08)',
  glassHeavy: 'rgba(0,0,0,0.14)',
  glassBorder: 'rgba(0,0,0,0.08)',
  glassBorderActive: 'rgba(0,0,0,0.18)',

  accent1: '#3d5bd9',
  accent2: '#e8946b',
  accent3: '#6b8adb',

  textPrimary: '#1a1a2e',
  textSecondary: 'rgba(26,26,46,0.65)',
  textMuted: 'rgba(26,26,46,0.35)',
  textAccent: '#3d5bd9',

  success: '#22c55e',
  warning: '#e8946b',
  error: '#ef4444',
  info: '#3d5bd9',

  category: {
    'rain-water': '#4a8ac4',
    'ocean-beach': '#267a9e',
    'wind-weather': '#5baed4',
    'forest-nature': '#4db85e',
    'fire-warmth': '#e07538',
    'indoor-ambient': '#c49466',
    'urban-transport': '#6b7294',
    'musical-tonal': '#7d58b8',
    'special-environments': '#22ad9f',
    'seasonal-special': '#d080a8',
  } as Record<string, string>,

  sleepBg: '#000000',
  sleepClockDefault: 'rgba(0,0,0,0.06)',
  sleepClockActive: 'rgba(0,0,0,0.60)',
  sleepIcon: 'rgba(61,91,217,0.12)',
  sleepStop: 'rgba(239,68,68,0.25)',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.3)',
} as const;

export type AppColors = typeof colors;
