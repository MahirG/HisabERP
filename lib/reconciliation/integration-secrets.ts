import "server-only";

import { createAdminClient } from "../supabase/admin";

export type IntegrationSecretKey = "consumer_key" | "consumer_secret" | "environment" | "callback_token";

const provider = "safaricom_daraja" as const;
const environmentFallbacks: Partial<Record<IntegrationSecretKey, string | undefined>> = {
  consumer_key: process.env.MPESA_CONSUMER_KEY,
  consumer_secret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_DARAJA_ENV,
  callback_token: process.env.MPESA_CALLBACK_TOKEN,
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function getIntegrationSecret(organizationId: string, key: IntegrationSecretKey) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("get_server_integration_secret", {
      p_organization_id: organizationId,
      p_provider: provider,
      p_key: key,
    });
    if (error) throw new Error(error.message);
    const stored = clean(data);
    if (stored) return { value: stored, source: "vault" as const };
  } catch (error) {
    const fallback = clean(environmentFallbacks[key]);
    if (fallback) return { value: fallback, source: "environment" as const };
    if (error instanceof Error && !/not configured/i.test(error.message)) throw error;
  }

  const fallback = clean(environmentFallbacks[key]);
  return fallback
    ? { value: fallback, source: "environment" as const }
    : { value: "", source: "missing" as const };
}

export async function setIntegrationSecret(
  organizationId: string,
  key: IntegrationSecretKey,
  value: string,
) {
  const normalized = value.trim();
  if (!normalized) throw new Error("Integration secret value is required.");
  const admin = createAdminClient();
  const { error } = await admin.rpc("upsert_server_integration_secret", {
    p_organization_id: organizationId,
    p_provider: provider,
    p_key: key,
    p_value: normalized,
  });
  if (error) throw new Error(error.message);
}
