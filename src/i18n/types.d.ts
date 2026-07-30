import 'i18next';
import type enCommon from './locales/en/common.json';
import type enInitial from './locales/en/initial.json';
import type enAuth from './locales/en/auth.json';
import type enFeed from './locales/en/feed.json';
import type enSoults from './locales/en/soults.json';
import type enScreentime from './locales/en/screentime.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      initial: typeof enInitial;
      auth: typeof enAuth;
      feed: typeof enFeed;
      soults: typeof enSoults;
      screentime: typeof enScreentime;
    };
  }
}
