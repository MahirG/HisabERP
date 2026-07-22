"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";
import { Icon } from "./ui/icon";

type Theme = "light" | "dark";
type ThemeChangeDetail = { theme?: Theme };

const THEME_EVENT = "hisab:theme-change";

const labels = {
  en: { light: "Switch to light mode", dark: "Switch to dark mode" },
  am: { light: "ወደ ብርሃን ገጽታ ይቀይሩ", dark: "ወደ ጨለማ ገጽታ ይቀይሩ" },
  ti: { light: "ናብ ብርሃን መልክዕ ቀይሩ", dark: "ናብ ጸልማት መልክዕ ቀይሩ" },
} as const;

function preferredTheme(): Theme {
  const rendered = document.documentElement.dataset.theme;
  if (rendered === "light" || rendered === "dark") return rendered;
  const saved = window.localStorage.getItem("hisab-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function announceTheme(theme: Theme) {
  window.dispatchEvent(new CustomEvent<ThemeChangeDetail>(THEME_EVENT, { detail: { theme } }));
}

function persistTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("hisab-theme", theme);
  document.cookie = `hisab_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  announceTheme(theme);
}

export function ThemeToggle() {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const syncTheme = (event?: Event) => {
      const announced = (event as CustomEvent<ThemeChangeDetail> | undefined)?.detail?.theme;
      setTheme(announced === "light" || announced === "dark" ? announced : preferredTheme());
    };
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key === "hisab-theme") syncTheme();
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", syncStoredTheme);

    const initial = preferredTheme();
    setTheme(initial);
    persistTheme(initial);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", syncStoredTheme);
    };
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistTheme(next);
  }

  const nextMode = theme === "dark" ? "light" : "dark";
  const nextLabel = labels[language][nextMode];

  return (
    <button className="theme-toggle preference-icon-button" type="button" onClick={toggleTheme} aria-label={nextLabel} title={nextLabel} data-i18n-skip>
      <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
    </button>
  );
}
