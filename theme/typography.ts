import { TextStyle, Platform } from 'react-native';

const monoFont = Platform.select({ android: 'monospace', default: 'monospace' });

export const typography: Record<string, TextStyle> = {
  display: { fontSize: 40, fontWeight: '700', lineHeight: 48, fontFamily: monoFont },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  overline: { fontSize: 11, fontWeight: '600', lineHeight: 16, textTransform: 'uppercase' },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
  buttonSmall: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
};
