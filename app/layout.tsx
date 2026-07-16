import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "../components/language-provider";
import "./font-benaiah-1.css";
import "./font-benaiah-2.css";
import "./font-benaiah-3.css";
import "./fonts.css";
import "./globals.css";
import "./erp-modules.css";
import "./i18n.css";

export const metadata: Metadata = {
  title: "Hisab ERP — Enterprise",
  description: "Hisab ERP — Premium Ethiopian Business Intelligence Suite",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: Readonly<{ children: import("react").ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
