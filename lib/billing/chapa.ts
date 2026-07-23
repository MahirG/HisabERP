import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const CHAPA_API_BASE = "https://api.chapa.co/v1";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function readSecret() {
  const value = process.env.CHAPA_SECRET_KEY?.trim();
  if (!value) throw new Error("Chapa checkout is not configured.");
  return value;
}

function readWebhookSecret() {
  return process.env.CHAPA_WEBHOOK_SECRET?.trim() || process.env.CHAPA_SECRET_KEY?.trim() || "";
}

export type ChapaPaymentCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
};

export type ChapaInitializeInput = {
  amount: number;
  currency: "ETB" | "USD";
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
  title: string;
  description: string;
  customer: ChapaPaymentCustomer;
  invoiceLines: Array<{ key: string; value: string }>;
};

export type ChapaVerification = {
  status: string;
  txRef: string;
  reference: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  mode: string;
  raw: Record<string, unknown>;
};

export function getChapaReadiness() {
  const secret = process.env.CHAPA_SECRET_KEY?.trim() ?? "";
  return {
    configured: Boolean(secret),
    webhookConfigured: Boolean(readWebhookSecret()),
    mode: secret ? (secret.toLowerCase().includes("test") ? "test" : "live") : "unconfigured",
  } as const;
}

export async function initializeChapaPayment(input: ChapaInitializeInput) {
  const secret = readSecret();
  const payload = {
    amount: input.amount.toFixed(2),
    currency: input.currency,
    email: input.customer.email,
    first_name: input.customer.firstName,
    last_name: input.customer.lastName,
    ...(input.customer.phoneNumber ? { phone_number: input.customer.phoneNumber } : {}),
    tx_ref: input.txRef,
    callback_url: input.callbackUrl,
    return_url: input.returnUrl,
    customization: {
      title: input.title,
      description: input.description,
    },
    meta: {
      custom_receipt_enabled: true,
      payment_reason: input.description,
      invoices: input.invoiceLines,
    },
  };

  const response = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const body = asRecord(await response.json().catch(() => ({})));
  const data = asRecord(body.data);
  const checkoutUrl = firstString(data.checkout_url, body.checkout_url);
  const status = firstString(body.status, data.status);
  const message = firstString(body.message, data.message, response.statusText);

  if (!response.ok || !checkoutUrl) {
    throw new Error(message || "Unable to initialize Chapa checkout.");
  }

  return { checkoutUrl, status, raw: body };
}

export async function verifyChapaPayment(txRef: string): Promise<ChapaVerification> {
  const secret = readSecret();
  const response = await fetch(`${CHAPA_API_BASE}/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const body = asRecord(await response.json().catch(() => ({})));
  const data = asRecord(body.data);
  const status = firstString(data.status, body.status).toLowerCase();
  const verifiedTxRef = firstString(data.tx_ref, data.trx_ref, txRef);
  const amount = Number(data.amount ?? 0);

  if (!response.ok || !status) {
    throw new Error(firstString(body.message, data.message, response.statusText) || "Unable to verify Chapa payment.");
  }

  return {
    status,
    txRef: verifiedTxRef,
    reference: firstString(data.reference, data.ref_id),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: firstString(data.currency).toUpperCase(),
    paymentMethod: firstString(data.payment_method, data.method),
    mode: firstString(data.mode),
    raw: body,
  };
}

function safeSignatureEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyChapaWebhookSignature(rawBody: string, headers: Headers) {
  const webhookSecret = readWebhookSecret();
  if (!webhookSecret) return false;

  const payloadSignature = headers.get("x-chapa-signature")?.trim() ?? "";
  const secretSignature = headers.get("chapa-signature")?.trim() ?? "";
  const expectedPayload = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedSecret = createHmac("sha256", webhookSecret).update(webhookSecret).digest("hex");

  return Boolean(
    (payloadSignature && safeSignatureEqual(expectedPayload, payloadSignature))
    || (secretSignature && safeSignatureEqual(expectedSecret, secretSignature)),
  );
}
