import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { AuthPagePreferences } from "../components/auth-page-preferences";
import { InternalStyleLoader } from "../components/internal-style-loader";
import { LanguageProvider } from "../components/language-provider";
import { MarketingExperienceController } from "../components/marketing-experience-controller";
import { WorkspaceShell } from "../components/workspace-shell";
import "./marketing-editorial-system.css";

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

  function readCookie(name) {
    var prefix = name + '=';
    var match = document.cookie.split(';').map(function (value) { return value.trim(); }).find(function (value) { return value.indexOf(prefix) === 0; });
    return match ? decodeURIComponent(match.slice(prefix.length)) : '';
  }

  try {
    var storedTheme = window.localStorage.getItem('hisab-theme') || readCookie('hisab_theme');
    var storedLanguage = window.localStorage.getItem('hisab-erp-language') || readCookie('hisab_locale');
    var publicTheme = window.localStorage.getItem('biloo-public-theme');
    var publicLanguage = window.localStorage.getItem('biloo-public-language');

    var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
    var language = storedLanguage === 'am' ? 'am' : 'en';

    root.dataset.theme = theme;
    root.dataset.language = language;
    root.lang = language;
    root.style.colorScheme = theme;

    if (publicTheme === 'dark' || publicTheme === 'light') {
      root.dataset.publicTheme = publicTheme;
    }
    if (publicLanguage === 'am' || publicLanguage === 'en') {
      root.dataset.publicLanguage = publicLanguage;
    }
  } catch (_) {
    root.dataset.theme = 'light';
    root.dataset.language = 'en';
    root.lang = 'en';
    root.style.colorScheme = 'light';
  }
})();`;

const mobileNavigationBootstrap = `
(function () {
  var styleId = 'biloo-mobile-navigation-v4';

  function expandHamburgerBreakpoint() {
    var link = document.getElementById(styleId);
    if (!link || !link.sheet) return;

    try {
      var rules = link.sheet.cssRules;
      for (var index = 0; index < rules.length; index += 1) {
        var rule = rules[index];
        if (!rule.media || !rule.media.mediaText) continue;
        if (rule.media.mediaText.indexOf('max-width: 760px') === -1) continue;
        rule.media.mediaText = '(max-width: 960px)';
      }
    } catch (_) {}
  }

  function initializeNavigationStyles() {
    var link = document.getElementById(styleId);
    if (!link) return;
    link.addEventListener('load', expandHamburgerBreakpoint, { once: true });
    expandHamburgerBreakpoint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigationStyles, { once: true });
  } else {
    initializeNavigationStyles();
  }

  window.addEventListener('pageshow', expandHamburgerBreakpoint);
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
  themeColor: "#14213D",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={bilooManrope.variable} lang="en" data-language="en" data-theme="light" data-brand="biloo" suppressHydrationWarning>
      <head>
        <script src="/biloo-brand-bootstrap.js?v=20260802-4" defer />
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: mobileNavigationBootstrap }} />
      </head>
      <body data-design-system="hisab-precision-v2" data-workspace-system="financial-os-v1" data-ui-polish="biloo-award-marketing-2026">
        <InternalStyleLoader />
        <LanguageProvider initialLanguage="en">
          <AppExperienceProvider>
            <AuthPagePreferences />
            <WorkspaceShell>{children}</WorkspaceShell>
            <MarketingExperienceController />
          </AppExperienceProvider>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
