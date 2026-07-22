"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "../components/language-provider";

const copy = {
  en: ["Preparing your workspace", "Loading secure business data…"],
  am: ["የስራ ቦታዎ እየተዘጋጀ ነው", "የተጠበቀ የንግድ ዳታ እየተጫነ ነው…"],
  ti: ["መስርሕ ስራሕካ ይዳሎ ኣሎ", "ውሑስ ዳታ ንግዲ ይጽዓን ኣሎ…"],
} as const;

const publicRoutes = new Set(["/", "/request-demo", "/product-tour", "/ethiopia", "/industries", "/pricing", "/customer-stories", "/trust", "/integrations", "/migration", "/compare", "/help-center", "/resources", "/about"]);
const publicPrefixes = ["/auth/", "/product/", "/industries/", "/compare/", "/help-center/", "/resources/"];

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default function Loading() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [title, description] = copy[language];

  if (isPublicRoute(pathname)) {
    return (
      <div className="public-route-progress" role="status" aria-live="polite" aria-label={description}>
        <span aria-hidden="true" />
        <b className="sr-only">{description}</b>
      </div>
    );
  }

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
