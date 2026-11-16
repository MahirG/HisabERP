import "server-only";
import type { PaymentMode } from "./verification";

export type MerchantCredentials = { secretKey: string; webhookSecret: string; mode: PaymentMode };

export function paymentMode(): PaymentMode {
  return process.env.CHAPA_MODE === "live" ? "live" : "test";
}

export function paymentsEnabled() {
  return process.env.CHAPA_PAYMENTS_ENABLED === "true";
}

export function merchantEnvPrefix(organizationId: string) {
  if (!/^[a-f0-9-]{36}$/i.test(organizationId)) throw new Error("Invalid merchant organization.");
  return `CHAPA_ORG_${organizationId.replaceAll("-", "").toUpperCase()}`;
}

export function merchantCredentials(organizationId?: string, mode: PaymentMode = paymentMode()): MerchantCredentials | null {
  const prefix = organizationId ? merchantEnvPrefix(organizationId) : "CHAPA";
  const secretKey = process.env[`${prefix}_SECRET_KEY`]?.trim();
  const webhookSecret = process.env[`${prefix}_WEBHOOK_SECRET`]?.trim();
  if (!secretKey || !webhookSecret) return null;
  // Fail closed on keys that disagree with the configured environment.
  if (mode === "test" && !/TEST/i.test(secretKey)) return null;
  if (mode === "live" && /TEST/i.test(secretKey)) return null;
  return { secretKey, webhookSecret, mode };
}

export function configuredMerchant(organizationId?: string, mode: PaymentMode = paymentMode()) {
  return paymentsEnabled() ? merchantCredentials(organizationId, mode) : null;
}
