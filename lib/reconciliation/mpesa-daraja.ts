import "server-only";

import { createAdminClient } from "../supabase/admin";
import { getIntegrationSecret, setIntegrationSecret } from "./integration-secrets";

export type DarajaEnvironment = "sandbox" | "production";
export type DarajaEnvironmentChoice = DarajaEnvironment | "auto";

export type DarajaConnectionStatus = {
  configured: boolean;
  environment: DarajaEnvironment | null;
  credentialSource: "vault" | "environment" | "mixed" | "missing";
  callbackTokenConfigured: boolean;
  lastCheck: {
    status: "verified" | "failed";
    environment: DarajaEnvironment;
    checkedAt: string;
    errorMessage: string | null;
  } | null;
};

type TokenResponse = {
  access_token?: unknown;
  expires_in?: unknown;
};

type CachedToken = {
  token: string;
  expiresAt: number;
};

const oauthEndpoints: Record<DarajaEnvironment, string> = {
  sandbox: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  production: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
};

const tokenCache = new Map<string, CachedToken>();

function normalizeEnvironment(value: string): DarajaEnvironment | null {
  return value === "production" || value === "sandbox" ? value : null;
}

function credentialSource(first: string, second: string): DarajaConnectionStatus["credentialSource"] {
  if (first === "missing" || second === "missing") return "missing";
  return first === second ? first as "vault" | "environment" : "mixed";
}

function safeProviderError(status: number) {
  if (status === 401 || status === 403) return "Safaricom rejected the Consumer Key or Consumer Secret.";
  if (status === 429) return "Safaricom temporarily rate-limited the OAuth request.";
  return `Safaricom OAuth returned HTTP ${status}.`;
}

async function requestAccessToken(
  consumerKey: string,
  consumerSecret: string,
  environment: DarajaEnvironment,
) {
  const authorization = Buffer.from(`${consumerKey}:${consumerSecret}`, "utf8").toString("base64");
  let response: Response;
  try {
    response = await fetch(oauthEndpoints[environment], {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authorization}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error(`Unable to reach the Safaricom ${environment} OAuth service.`);
  }

  if (!response.ok) throw new Error(safeProviderError(response.status));

  let payload: TokenResponse;
  try {
    payload = await response.json() as TokenResponse;
  } catch {
    throw new Error("Safaricom OAuth returned an unreadable response.");
  }

  const token = typeof payload.access_token === "string" ? payload.access_token.trim() : "";
  const expiresIn = Number(payload.expires_in);
  if (!token) throw new Error("Safaricom OAuth did not return an access token.");

  return {
    token,
    expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3599,
  };
}

async function recordConnectionCheck(
  organizationId: string,
  userId: string | null,
  environment: DarajaEnvironment,
  status: "verified" | "failed",
  errorMessage: string | null,
) {
  try {
    const admin = createAdminClient();
    await admin.from("integration_connection_checks").insert({
      organization_id: organizationId,
      provider: "safaricom_daraja",
      environment,
      status,
      checked_by: userId,
      error_code: status === "failed" ? "daraja_oauth_failed" : null,
      error_message: errorMessage,
      metadata: { endpoint_host: new URL(oauthEndpoints[environment]).host },
    });
  } catch {
    // Connection validation must not expose credentials or fail solely because audit evidence could not be written.
  }
}

export async function validateDarajaCredentialPair(
  consumerKey: string,
  consumerSecret: string,
  choice: DarajaEnvironmentChoice = "auto",
) {
  const environments: DarajaEnvironment[] = choice === "auto"
    ? ["sandbox", "production"]
    : [choice];
  const failures: string[] = [];

  for (const environment of environments) {
    try {
      const result = await requestAccessToken(consumerKey, consumerSecret, environment);
      return { environment, expiresIn: result.expiresIn };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "Daraja OAuth validation failed.");
    }
  }

  throw new Error(failures.at(-1) || "Daraja OAuth validation failed.");
}

