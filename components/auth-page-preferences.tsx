"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import type { SupportedLanguage as Language } from "../lib/translations";
import { useLanguage } from "./language-provider";
import { Icon } from "./ui/icon";

type Theme = "light" | "dark";

const LANGUAGE_STORAGE_KEY = "hisab-erp-language";
const LANGUAGE_COOKIE_NAME = "hisab_locale";

function preferredTheme(): Theme {
  const saved = window.localStorage.getItem("hisab-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AuthPagePreferences() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, dictionary, setLanguage } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [languageOpen, setLanguageOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  useEffect(() => {
    if (!isAuthRoute) return;
    const initial = preferredTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
  }, [isAuthRoute]);

  useEffect(() => {
    if (!isAuthRoute || !languageOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setLanguageOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isAuthRoute, languageOpen]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("hisab-theme", next);
  }

  function chooseLanguage(next: Language) {
    setLanguageOpen(false);
    if (next === language) return;

    window.dispatchEvent(new Event("hisab:busy"));
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      setLanguage(next);
      router.refresh();
    });
    window.setTimeout(() => window.dispatchEvent(new Event("hisab:done")), 900);
  }

  if (!isAuthRoute) return null;

  const themeLabel = theme === "dark"
    ? (language === "am" ? "ወደ ብርሃን ገጽታ ይቀይሩ" : "Switch to light mode")
    : (language === "am" ? "ወደ ጨለማ ገጽታ ይቀይሩ" : "Switch to dark mode");
  const languageLabel = dictionary.language.label;

  return (
    <div className="auth-page-preferences" ref={rootRef} aria-label={language === "am" ? "የመግቢያ ገጽ ምርጫዎች" : "Authentication page preferences"}>
      <button
        className="auth-preference-button auth-theme-button"
        type="button"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>

      <div className="auth-language-menu">
        <button
          className="auth-preference-button auth-language-trigger"
          type="button"
          onClick={() => setLanguageOpen((current) => !current)}
          aria-label={languageLabel}
          aria-haspopup="menu"
          aria-expanded={languageOpen}
          aria-controls="auth-language-options"
          title={languageLabel}
        >
          <span aria-hidden="true">Lang</span>
          <b>{language === "am" ? "አማ" : "EN"}</b>
        </button>

        {languageOpen && (
          <div className="auth-language-options" id="auth-language-options" role="menu" aria-label={languageLabel}>
            <button type="button" role="menuitemradio" aria-checked={language === "en"} className={language === "en" ? "active" : ""} onClick={() => chooseLanguage("en")}>English <span>EN</span></button>
            <button type="button" role="menuitemradio" aria-checked={language === "am"} className={language === "am" ? "active" : ""} onClick={() => chooseLanguage("am")}>አማርኛ <span>አማ</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
