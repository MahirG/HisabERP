"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

type Theme = "light" | "dark";

const labels = {
  en: { light: "Light mode", dark: "Dark mode" },
  am: { light: "ብርሃን ገጽታ", dark: "ጨለማ ገጽታ" },
  ti: { light: "ብርሃን መልክዕ", dark: "ጸልማት መልክዕ" },
} as const;

function preferredTheme(): Theme {
  const saved = window.localStorage.getItem("hisab-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = preferredTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("hisab-theme", next);
  }

  const nextLabel = theme === "dark" ? labels[language].light : labels[language].dark;
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={nextLabel} title={nextLabel}>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">{theme === "dark" ? "☾" : "☀"}</span>
      </span>
      <span>{theme === "dark" ? labels[language].dark : labels[language].light}</span>
    </button>
  );
}
