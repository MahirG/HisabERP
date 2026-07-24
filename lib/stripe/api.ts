import "server-only";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const DEFAULT_STRIPE_API_VERSION = "2026-06-24.dahlia";
const DEFAULT_STRIPE_INTEGRATION_IDENTIFIER = "hisaberp_checkout_qmzktjfw";

type StripeScalar = string | number | boolean | null | undefined;
export type StripeForm = Record<string, StripeScalar>;

export type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  url: string | null;
  status: "open" | "complete" | "expired" | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  customer: string | null;
  customer_email?: string | null;
  subscription: string | null;
  client_reference_id: string | null;
  metadata: Record<string, string>;
};

export type StripePortalSession = {
  id: string;
  object: "billing_portal.session";
  url: string;
};

export type StripeSubscription = {
  id: string;
  object: "subscription";
  customer: string;
  status: string;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  current_period_start?: number;
  current_period_end?: number;
  metadata: Record<string, string>;
  items?: {
    data?: Array<{
      current_period_start?: number;
      current_period_end?: number;
      price?: { currency?: string; unit_amount?: number | null; recurring?: { interval?: string } | null };
    }>;
  };
};

class StripeApiError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "StripeApiError";
    this.status = status;
    this.code = code;
  }
}

function stripeSecretKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  if (!value) throw new Error("Stripe billing is not configured.");
  return value;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

function stripeApiVersion() {
  return process.env.STRIPE_API_VERSION?.trim() || DEFAULT_STRIPE_API_VERSION;
}

function stripeIntegrationIdentifier() {
  const value = process.env.STRIPE_INTEGRATION_IDENTIFIER?.trim() || DEFAULT_STRIPE_INTEGRATION_IDENTIFIER;
  if (!/[a-z]{8}$/.test(value)) {
    throw new Error("STRIPE_INTEGRATION_IDENTIFIER must end with eight lowercase letters.");
  }
  return value;
}

function formBody(values: StripeForm) {
  const body = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    body.append(key, String(value));
  });
  return body;
}

export async function stripeRequest<T>(path: string, options: { method?: "GET" | "POST"; form?: StripeForm; query?: StripeForm; idempotencyKey?: string } = {}) {
  const method = options.method || "GET";
  const url = new URL(`${STRIPE_API_BASE}${path}`);
  if (options.query) {
    const query = formBody(options.query);
    query.forEach((value, key) => url.searchParams.append(key, value));
  }

  const headers = new Headers({
    Authorization: `Bearer ${stripeSecretKey()}`,
    "Stripe-Version": stripeApiVersion(),
  });
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
  if (method === "POST") headers.set("Content-Type", "application/x-www-form-urlencoded");

  const response = await fetch(url, {
    method,
    headers,
    body: method === "POST" ? formBody(options.form || {}) : undefined,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null) as { error?: { message?: string; code?: string } } | T | null;
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload ? payload.error : undefined;
    throw new StripeApiError(error?.message || "Stripe could not complete the request.", response.status, error?.code || null);
  }
  return payload as T;
}

export async function createStripeCheckoutSession(input: {
  userId: string;
  email: string | null;
  customerId: string | null;
  planCode: string;
  planName: string;
  description: string;
  billingCycle: "monthly" | "annual";
  amountMinor: number;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}) {
  const form: StripeForm = {
    mode: "subscription",
    locale: "auto",
    integration_identifier: stripeIntegrationIdentifier(),
    client_reference_id: input.userId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": "etb",
    "line_items[0][price_data][unit_amount]": input.amountMinor,
    "line_items[0][price_data][product_data][name]": `HisabERP ${input.planName}`,
    "line_items[0][price_data][product_data][description]": input.description,
    "line_items[0][price_data][recurring][interval]": input.billingCycle === "annual" ? "year" : "month",
    "metadata[hisab_user_id]": input.userId,
    "metadata[plan_code]": input.planCode,
    "metadata[billing_cycle]": input.billingCycle,
    "subscription_data[metadata][hisab_user_id]": input.userId,
    "subscription_data[metadata][plan_code]": input.planCode,
    "subscription_data[metadata][billing_cycle]": input.billingCycle,
  };
  if (input.customerId) form.customer = input.customerId;
  else if (input.email) form.customer_email = input.email;

  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    method: "POST",
    form,
    idempotencyKey: input.idempotencyKey,
  });
}

export async function createStripePortalSession(customerId: string, returnUrl: string) {
  return stripeRequest<StripePortalSession>("/billing_portal/sessions", {
    method: "POST",
    form: { customer: customerId, return_url: returnUrl },
  });
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    query: { "expand[]": "subscription" },
  });
}

export async function retrieveStripeSubscription(subscriptionId: string) {
  return stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}
