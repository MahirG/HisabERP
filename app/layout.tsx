import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { AuthPagePreferences } from "../components/auth-page-preferences";
import { LanguageProvider } from "../components/language-provider";
import { WorkspaceShell } from "../components/workspace-shell";
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
import "./home-final-recommendations.css";
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
import "./brand-loading.css";
import "./public-route-progress.css";
import "./brand-audit-fixes.css";
import "./brand-final-lock.css";
import "./public-visual-system.css";
import "./global-preferences-icons.css";
import "./brand-hamburger-menu.css";
import "./third-party-brand-colors.css";
import "./mobile-first-paint.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

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
  openGraph: { type: "website", locale: "en_ET", alternateLocale: ["am_ET"], siteName: "HisabTech", title: "HisabERP — Business Operating System for Ethiopia", description: "One connected workspace for sales, finance, inventory, customers, suppliers and reporting.", url: "/", images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "HisabTech" }] },
  twitter: { card: "summary", title: "HisabERP", description: "Business operating system for growing Ethiopian organizations.", images: ["/hisab-logo.svg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }], shortcut: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }], apple: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#000000", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={spaceGrotesk.variable} lang="en" data-language="en" data-theme="light" suppressHydrationWarning>
      <body data-design-system="hisab-v1" data-workspace-system="financial-os-v1">
        <LanguageProvider initialLanguage="en">
          <AppExperienceProvider>
            <AuthPagePreferences />
            <WorkspaceShell>{children}</WorkspaceShell>
          </AppExperienceProvider>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
