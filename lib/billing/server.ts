import "server-only";

import { randomUUID } from "node:crypto";
import type { UserContext } from "../data/types";
import { getCurrentUserContext } from "../data/context";
import { appConfig } from "../config";
import { createAdminClient } from "../supabase/admin";
import type { BillingInterval } from "../marketing-pricing";
import { getChapaReadiness, initializeChapaPayment, verifyChapaPayment } from "./chapa";

export type BillingProvider = "chapa" | "bank_transfer";

export class BillingError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "billing_error") {
    super(message);
    this.name = "BillingError";
    this.status = status;
    this.code = code;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "HisabTech",
    lastName: parts.slice(1).join(" ") || "Customer",
  };
}

export function normalizeEthiopianPhone(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (/^(09|07)\d{8}$/.test(digits)) return digits;
  if (/^251(9|7)\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  return null;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = new URL(appConfig.appUrl).origin;
  if (origin !== expected) throw new BillingError("The billing request origin could not be verified.", 403, "invalid_origin");
}

export async function requireBillingManager() {
  const user = await getCurrentUserContext();
  if (!user) throw new BillingError("Sign in to manage billing.", 401, "authentication_required");
  if (user.role !== "owner" && user.role !== "admin") {
    throw new BillingError("Only an organization owner or administrator can change billing.", 403, "billing_permission_required");
  }
  if (user.mfaRequired && user.aal !== "aal2") {
    throw new BillingError("Verify administrator MFA before changing billing.", 403, "mfa_required");
  }
  return user;
}

function parseInterval(value: unknown): BillingInterval {
  if (value === "monthly" || value === "quarterly" || value === "annual") return value;
  throw new BillingError("Choose a valid billing interval.", 400, "invalid_billing_interval");
}

function parseProvider(value: unknown): BillingProvider {
  if (value === "chapa" || value === "bank_transfer") return value;
  throw new BillingError("Choose a supported payment method.", 400, "invalid_payment_provider");
}

export type CheckoutRequest = {
  plan: string;
  interval: BillingInterval;
  provider: BillingProvider;
  phone?: string | null;
};

export function parseCheckoutRequest(value: unknown): CheckoutRequest {
  const record = asRecord(value);
  const plan = firstString(record.plan).toLowerCase();
  if (!/^[a-z0-9-]{2,40}$/.test(plan)) throw new BillingError("Choose a valid HisabERP plan.", 400, "invalid_plan");
  return {
    plan,
    interval: parseInterval(record.interval),
    provider: parseProvider(record.provider),
    phone: firstString(record.phone) || null,
  };
}

type PlanRecord = {
  id: string;
  slug: string;
  name: string;
  audience: string;
  description: string;
  trial_days: number;
  limits: Record<string, unknown>;
  features: unknown[];
};

type PriceRecord = {
  id: string;
  billing_interval: BillingInterval;
  interval_months: number;
  currency: string;
  amount: number | string;
};

type BillingSettingsRecord = {
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_country_code: string;
  seller_tin: string | null;
  vat_registered: boolean;
  vat_number: string | null;
  tax_label: string;
  tax_rate_bps: number;
  grace_days: number;
  bank_transfer_instructions: string;
};

async function getPlanAndPrice(planSlug: string, interval: BillingInterval) {
  const admin = createAdminClient();
  const { data: planData, error: planError } = await admin
    .from("billing_plans")
    .select("id,slug,name,audience,description,trial_days,limits,features")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle();

  if (planError) throw new BillingError("Unable to load the billing plan.", 500, "plan_lookup_failed");
  if (!planData || planData.slug === "enterprise") {
    throw new BillingError("This plan requires a commercial quotation.", 400, "custom_plan_required");
  }

  const { data: priceData, error: priceError } = await admin
    .from("billing_plan_prices")
    .select("id,billing_interval,interval_months,currency,amount")
    .eq("plan_id", planData.id)
    .eq("billing_interval", interval)
    .eq("currency", "ETB")
    .eq("is_active", true)
    .maybeSingle();

  if (priceError || !priceData) throw new BillingError("The selected plan price is unavailable.", 500, "price_lookup_failed");
  return { plan: planData as PlanRecord, price: priceData as PriceRecord };
}

async function getBillingSettings() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("billing_settings")
    .select("seller_name,seller_email,seller_phone,seller_country_code,seller_tin,vat_registered,vat_number,tax_label,tax_rate_bps,grace_days,bank_transfer_instructions")
    .eq("singleton", true)
    .maybeSingle();
  if (error || !data) throw new BillingError("Billing settings are unavailable.", 500, "billing_settings_unavailable");
  return data as BillingSettingsRecord;
}

