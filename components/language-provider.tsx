"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
    // The server cookie remains the first-render source of truth.
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

const languageCodes: Array<{ value: Language; short: string }> = [
  { value: "en", short: "EN" },
  { value: "am", short: "አማ" },
  { value: "ti", short: "ትግ" },
];

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, dictionary, setLanguage } = useLanguage();
  const router = useRouter();

  function chooseLanguage(next: Language) {
    if (next === language) return;
    window.dispatchEvent(new Event("hisab:busy"));
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      setLanguage(next);
      router.refresh();
    });
    window.setTimeout(() => window.dispatchEvent(new Event("hisab:done")), 900);
  }

  const names: Record<Language, string> = {
    en: dictionary.language.english,
    am: dictionary.language.amharic,
    ti: dictionary.language.tigrinya,
  };

  return (
    <div className={`language-selector language-segmented${compact ? " compact" : ""}`} role="group" aria-label={dictionary.language.label}>
      {!compact && <span>{dictionary.language.label}</span>}
      <div>
        {languageCodes.map((item) => (
          <button
            type="button"
            key={item.value}
            className={language === item.value ? "active" : ""}
            aria-pressed={language === item.value}
            title={names[item.value]}
            onClick={() => chooseLanguage(item.value)}
          >
            {item.short}
          </button>
        ))}
      </div>
    </div>
  );
}
