export const colors = {
  // Primary backgrounds — 기존보다 어둡고 채도 낮춤
  bgPrimary: '#06080E',
  bgSecondary: '#0D0F1B',
  bgTertiary: '#141728',

  // Glassmorphism
  glassLight: 'rgba(255,255,255,0.06)',
  glassMedium: 'rgba(255,255,255,0.10)',
  glassHeavy: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.12)',

  // Accent
  accent1: '#6C63FF', // purple
  accent2: '#4ECDC4', // mint
  accent3: '#FFD93D', // yellow

  // Text
  textPrimary: '#EAEAEA',
  textSecondary: '#888DAA',
  textMuted: '#4A4F6A',
  textAccent: '#6C63FF',

  // Semantic
  success: '#4ECDC4',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#6C63FF',

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
  sleepClockDefault: 'rgba(234,234,234,0.10)',
  sleepClockActive: 'rgba(234,234,234,0.60)',
  sleepIcon: 'rgba(108,99,255,0.15)',
  sleepStop: 'rgba(255,107,107,0.30)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
} as const;
