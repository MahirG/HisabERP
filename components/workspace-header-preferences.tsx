"use client";

import { LanguageSelector, useLanguage } from "./language-provider";

export function WorkspaceHeaderPreferences() {
  const { language } = useLanguage();
  const label = language === "am" ? "የስራ ቦታ ቋንቋ" : "Workspace language";

  return (
    <div className="workspace-header-preferences global-preference-icons" aria-label={label}>
      <div className="workspace-header-preferences-inline">
        <LanguageSelector compact />
      </div>
    </div>
  );
}
