import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '@/locales/ko.json';
import en from '@/locales/en.json';

export const resources = {
  ko: { translation: ko },
  en: { translation: en },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false, // React already handles XSS
  },
  compatibilityJSON: 'v4',
});

export default i18n;
