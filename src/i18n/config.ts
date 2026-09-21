import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptCommon from './locales/pt-BR/common.json';
import ptInitial from './locales/pt-BR/initial.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptFeed from './locales/pt-BR/feed.json';
import ptSoults from './locales/pt-BR/soults.json';
import ptScreentime from './locales/pt-BR/screentime.json';


i18n
  .use(initReactI18next)
  .init({
    lng: 'pt-BR',
    supportedLngs: ['pt-BR'],
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: ['common', 'initial', 'auth', 'feed', 'soults', 'screentime'],
    resources: {
      'pt-BR': { common: ptCommon, initial: ptInitial, auth: ptAuth, feed: ptFeed, soults: ptSoults, screentime: ptScreentime },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
