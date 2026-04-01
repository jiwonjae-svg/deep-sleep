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
  // Nocturne Glass Light variant — same dark aesthetic
  bgPrimary: '#0b0f19',
  bgSecondary: '#11151f',
  bgTertiary: '#191e2a',
  bgElevated: '#242936',

  glassLight: 'rgba(255,255,255,0.08)',
  glassMedium: 'rgba(255,255,255,0.18)',
  glassHeavy: 'rgba(255,255,255,0.30)',
  glassBorder: 'rgba(255,255,255,0.15)',
  glassBorderActive: 'rgba(255,255,255,0.30)',

  accent1: '#456eea',
  accent2: '#ffb59b',
  accent3: '#b4c5ff',

  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  textAccent: '#456eea',

  success: '#4ade80',
  warning: '#ffb59b',
  error: '#ff6b6b',
  info: '#456eea',

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

  sleepBg: '#000000',
  sleepClockDefault: 'rgba(255,255,255,0.08)',
  sleepClockActive: 'rgba(255,255,255,0.60)',
  sleepIcon: 'rgba(69,110,234,0.15)',
  sleepStop: 'rgba(255,107,107,0.30)',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export type AppColors = typeof colors;
