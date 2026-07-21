function normalizeUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

function isLocalUrl(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

// These values are public browser configuration, not privileged secrets.
// Vercel environment variables still take precedence and can be rotated independently.
const defaultSupabaseUrl = "https://amwpbnczylbarqqcprev.supabase.co";
const defaultSupabasePublishableKey = "sb_publishable_Vqc0cqRem0xIFPT1-oqXIw_aQxSJSIO";

const configuredAppUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
const vercelProductionUrl = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const vercelDeploymentUrl = normalizeUrl(process.env.VERCEL_URL);

function resolveAppUrl() {
  if (configuredAppUrl && (!isLocalUrl(configuredAppUrl) || !vercelProductionUrl)) {
    return configuredAppUrl;
  }
  return vercelProductionUrl || vercelDeploymentUrl || configuredAppUrl || "http://localhost:3000";
}

export const appConfig = {
  name: "Hisab ERP",
  defaultLocale: "en" as const,
  supportedLocales: ["en", "am", "ti"] as const,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || defaultSupabaseUrl,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || defaultSupabasePublishableKey,
  appUrl: resolveAppUrl(),
};

export function isSupabaseConfigured() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseKey);
}
