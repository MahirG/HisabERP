import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
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
import "./mobile-controls-recovery.css";
import "./mobile-controls-menu.css";
import "./workspace-brand-completion.css";
import "./standard-mobile-header.css";
import "./full-ui-polish.css";
import "./brand-typography-color-lock.css";
import "./sticky-header-lock.css";
import "./surface-uniformity-lock.css";
import "./auth-standard-experience.css";
import "./workspace-theme-visibility.css";
import "./public-dashboard-theme-visibility.css";
import "./public-white-background.css";
import "./mobile-cta-premium.css";
import "./home-imac-showcase.css";
import "./commercial-platform.css";
import "./apple-workspace-redesign.css";
import "./apple-workspace-redesign-fixes.css";
import "./dashboard-color-system.css";
import "./hisab-premium-fintech.css";
import "./apple-editorial-public-system.css";
import "./public-pure-white-background.css";
import "./application-polish.css";
import "./adaptive-theme-contrast.css";
import "./public-theme-coherence.css";
import "./english-light-lock.css";
import "./home-dashboard-imac.css";
import "./zylo-typography-system.css";

const bilooManrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-biloo-manrope",
  preload: true,
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

const preferenceBootstrap = `
(function () {
  var root = document.documentElement;
  var obsoleteControls = '.language-selector,.language-icon-selector,.mobile-language-control,[data-mobile-language],.theme-toggle,.mobile-prehydration-theme-toggle,[data-mobile-theme-toggle],[data-theme-toggle],[aria-label="Theme"],[aria-label="Appearance"],[aria-label="Language"]';

  function persistEnglishLight() {
    if (root.dataset.theme !== 'light') root.dataset.theme = 'light';
    if (root.dataset.language !== 'en') root.dataset.language = 'en';
    if (root.lang !== 'en') root.lang = 'en';
    if (root.style.colorScheme !== 'light') root.style.colorScheme = 'light';

    try {
      window.localStorage.setItem('hisab-theme', 'light');
      window.localStorage.setItem('hisab-erp-language', 'en');
    } catch (_) {}

    document.cookie = 'hisab_theme=light; Path=/; Max-Age=31536000; SameSite=Lax';
    document.cookie = 'hisab_locale=en; Path=/; Max-Age=31536000; SameSite=Lax';
  }

  function removeObsoleteControls() {
    document.querySelectorAll(obsoleteControls).forEach(function (control) {
      control.remove();
    });
  }

  persistEnglishLight();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeObsoleteControls, { once: true });
  } else {
    removeObsoleteControls();
  }

  new MutationObserver(function () {
    persistEnglishLight();
    removeObsoleteControls();
  }).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-language', 'lang'],
    childList: true,
    subtree: true
  });
})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hisabtech.com"),
  title: { default: "Biloo — Business Operating System for Ethiopia", template: "%s | Biloo" },
  description: "Biloo ERP connects sales, finance, inventory, customers, suppliers and reporting for growing Ethiopian businesses.",
  applicationName: "Biloo",
  keywords: ["Biloo ERP", "ERP Ethiopia", "business software Ethiopia", "inventory", "sales", "finance", "accounting workflow"],
  authors: [{ name: "Biloo", url: "https://www.hisabtech.com/about" }],
  creator: "Biloo",
  publisher: "Biloo",
  alternates: { canonical: "/", languages: { "en-ET": "/" } },
  openGraph: {
    type: "website",
    locale: "en_ET",
    siteName: "Biloo",
    title: "Biloo ERP — Business Operating System for Ethiopia",
    description: "One connected workspace for sales, finance, inventory, customers, suppliers and reporting.",
    url: "/",
    images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "Biloo" }],
  },
  twitter: {
    card: "summary",
    title: "Biloo ERP",
    description: "Business operating system for growing Ethiopian organizations.",
    images: ["/hisab-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={bilooManrope.variable} lang="en" data-language="en" data-theme="light" data-brand="biloo" suppressHydrationWarning>
      <head>
        <script src="/biloo-brand-bootstrap.js" />
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
      </head>
      <body data-design-system="hisab-precision-v2" data-workspace-system="financial-os-v1" data-ui-polish="biloo-standard-app-2026">
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
