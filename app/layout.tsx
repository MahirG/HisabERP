import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { AuthPagePreferences } from "../components/auth-page-preferences";
import { LanguageProvider } from "../components/language-provider";
import { WorkspaceShell } from "../components/workspace-shell";
import { getCurrentUserContext } from "../lib/data/context";
import type { SupportedLanguage as Language } from "../lib/translations";
import "./font-benaiah-1.css";
import "./font-benaiah-2.css";
import "./font-benaiah-3.css";
import "./fonts.css";
import "./globals.css";
import "./design-system.css";
import "./icon-system.css";
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
import "./e-invoicing.css";
import "./reconciliation.css";
import "./core-operations.css";
import "./setup-controls.css";
import "./onboarding-launch.css";
import "./readiness.css";
import "./user-menu.css";
import "./user-menu-layout.css";
import "./docked-sidebar.css";
import "./product-experience.css";
import "./brand-refinements.css";
import "./sidebar-icon-cleanup.css";
import "./account-security-premium.css";
import "./workspace-standardization.css";
import "./phone-auth-standard.css";
import "./auth-official.css";
import "./auth-login-slack.css";
import "./auth-hisab-brand.css";
import "./marketing-site.css";
import "./marketing-experience.css";
import "./market-expansion.css";
import "./proof-trust-integrations.css";
import "./migration-comparisons-help.css";
import "./home-implementation-resources.css";
import "./public-experience-final.css";
import "./request-demo.css";
import "./request-demo-secure.css";
import "./mobile-workspace.css";
import "./workspace-command-center.css";
import "./help-center.css";
import "./supabase-sidebar.css";
import "./financial-workspace-foundation.css";
import "./financial-workspace-components.css";
import "./financial-dashboard.css";
import "./workspace-header-preferences.css";
import "./light-theme-contrast.css";
import "./light-theme-component-guards.css";
import "./auth-page-preferences.css";
import "./header-only-preferences.css";
import "./official-brand.css";
import "./strict-brand.css";
import "./brand-final-lock.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hisabtech.com"),
  title: { default: "HisabTech — Business Operating System for Ethiopia", template: "%s | HisabTech" },
  description: "HisabERP connects sales, finance, inventory, customers, suppliers and reporting for growing Ethiopian businesses.",
  applicationName: "HisabTech",
  keywords: ["HisabERP", "ERP Ethiopia", "business software Ethiopia", "inventory", "sales", "finance", "accounting workflow"],
  authors: [{ name: "Hisab Technologies", url: "https://www.hisabtech.com/about" }],
  creator: "Hisab Technologies",
  publisher: "Hisab Technologies",
  alternates: { canonical: "/", languages: { "en-ET": "/", "am-ET": "/" } },
  openGraph: {
    type: "website",
    locale: "en_ET",
    alternateLocale: ["am_ET"],
    siteName: "HisabTech",
    title: "HisabERP — Business Operating System for Ethiopia",
    description: "One connected workspace for sales, finance, inventory, customers, suppliers and reporting.",
    url: "/",
    images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "HisabTech" }],
  },
  twitter: { card: "summary", title: "HisabERP", description: "Business operating system for growing Ethiopian organizations.", images: ["/hisab-logo.svg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: {
    icon: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#DA7757", colorScheme: "light dark" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [cookieStore, user] = await Promise.all([cookies(), getCurrentUserContext()]);
  const saved = cookieStore.get("hisab_locale")?.value;
  const initialLanguage: Language = saved === "am" ? "am" : "en";
  return <html lang={initialLanguage} data-language={initialLanguage} data-theme="light" suppressHydrationWarning><body data-design-system="hisab-v1" data-workspace-system="financial-os-v1"><LanguageProvider initialLanguage={initialLanguage}><AppExperienceProvider><AuthPagePreferences/><WorkspaceShell user={user}>{children}</WorkspaceShell></AppExperienceProvider></LanguageProvider></body></html>;
}
