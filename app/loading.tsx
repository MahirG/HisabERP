"use client";

import { useLanguage } from "../components/language-provider";

const copy = {
  en: ["Preparing your workspace", "Loading secure business data…"],
  am: ["የስራ ቦታዎ እየተዘጋጀ ነው", "የተጠበቀ የንግድ ዳታ እየተጫነ ነው…"],
  ti: ["መስርሕ ስራሕካ ይዳሎ ኣሎ", "ውሑስ ዳታ ንግዲ ይጽዓን ኣሎ…"],
} as const;

export default function Loading() {
  const { language } = useLanguage();
  return (
    <main className="route-loading" role="status" aria-live="polite">
      <div className="experience-loader-card">
        <div className="hisab-orbit-loader" aria-hidden="true"><i /><i /><b>H</b></div>
        <strong>{copy[language][0]}</strong>
        <span>{copy[language][1]}</span>
      </div>
    </main>
  );
}
