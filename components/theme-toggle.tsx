"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";
import { Icon } from "./ui/icon";

type Theme = "light" | "dark";

const labels = {
  en: { light: "Light mode", dark: "Dark mode" },
  am: { light: "ብርሃን ገጽታ", dark: "ጨለማ ገጽታ" },
  ti: { light: "ብርሃን መልክዕ", dark: "ጸልማት መልክዕ" },
} as const;

function preferredTheme(): Theme {
  const rendered = document.documentElement.dataset.theme;
  if (rendered === "light" || rendered === "dark") return rendered;
  const saved = window.localStorage.getItem("hisab-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function persistTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("hisab-theme", theme);
  document.cookie = `hisab_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function ThemeToggle() {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = preferredTheme();
    setTheme(initial);
    persistTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistTheme(next);
  }

  const nextLabel = theme === "dark" ? labels[language].light : labels[language].dark;

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={nextLabel} title={nextLabel}>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb"><Icon name={theme === "dark" ? "moon" : "sun"} size={16} /></span>
      </span>
      <span>{theme === "dark" ? labels[language].dark : labels[language].light}</span>
    </button>
  );
}
