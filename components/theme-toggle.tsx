"use client";

import { useEffect } from "react";

const THEME_EVENT = "hisab:theme-change";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  try {
    window.localStorage.setItem("hisab-theme", theme);
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }

  document.cookie = `hisab_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

/**
 * Keeps Biloo aligned with the device appearance without rendering a visible
 * theme control. Text, surfaces and controls therefore switch together when
 * the operating system moves between light and dark mode.
 */
export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => applyTheme(media.matches ? "dark" : "light");

    syncTheme();
    media.addEventListener("change", syncTheme);

    return () => media.removeEventListener("change", syncTheme);
  }, []);

  return null;
}
