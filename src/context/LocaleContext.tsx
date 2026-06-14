import React, { createContext, useContext, useMemo } from 'react';
import * as Localization from 'expo-localization';
import { Locale, TranslationKey, translationsMap } from '../i18n/translations';

type LocaleContextType = {
  locale: Locale;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: 'ja',
  t: (key) => key,
});

function detectLocale(): Locale {
  const lang = Localization.getLocales()[0]?.languageCode;
  return lang === 'ja' ? 'ja' : 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = detectLocale();
  const t = useMemo(() => (key: TranslationKey) => translationsMap[locale][key], [locale]);
  return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
