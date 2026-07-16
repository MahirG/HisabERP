"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Language } from "../lib/translations";

const STORAGE_KEY = "hisab-erp-language";
const COOKIE_NAME = "hisab_locale";

type LanguageContextValue = {
  language: Language;
  dictionary: Dictionary;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLanguage = "en" }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if ((saved === "en" || saved === "am" || saved === "ti") && saved !== language) setLanguageState(saved);
    // We intentionally run this once: the server cookie remains the first-render source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "am" ? "am" : language === "ti" ? "ti" : "en";
    document.documentElement.dataset.language = language;
    document.documentElement.dir = "ltr";
    window.localStorage.setItem(STORAGE_KEY, language);
    document.cookie = `${COOKIE_NAME}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({ language, dictionary: dictionaries[language], setLanguage: setLanguageState }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, dictionary, setLanguage } = useLanguage();
  return <label className={`language-selector${compact ? " compact" : ""}`}><span>{dictionary.language.label}</span><select aria-label={dictionary.language.label} value={language} onChange={(event: ChangeEvent<HTMLSelectElement>) => setLanguage(event.target.value as Language)}><option value="en">{dictionary.language.english}</option><option value="am">{dictionary.language.amharic}</option><option value="ti">{dictionary.language.tigrinya}</option></select></label>;
}
