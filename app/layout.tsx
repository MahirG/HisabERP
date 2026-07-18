import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { LanguageProvider } from "../components/language-provider";
import { WorkspaceShell } from "../components/workspace-shell";
import { getCurrentUserContext } from "../lib/data/context";
import { defaultLanguage, isLanguage, languageCookieName } from "../lib/i18n";
import "./globals.css";
import "./production.css";
import "./auth.css";
import "./operations.css";
import "./core-operations.css";
import "./setup-controls.css";

export const metadata: Metadata = {
  title: { default: "HisabTech", template: "%s | HisabTech" },
  description: "HisabTech — secure multilingual ERP for Ethiopian businesses.",
  applicationName: "HisabTech",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const storedLanguage = cookieStore.get(languageCookieName)?.value;
  const initialLanguage = isLanguage(storedLanguage) ? storedLanguage : defaultLanguage;
  const theme = cookieStore.get("hisab-theme")?.value === "dark" ? "dark" : "light";
  const user = await getCurrentUserContext();

  return (
    <html lang={initialLanguage} data-language={initialLanguage} data-theme={theme} suppressHydrationWarning>
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
