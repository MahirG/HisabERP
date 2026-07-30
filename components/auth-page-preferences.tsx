"use client";

import { usePathname } from "next/navigation";
import { LanguageSelector, useLanguage } from "./language-provider";

export function AuthPagePreferences() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");
  const isStandaloneRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (!isAuthRoute && !isStandaloneRoute) return null;

  const label = language === "am"
    ? (isAuthRoute ? "የመግቢያ ገጽ ቋንቋ" : "የገጽ ቋንቋ")
    : (isAuthRoute ? "Authentication page language" : "Page language");

  return (
    <div className="auth-page-preferences global-preference-icons" aria-label={label}>
      <LanguageSelector compact />
    </div>
  );
}
