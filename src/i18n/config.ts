
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationPL from './locales/pl.json';
import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';
import translationUA from './locales/ua.json';

const resources = {
  pl: {
    translation: translationPL
  },
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  },
  ua: {
    translation: translationUA
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pl", // Set Polish as the default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
