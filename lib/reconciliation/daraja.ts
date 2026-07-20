import "server-only";

type DarajaEnvironment = "sandbox" | "production";

type DarajaOAuthPayload = {
  access_token?: unknown;
  expires_in?: unknown;
  errorCode?: unknown;
  errorMessage?: unknown;
  error?: unknown;
  error_description?: unknown;
};

export type DarajaConnectionResult = {
  connected: boolean;
  configured: boolean;
  environment: DarajaEnvironment;
  expiresInSeconds: number | null;
  checkedAt: string;
  message: string;
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

function environment(): DarajaEnvironment {
  return clean(process.env.MPESA_DARAJA_ENV).toLowerCase() === "production" ? "production" : "sandbox";
}

function baseUrl(target: DarajaEnvironment) {
  return target === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

function credentials() {
  const consumerKey = clean(process.env.MPESA_CONSUMER_KEY);
  const consumerSecret = clean(process.env.MPESA_CONSUMER_SECRET);
  return { consumerKey, consumerSecret, configured: Boolean(consumerKey && consumerSecret) };
}

function firstMessage(payload: DarajaOAuthPayload) {
  const candidates = [payload.errorMessage, payload.error_description, payload.error, payload.errorCode];
  const message = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return message?.trim() || "Daraja rejected the OAuth credentials.";
}

function expiry(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

export function getDarajaConfiguration() {
  const target = environment();
  const { configured } = credentials();
  return { configured, environment: target };
}

export async function validateDarajaConnection(): Promise<DarajaConnectionResult> {
  const target = environment();
  const { consumerKey, consumerSecret, configured } = credentials();
  const checkedAt = new Date().toISOString();

  if (!configured) {
    return {
      connected: false,
      configured: false,
      environment: target,
      expiresInSeconds: null,
      checkedAt,
      message: "Daraja Consumer Key and Consumer Secret are not configured on the server.",
    };
  }

  const authorization = Buffer.from(`${consumerKey}:${consumerSecret}`, "utf8").toString("base64");
  const response = await fetch(`${baseUrl(target)}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  let payload: DarajaOAuthPayload = {};
  try {
    payload = await response.json() as DarajaOAuthPayload;
  } catch {
    payload = {};
  }

  const hasToken = typeof payload.access_token === "string" && payload.access_token.length > 0;
  if (!response.ok || !hasToken) {
    return {
      connected: false,
      configured: true,
      environment: target,
      expiresInSeconds: null,
      checkedAt,
      message: firstMessage(payload),
    };
  }

  return {
    connected: true,
    configured: true,
    environment: target,
    expiresInSeconds: expiry(payload.expires_in),
    checkedAt,
    message: "Daraja OAuth authentication succeeded.",
  };
}
