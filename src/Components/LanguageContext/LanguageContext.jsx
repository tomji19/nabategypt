import React, { createContext, useContext, useEffect, useState } from 'react';
import { translate } from '../../i18n';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'nabat_lang';

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key, vars) => translate(lang, key, vars);
  const toggle = () => setLang((l) => (l === 'en' ? 'ar' : 'en'));

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle, t, isAr: lang === 'ar' }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
