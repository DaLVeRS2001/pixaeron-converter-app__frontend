import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import {
  defaultLanguage,
  defaultNS,
  namespaces,
  resources,
  supportedLanguages,
} from './resources';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
    ns: namespaces,
    defaultNS,
    debug: __IS_DEV__,
    returnNull: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// eslint-disable-next-line
export default i18n; // export default is mandatory here
