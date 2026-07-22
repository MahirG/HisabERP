"use client";

import { useLanguage } from "../components/language-provider";

const copy = {
  en: ["Preparing your workspace", "Loading secure business data…"],
  am: ["የስራ ቦታዎ እየተዘጋጀ ነው", "የተጠበቀ የንግድ ዳታ እየተጫነ ነው…"],
  ti: ["መስርሕ ስራሕካ ይዳሎ ኣሎ", "ውሑስ ዳታ ንግዲ ይጽዓን ኣሎ…"],
} as const;

export default function Loading() {
  const { language } = useLanguage();
  const [title, description] = copy[language];

  return (
    <main className="route-loading brand-route-loading" role="status" aria-live="polite" aria-atomic="true">
      <div className="experience-loader-card brand-loader-card">
        <div className="brand-loader-mark" aria-hidden="true">
          <span className="brand-loader-ring" />
          <span className="brand-loader-logo-shell">
            <img src="/hisab-logo.svg" alt="" width="48" height="48" decoding="async" />
          </span>
        </div>
        <div className="brand-loader-copy">
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
        <div className="brand-loader-progress" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
