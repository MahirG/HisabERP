import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { LanguageProvider } from "../components/language-provider";
import type { Language } from "../lib/translations";
import "./font-benaiah-1.css";
import "./font-benaiah-2.css";
import "./font-benaiah-3.css";
import "./fonts.css";
import "./globals.css";
import "./erp-modules.css";
import "./i18n.css";
import "./production.css";
import "./auth-i18n.css";
import "./auth-premium.css";

export const metadata: Metadata = {
  title: { default: "Hisab ERP", template: "%s | Hisab ERP" },
  description: "Secure multilingual ERP for Ethiopian businesses.",
  applicationName: "Hisab ERP",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#0F172A" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const saved = cookieStore.get("hisab_locale")?.value;
  const initialLanguage: Language = saved === "am" || saved === "ti" ? saved : "en";
  return <html lang={initialLanguage} data-language={initialLanguage} suppressHydrationWarning><body><LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider></body></html>;
}