async function getOrganizationCustomer(user: UserContext, submittedPhone?: string | null) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("name,phone,tin,vat_number,country_code,base_currency")
    .eq("id", user.organizationId)
    .maybeSingle();
  if (error || !data) throw new BillingError("The organization profile is unavailable.", 500, "organization_lookup_failed");
  return {
    name: firstString(user.fullName, data.name, "HisabTech customer"),
    email: firstString(user.email),
    phone: normalizeEthiopianPhone(submittedPhone) ?? normalizeEthiopianPhone(data.phone),
    organizationName: firstString(data.name, user.organizationName),
    tin: firstString(data.tin) || null,
    vatNumber: firstString(data.vat_number) || null,
    countryCode: firstString(data.country_code, "ET"),
  };
}

function buildTxRef(planSlug: string) {
  return `HIS-${planSlug.toUpperCase().slice(0, 8)}-${Date.now().toString(36).toUpperCase()}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function calculateTotals(amount: number, settings: BillingSettingsRecord) {
  const subtotal = Math.round(amount * 100) / 100;
  const taxAmount = settings.vat_registered
    ? Math.round(subtotal * settings.tax_rate_bps) / 10000
    : 0;
  return {
    subtotal,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round((subtotal + taxAmount) * 100) / 100,
  };
}

export async function createCheckout(user: UserContext, request: CheckoutRequest) {
  const admin = createAdminClient();
  const [{ plan, price }, settings, customer] = await Promise.all([
    getPlanAndPrice(request.plan, request.interval),
    getBillingSettings(),
    getOrganizationCustomer(user, request.phone),
  ]);

  if (!customer.email) throw new BillingError("Add a verified email address before checkout.", 400, "customer_email_required");
  const priceAmount = Number(price.amount);
  if (!Number.isFinite(priceAmount) || priceAmount <= 0) throw new BillingError("The selected price is invalid.", 500, "invalid_stored_price");
  const totals = calculateTotals(priceAmount, settings);
  const txRef = buildTxRef(plan.slug);

  const { data: existingSubscription } = await admin
    .from("billing_subscriptions")
    .select("id,status,plan_id,billing_interval,current_period_end")
    .eq("organization_id", user.organizationId)
    .maybeSingle();

  const orderPayload = {
    organization_id: user.organizationId,
    subscription_id: existingSubscription?.id ?? null,
    plan_id: plan.id,
    billing_interval: request.interval,
    provider: request.provider,
    status: "created",
    tx_ref: txRef,
    currency: String(price.currency || "ETB").toUpperCase(),
    subtotal: totals.subtotal,
    tax_amount: totals.taxAmount,
    total_amount: totals.totalAmount,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    created_by: user.userId,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    metadata: {
      plan_slug: plan.slug,
      plan_name: plan.name,
      organization_name: customer.organizationName,
      organization_tin: customer.tin,
      organization_vat_number: customer.vatNumber,
      interval_months: price.interval_months,
      tax_label: settings.tax_label,
      tax_rate_bps: settings.vat_registered ? settings.tax_rate_bps : 0,
    },
  };

  const { data: order, error: orderError } = await admin
    .from("billing_payment_orders")
    .insert(orderPayload)
    .select("id,tx_ref,status,total_amount,currency")
    .single();
  if (orderError || !order) throw new BillingError("Unable to create the billing order.", 500, "order_creation_failed");

  if (request.provider === "bank_transfer") {
    const { data: channels, error: channelsError } = await admin
      .from("billing_payment_channels")
      .select("slug,display_name,description,currency,account_name,account_number,instructions")
      .eq("kind", "bank_transfer")
      .eq("is_enabled", true)
      .order("sort_order");
    if (channelsError) throw new BillingError("Bank-transfer channels are unavailable.", 500, "bank_channels_unavailable");

    await admin.from("billing_payment_orders").update({ status: "pending" }).eq("id", order.id);
    return {
      provider: "bank_transfer" as const,
      orderId: String(order.id),
      txRef: String(order.tx_ref),
      amount: totals.totalAmount,
      currency: String(order.currency),
      instructions: settings.bank_transfer_instructions,
      channels: channels ?? [],
    };
  }

  const readiness = getChapaReadiness();
  if (!readiness.configured) {
    await admin.from("billing_payment_orders").update({
      status: "configuration_required",
      failure_reason: "Chapa merchant credentials are not configured.",
    }).eq("id", order.id);
    throw new BillingError("Secure digital checkout is awaiting merchant activation. Bank transfer remains available.", 503, "provider_configuration_required");
  }

  const names = splitName(customer.name);
  try {
    const initialized = await initializeChapaPayment({
      amount: totals.totalAmount,
      currency: String(order.currency).toUpperCase() === "USD" ? "USD" : "ETB",
      txRef,
      callbackUrl: `${appConfig.appUrl}/api/billing/chapa/callback`,
      returnUrl: `${appConfig.appUrl}/billing?payment=return&tx_ref=${encodeURIComponent(txRef)}`,
      title: `${plan.name} subscription`,
      description: `${plan.name} — ${request.interval} HisabERP subscription`,
      customer: {
        email: customer.email,
        firstName: names.firstName,
        lastName: names.lastName,
        phoneNumber: customer.phone,
      },
      invoiceLines: [
        { key: "Plan", value: plan.name },
        { key: "Billing", value: request.interval },
        { key: "Organization", value: customer.organizationName },
      ],
    });

    const { error: updateError } = await admin.from("billing_payment_orders").update({
      status: "pending",
      checkout_url: initialized.checkoutUrl,
      provider_payload: initialized.raw,
    }).eq("id", order.id);
    if (updateError) throw new Error("Unable to store checkout state.");

    return {
      provider: "chapa" as const,
      orderId: String(order.id),
      txRef,
      checkoutUrl: initialized.checkoutUrl,
      amount: totals.totalAmount,
      currency: String(order.currency),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize digital checkout.";
    await admin.from("billing_payment_orders").update({ status: "failed", failure_reason: message }).eq("id", order.id);
    throw new BillingError(message, 502, "checkout_initialization_failed");
  }
}

function normalizeChapaStatus(status: string) {
  const value = status.trim().toLowerCase();
  if (["success", "successful", "paid", "completed"].includes(value)) return "success";
  if (["pending", "processing", "initiated"].includes(value)) return "pending";
  if (["cancelled", "canceled"].includes(value)) return "cancelled";
  return "failed";
}

export async function verifyAndFinalizeChapaOrder(txRef: string) {
  if (!txRef || txRef.length > 160) throw new BillingError("A valid transaction reference is required.", 400, "invalid_transaction_reference");
  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("billing_payment_orders")
    .select("id,tx_ref,status,total_amount,currency,provider")
    .eq("tx_ref", txRef)
    .eq("provider", "chapa")
    .maybeSingle();
  if (orderError || !order) throw new BillingError("The payment order was not found.", 404, "payment_order_not_found");
  if (order.status === "paid") return { status: "paid", orderId: String(order.id), idempotent: true };

  const verification = await verifyChapaPayment(txRef);
  const normalizedStatus = normalizeChapaStatus(verification.status);

  if (normalizedStatus === "success") {
    const { data, error } = await admin.rpc("billing_finalize_order", {
      p_order_id: order.id,
      p_provider_reference: verification.reference,
      p_payment_method: verification.paymentMethod,
      p_verified_amount: verification.amount,
      p_verified_currency: verification.currency,
      p_provider_payload: verification.raw,
    });
    if (error) throw new BillingError(error.message || "Unable to activate the subscription.", 500, "subscription_activation_failed");
    return { status: "paid", orderId: String(order.id), fulfillment: data };
  }

  const targetStatus = normalizedStatus === "pending" ? "pending" : normalizedStatus === "cancelled" ? "cancelled" : "failed";
  const { error } = await admin.rpc("billing_mark_order_state", {
    p_order_id: order.id,
    p_status: targetStatus,
    p_reason: targetStatus === "failed" ? `Chapa verification returned ${verification.status}.` : null,
    p_provider_reference: verification.reference,
    p_provider_payload: verification.raw,
  });
  if (error) throw new BillingError("Unable to update the payment state.", 500, "payment_state_update_failed");
  return { status: targetStatus, orderId: String(order.id) };
}

export async function recordBillingEvent(input: {
  provider: string;
  eventKey: string;
  eventType: string;
  txRef?: string | null;
  payload: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("billing_events").insert({
    provider: input.provider,
    event_key: input.eventKey,
    event_type: input.eventType,
    tx_ref: input.txRef ?? null,
    payload: input.payload,
    processing_status: "received",
  }).select("id").single();
  if (error?.code === "23505") return { duplicate: true as const, id: null };
  if (error || !data) throw new BillingError("Unable to record the payment event.", 500, "event_record_failed");
  return { duplicate: false as const, id: Number(data.id) };
}

export async function completeBillingEvent(id: number, status: "processed" | "ignored" | "failed", orderId?: string | null, errorMessage?: string | null) {
  const admin = createAdminClient();
  await admin.from("billing_events").update({
    processing_status: status,
    payment_order_id: orderId ?? null,
    error_message: errorMessage ?? null,
    processed_at: new Date().toISOString(),
  }).eq("id", id);
}

export async function getBillingOverview(user: UserContext) {
  const admin = createAdminClient();
  const [subscriptionResult, ordersResult, invoicesResult, notificationsResult, channelsResult] = await Promise.all([
    admin.from("billing_subscriptions")
      .select("id,status,billing_interval,trial_started_at,trial_ends_at,current_period_start,current_period_end,grace_ends_at,cancel_at_period_end,cancelled_at,provider,billing_plans(slug,name,audience,description,features,limits)")
      .eq("organization_id", user.organizationId)
      .maybeSingle(),
    admin.from("billing_payment_orders")
      .select("id,tx_ref,status,provider,currency,subtotal,tax_amount,total_amount,paid_at,failure_reason,payment_method,created_at,billing_interval,billing_plans(slug,name)")
      .eq("organization_id", user.organizationId)
      .order("created_at", { ascending: false })
      .limit(12),
    admin.from("billing_invoices")
      .select("id,invoice_number,status,currency,subtotal,tax_amount,total_amount,issued_at,due_at,paid_at,period_start,period_end,provider,provider_reference,billing_plans(slug,name)")
      .eq("organization_id", user.organizationId)
      .order("issued_at", { ascending: false })
      .limit(12),
    admin.from("billing_notifications")
      .select("id,notification_type,title,body,due_at,read_at,created_at")
      .eq("organization_id", user.organizationId)
      .order("created_at", { ascending: false })
      .limit(12),
    admin.from("billing_payment_channels")
      .select("slug,provider,kind,display_name,description,currency,account_name,account_number,instructions,metadata")
      .eq("is_enabled", true)
      .order("sort_order"),
  ]);

  const firstError = [subscriptionResult.error, ordersResult.error, invoicesResult.error, notificationsResult.error, channelsResult.error].find(Boolean);
  if (firstError) throw new BillingError("Unable to load billing information.", 500, "billing_overview_failed");

  return {
    subscription: subscriptionResult.data,
    orders: ordersResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    notifications: notificationsResult.data ?? [],
    channels: channelsResult.data ?? [],
    provider: getChapaReadiness(),
  };
}

export async function updateSubscriptionRenewal(user: UserContext, action: "cancel" | "resume") {
  const admin = createAdminClient();
  const { data, error } = await admin.from("billing_subscriptions").update({
    cancel_at_period_end: action === "cancel",
    cancelled_at: action === "cancel" ? new Date().toISOString() : null,
  }).eq("organization_id", user.organizationId).select("id,status,cancel_at_period_end,current_period_end").maybeSingle();
  if (error || !data) throw new BillingError("Unable to update subscription renewal.", 500, "subscription_update_failed");
  return data;
}

export async function getPublicProviderStatus() {
  const admin = createAdminClient();
  const readiness = getChapaReadiness();
  const { count, error } = await admin.from("billing_payment_channels")
    .select("slug", { count: "exact", head: true })
    .eq("kind", "bank_transfer")
    .eq("is_enabled", true);
  return {
    digitalCheckout: {
      provider: "Chapa",
      configured: readiness.configured,
      webhookConfigured: readiness.webhookConfigured,
      mode: readiness.mode,
      supportedMethods: ["Telebirr", "M-PESA", "CBE Birr", "AwashBirr", "Coopay-Ebirr", "PayPal", "credit/debit card"],
    },
    bankTransfer: {
      enabled: !error && Number(count ?? 0) > 0,
      channelCount: error ? 0 : Number(count ?? 0),
    },
    activation: readiness.configured && readiness.webhookConfigured ? "ready" : "configuration_required",
  } as const;
}
