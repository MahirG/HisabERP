import "server-only";

import { configuredMerchant, type MerchantCredentials } from "../payments/config";
import { safeCheckoutUrl } from "../payments/verification";

const CHAPA_API_BASE = "https://api.chapa.co/v1";

type UnknownRecord = Record<string, unknown>;

export type ChapaInitializeResponse = {
  status?: string;
  message?: string;
  data?: {
    checkout_url?: string;
  } | null;
};

export type ChapaVerificationResponse = {
  status?: string;
  message?: string;
  data?: UnknownRecord | null;
};

function chapaSecretKey(credentials?: MerchantCredentials) {
  const merchant = credentials || configuredMerchant();
  if (!merchant) throw new Error("Chapa checkout is not enabled or configured.");
  return merchant.secretKey;
}

export function isChapaConfigured() {
  return Boolean(configuredMerchant());
}

async function chapaRequest<T>(path: string, options: { method?: "GET" | "POST"; body?: UnknownRecord; credentials?: MerchantCredentials } = {}) {
  const method = options.method || "GET";
  const response = await fetch(`${CHAPA_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${chapaSecretKey(options.credentials)}`,
      Accept: "application/json",
      ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
    },
    body: method === "POST" ? JSON.stringify(options.body || {}) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const payload = await response.json().catch(() => null) as T | { message?: string } | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : "Chapa could not complete the request.";
    throw new Error(message);
  }
  return payload as T;
}

export async function initializeChapaPayment(input: {
  txRef: string;
  amountEtb: number;
  email: string | null;
  userId: string;
  planCode: string;
  planName: string;
  billingCycle: "monthly" | "annual";
  callbackUrl: string;
  returnUrl: string;
  credentials?: MerchantCredentials;
}) {
  const response = await chapaRequest<ChapaInitializeResponse>("/transaction/initialize", {
    method: "POST",
    credentials: input.credentials,
    body: {
      amount: input.amountEtb.toFixed(2),
      currency: "ETB",
      tx_ref: input.txRef,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      ...(input.email ? { email: input.email } : {}),
      customization: {
        title: input.planCode === "invoice" ? "Invoice payment" : `Biloo ${input.planName}`,
        description: input.planCode === "invoice" ? `Invoice ${input.planName}`.slice(0, 100) : `${input.billingCycle === "annual" ? "Annual" : "Monthly"} Biloo ERP access`,
      },
      meta: {
        hisab_user_id: input.userId,
        plan_code: input.planCode,
        billing_cycle: input.billingCycle,
      },
    },
  });

  const checkoutUrl = response.data?.checkout_url?.trim();
  if (response.status?.toLowerCase() !== "success" || !checkoutUrl) {
    throw new Error(response.message || "Chapa did not return a secure checkout link.");
  }
  return { checkoutUrl: safeCheckoutUrl(checkoutUrl), response };
}

export async function verifyChapaTransaction(txRef: string, credentials?: MerchantCredentials) {
  return chapaRequest<ChapaVerificationResponse>(`/transaction/verify/${encodeURIComponent(txRef)}`, { credentials });
}
