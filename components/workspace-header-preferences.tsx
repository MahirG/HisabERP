"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";
import { Icon } from "./ui/icon";

export function WorkspaceHeaderPreferences() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const label = language === "am" ? "የስራ ቦታ ምርጫዎች" : "Workspace preferences";
  const languageCode = language === "am" ? "አማ" : "EN";

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div className="workspace-header-preferences" ref={panelRef} aria-label={label}>
      <div className="workspace-header-preferences-inline">
        <LanguageSelector compact />
        <span className="workspace-header-preferences-divider" aria-hidden="true" />
        <ThemeToggle />
      </div>

      <button
        className="workspace-header-preferences-trigger"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls="workspace-mobile-preferences"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{languageCode}</span>
        <Icon name="sun" size={16} />
      </button>

      {open && (
        <div className="workspace-header-preferences-popover" id="workspace-mobile-preferences">
          <strong>{label}</strong>
          <LanguageSelector compact />
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
