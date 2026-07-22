"use client";

import { usePathname } from "next/navigation";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";

export function AuthPagePreferences() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  if (!isAuthRoute) return null;

  const label = language === "am" ? "የመግቢያ ገጽ ምርጫዎች" : "Authentication page preferences";

  return (
    <div className="auth-page-preferences global-preference-icons" aria-label={label}>
      <LanguageSelector compact />
      <ThemeToggle />
    </div>
  );
}
