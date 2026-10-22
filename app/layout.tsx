import { SITE_URL } from "../lib/seo";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppExperienceProvider } from "../components/app-experience-provider";
import { AuthPagePreferences } from "../components/auth-page-preferences";
import { LanguageProvider } from "../components/language-provider";
import { MarketingExperienceController } from "../components/marketing-experience-controller";
import { WorkspaceShell } from "../components/workspace-shell";
import "./public-styles";

const bilooManrope = localFont({
  src: "../public/fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
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
    var publicTheme = window.localStorage.getItem('biloo-public-theme');

    var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
    var language = 'en';

    root.dataset.theme = theme;
    root.dataset.language = language;
    root.lang = language;
    root.style.colorScheme = theme;

    if (publicTheme === 'dark' || publicTheme === 'light') {
      root.dataset.publicTheme = publicTheme;
    }
    root.dataset.publicLanguage = 'en';
    try {
      window.localStorage.setItem('hisab-erp-language', 'en');
      window.localStorage.setItem('biloo-public-language', 'en');
      document.cookie = 'hisab_locale=en; Path=/; Max-Age=31536000; SameSite=Lax';
    } catch (_) {}
  } catch (_) {
    root.dataset.theme = 'light';
    root.dataset.language = 'en';
    root.lang = 'en';
    root.dataset.publicLanguage = 'en';
    root.style.colorScheme = 'light';
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Biloo by Hisab Technologies", template: "%s | Hisab Technologies" },
  description: "Biloo ERP for Ethiopian businesses, by Hisab Technologies.",
  applicationName: "Biloo ERP",
  authors: [{ name: "Hisab Technologies", url: `${SITE_URL}/about` }],
  creator: "Hisab Technologies", publisher: "Hisab Technologies",
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  // Public pages explicitly opt in. Auth and private workspaces inherit noindex.
  robots: { index: false, follow: true },
  icons: { icon: [{ url: "/hisab-logo.svg", type: "image/svg+xml" }], apple: [{ url: "/biloo-apple-icon.png", type: "image/png", sizes: "180x180" }] },
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
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
      </head>
      <body data-design-system="hisab-precision-v2" data-workspace-system="financial-os-v1" data-ui-polish="biloo-award-marketing-2026">
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
