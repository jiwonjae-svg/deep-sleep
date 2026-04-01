import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  // Nocturne Glass — Manrope / system sans-serif
  display: { fontSize: 48, fontWeight: '800', lineHeight: 58, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  overline: { fontSize: 10, fontWeight: '700', lineHeight: 16, textTransform: 'uppercase', letterSpacing: 3 },
  button: { fontSize: 12, fontWeight: '700', lineHeight: 18, letterSpacing: 2.5, textTransform: 'uppercase' },
  buttonSmall: { fontSize: 11, fontWeight: '600', lineHeight: 16, letterSpacing: 1.5 },
};
