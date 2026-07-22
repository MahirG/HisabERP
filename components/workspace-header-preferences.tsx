"use client";

import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";

export function WorkspaceHeaderPreferences() {
  const { language } = useLanguage();
  const label = language === "am" ? "የስራ ቦታ ምርጫዎች" : "Workspace preferences";

  return (
    <div className="workspace-header-preferences global-preference-icons" aria-label={label}>
      <div className="workspace-header-preferences-inline">
        <LanguageSelector compact />
        <ThemeToggle />
      </div>
    </div>
  );
}
