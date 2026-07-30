import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enInitial from './locales/en/initial.json';
import enAuth from './locales/en/auth.json';
import enFeed from './locales/en/feed.json';
import enSoults from './locales/en/soults.json';
import enScreentime from './locales/en/screentime.json';

import ptCommon from './locales/pt-BR/common.json';
import ptInitial from './locales/pt-BR/initial.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptFeed from './locales/pt-BR/feed.json';
import ptSoults from './locales/pt-BR/soults.json';
import ptScreentime from './locales/pt-BR/screentime.json';

import esCommon from './locales/es/common.json';
import esInitial from './locales/es/initial.json';
import esAuth from './locales/es/auth.json';
import esFeed from './locales/es/feed.json';
import esSoults from './locales/es/soults.json';
import esScreentime from './locales/es/screentime.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: ['common', 'initial', 'auth', 'feed', 'soults', 'screentime'],
    resources: {
      en: { common: enCommon, initial: enInitial, auth: enAuth, feed: enFeed, soults: enSoults, screentime: enScreentime },
      'pt-BR': { common: ptCommon, initial: ptInitial, auth: ptAuth, feed: ptFeed, soults: ptSoults, screentime: ptScreentime },
      es: { common: esCommon, initial: esInitial, auth: esAuth, feed: esFeed, soults: esSoults, screentime: esScreentime },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'soul_lang',
    },
  });

export default i18n;