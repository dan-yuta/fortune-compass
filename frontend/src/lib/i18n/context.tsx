"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Locale, Dictionary, getDictionary } from "./dictionaries";

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "fortune-compass-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "ja";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ja") return stored;
  return "ja";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    document.documentElement.lang = newLocale;
  }, []);

  const t = getDictionary(locale);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
