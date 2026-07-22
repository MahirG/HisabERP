"use client";

import { usePathname } from "next/navigation";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";

export function AuthPagePreferences() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");
  const isStandaloneRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (!isAuthRoute && !isStandaloneRoute) return null;

  const label = language === "am"
    ? (isAuthRoute ? "የመግቢያ ገጽ ምርጫዎች" : "የገጽ ምርጫዎች")
    : (isAuthRoute ? "Authentication page preferences" : "Page preferences");

  return (
    <div className="auth-page-preferences global-preference-icons" aria-label={label}>
      <LanguageSelector compact />
      <ThemeToggle />
    </div>
  );
}
