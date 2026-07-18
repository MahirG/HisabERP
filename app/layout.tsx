import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { LanguageProvider } from "../components/language-provider";
import { WorkspaceShell } from "../components/workspace-shell";
import { getCurrentUserContext } from "../lib/data/context";
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
import "./auth-social.css";
import "./internal-premium.css";
import "./internal-modules-premium.css";
import "./finance.css";
import "./sales.css";
import "./core-operations.css";
import "./user-menu.css";
import "./user-menu-layout.css";
import "./docked-sidebar.css";
import "./product-experience.css";

export const metadata: Metadata = {
  title: { default: "HisabTech", template: "%s | HisabTech" },
  description: "HisabTech — secure multilingual ERP for Ethiopian businesses.",
  applicationName: "HisabTech",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#0F172A" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [cookieStore, user] = await Promise.all([cookies(), getCurrentUserContext()]);
  const saved = cookieStore.get("hisab_locale")?.value;
  const initialLanguage: Language = saved === "am" || saved === "ti" ? saved : "en";

  return (
    <html lang={initialLanguage} data-language={initialLanguage} data-theme="light" suppressHydrationWarning>
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <AppExperienceProvider>
            <WorkspaceShell user={user}>{children}</WorkspaceShell>
          </AppExperienceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}