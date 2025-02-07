import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationPL from './locales/pl.json';
import translationRU from './locales/ru.json';
import translationUA from './locales/ua.json';

const resources = {
  en: {
    translation: translationEN
  },
  pl: {
    translation: translationPL
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
    lng: "pl", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;