export async function saveAndValidateDarajaCredentials(input: {
  organizationId: string;
  userId: string;
  consumerKey: string;
  consumerSecret: string;
  environment: DarajaEnvironmentChoice;
}) {
  let validation: Awaited<ReturnType<typeof validateDarajaCredentialPair>>;
  try {
    validation = await validateDarajaCredentialPair(
      input.consumerKey,
      input.consumerSecret,
      input.environment,
    );
  } catch (error) {
    const environment = input.environment === "production" ? "production" : "sandbox";
    const message = error instanceof Error ? error.message : "Daraja OAuth validation failed.";
    await recordConnectionCheck(input.organizationId, input.userId, environment, "failed", message);
    throw error;
  }

  await Promise.all([
    setIntegrationSecret(input.organizationId, "consumer_key", input.consumerKey),
    setIntegrationSecret(input.organizationId, "consumer_secret", input.consumerSecret),
    setIntegrationSecret(input.organizationId, "environment", validation.environment),
  ]);
  tokenCache.delete(`${input.organizationId}:${validation.environment}`);
  await recordConnectionCheck(input.organizationId, input.userId, validation.environment, "verified", null);
  return validation;
}

export async function getDarajaConfigurationStatus(
  organizationId: string,
): Promise<DarajaConnectionStatus> {
  try {
    const [key, secret, environmentSecret, callbackToken] = await Promise.all([
      getIntegrationSecret(organizationId, "consumer_key"),
      getIntegrationSecret(organizationId, "consumer_secret"),
      getIntegrationSecret(organizationId, "environment"),
      getIntegrationSecret(organizationId, "callback_token"),
    ]);
    const admin = createAdminClient();
    const { data: lastCheck } = await admin
      .from("integration_connection_checks")
      .select("status,environment,checked_at,error_message")
      .eq("organization_id", organizationId)
      .eq("provider", "safaricom_daraja")
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const environment = normalizeEnvironment(environmentSecret.value);
    return {
      configured: Boolean(key.value && secret.value),
      environment,
      credentialSource: credentialSource(key.source, secret.source),
      callbackTokenConfigured: Boolean(callbackToken.value),
      lastCheck: lastCheck && normalizeEnvironment(String(lastCheck.environment))
        ? {
            status: lastCheck.status === "verified" ? "verified" : "failed",
            environment: normalizeEnvironment(String(lastCheck.environment))!,
            checkedAt: String(lastCheck.checked_at),
            errorMessage: typeof lastCheck.error_message === "string" ? lastCheck.error_message : null,
          }
        : null,
    };
  } catch {
    return {
      configured: false,
      environment: null,
      credentialSource: "missing",
      callbackTokenConfigured: false,
      lastCheck: null,
    };
  }
}

export async function getDarajaAccessToken(
  organizationId: string,
  options: { forceRefresh?: boolean } = {},
) {
  const [key, secret, environmentSecret] = await Promise.all([
    getIntegrationSecret(organizationId, "consumer_key"),
    getIntegrationSecret(organizationId, "consumer_secret"),
    getIntegrationSecret(organizationId, "environment"),
  ]);
  const environment = normalizeEnvironment(environmentSecret.value) || "sandbox";
  if (!key.value || !secret.value) throw new Error("M-Pesa Daraja credentials are not configured.");

  const cacheKey = `${organizationId}:${environment}`;
  const cached = tokenCache.get(cacheKey);
  if (!options.forceRefresh && cached && cached.expiresAt > Date.now() + 60_000) {
    return { accessToken: cached.token, environment, cached: true };
  }

  const result = await requestAccessToken(key.value, secret.value, environment);
  tokenCache.set(cacheKey, {
    token: result.token,
    expiresAt: Date.now() + result.expiresIn * 1000,
  });
  return { accessToken: result.token, environment, cached: false };
}

export async function validateStoredDarajaConnection(organizationId: string, userId: string) {
  try {
    const result = await getDarajaAccessToken(organizationId, { forceRefresh: true });
    await recordConnectionCheck(organizationId, userId, result.environment, "verified", null);
    return result;
  } catch (error) {
    const status = await getDarajaConfigurationStatus(organizationId);
    const environment = status.environment || "sandbox";
    const message = error instanceof Error ? error.message : "Daraja OAuth validation failed.";
    await recordConnectionCheck(organizationId, userId, environment, "failed", message);
    throw error;
  }
}
