import { NextResponse } from "next/server";
import { getBillingPlan, getPlanAmountEtb, isBillingCycle } from "../../../../lib/billing/catalog";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { retrieveStripeSubscription, type StripeSubscription } from "../../../../lib/stripe/api";
import { parseVerifiedStripeEvent } from "../../../../lib/stripe/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  return typeof record.id === "string" ? record.id : null;
}

function timestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
}

function subscriptionPeriod(subscription: StripeSubscription) {
  const firstItem = subscription.items?.data?.[0];
  return {
    start: timestamp(subscription.current_period_start ?? firstItem?.current_period_start),
    end: timestamp(subscription.current_period_end ?? firstItem?.current_period_end),
  };
}

function invoiceSubscriptionId(invoice: UnknownRecord) {
  const direct = stringValue(invoice.subscription);
  if (direct) return direct;
  const parent = asRecord(invoice.parent);
  const details = asRecord(parent.subscription_details);
  return stringValue(details.subscription);
}

async function syncSubscription(subscription: StripeSubscription, eventId: string) {
  const metadata = subscription.metadata || {};
  const userId = metadata.hisab_user_id;
  const plan = getBillingPlan(metadata.plan_code);
  const billingCycle = isBillingCycle(metadata.billing_cycle) ? metadata.billing_cycle : null;
  if (!userId || !plan || !billingCycle) throw new Error("Stripe subscription metadata is incomplete.");

  const period = subscriptionPeriod(subscription);
  const admin = createAdminClient();
  const customerId = stringValue(subscription.customer);
  if (!customerId) throw new Error("Stripe subscription does not include a customer.");

  const customer = await admin.from("hisab_billing_customers").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (customer.error) throw new Error(customer.error.message);

  const result = await admin.from("hisab_billing_subscriptions").upsert({
    user_id: userId,
    plan_code: plan.code,
    billing_cycle: billingCycle,
    amount_etb: getPlanAmountEtb(plan, billingCycle),
    currency: "ETB",
    provider: "stripe",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: timestamp(subscription.canceled_at),
    last_event_id: eventId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (result.error) throw new Error(result.error.message);
}

async function beginEvent(event: ReturnType<typeof parseVerifiedStripeEvent>) {
  const admin = createAdminClient();
  const claim = await admin.rpc("hisab_claim_stripe_webhook_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_livemode: Boolean(event.livemode),
    p_payload: event,
    p_lease_seconds: 300,
  });
  if (claim.error) throw new Error(claim.error.message);
  if (claim.data === "process") return "process" as const;
  if (claim.data === "duplicate") return "duplicate" as const;
  throw new Error("Stripe webhook claim returned an invalid state.");
}

async function completeEvent(eventId: string) {
  const admin = createAdminClient();
  const result = await admin.from("hisab_billing_webhook_events").update({
    status: "processed",
    processed_at: new Date().toISOString(),
    error_message: null,
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", eventId).eq("status", "processing");
  if (result.error) throw new Error(result.error.message);
}

async function failEvent(eventId: string, error: unknown) {
  const admin = createAdminClient();
  const result = await admin.from("hisab_billing_webhook_events").update({
    status: "failed",
    error_message: (error instanceof Error ? error.message : "Webhook processing failed.").slice(0, 1000),
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", eventId).eq("status", "processing");
  if (result.error) throw new Error(result.error.message);
}

async function releaseCheckoutLock(sessionId: string) {
  const admin = createAdminClient();
  const released = await admin.from("hisab_billing_checkout_locks").delete().eq("stripe_session_id", sessionId);
  if (released.error) throw new Error(released.error.message);
}

async function completeCheckout(object: UnknownRecord, eventId: string) {
  const sessionId = stringValue(object.id);
  const userId = typeof object.client_reference_id === "string"
    ? object.client_reference_id
    : String(asRecord(object.metadata).hisab_user_id || "");
  const customerId = stringValue(object.customer);
  const subscriptionId = stringValue(object.subscription);
  if (!sessionId || !userId || !customerId || !subscriptionId) {
    throw new Error("Completed Checkout Session is missing trusted identifiers.");
  }

  const admin = createAdminClient();
  const checkout = await admin.from("hisab_billing_checkout_sessions").update({
    status: "complete",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("stripe_session_id", sessionId).eq("user_id", userId).select("stripe_session_id").maybeSingle();
  if (checkout.error) throw new Error(checkout.error.message);
  if (!checkout.data) throw new Error("Stripe Checkout Session is not registered for this Hisab user.");

  const customerDetails = asRecord(object.customer_details);
  const customer = await admin.from("hisab_billing_customers").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    email: typeof customerDetails.email === "string" ? customerDetails.email : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (customer.error) throw new Error(customer.error.message);

  await syncSubscription(await retrieveStripeSubscription(subscriptionId), eventId);
  await releaseCheckoutLock(sessionId);
}

async function markCheckout(object: UnknownRecord, status: "failed" | "expired") {
  const sessionId = stringValue(object.id);
  if (!sessionId) return;
  const admin = createAdminClient();
  const result = await admin.from("hisab_billing_checkout_sessions").update({
    status,
    updated_at: new Date().toISOString(),
  }).eq("stripe_session_id", sessionId);
  if (result.error) throw new Error(result.error.message);
  await releaseCheckoutLock(sessionId);
}

async function processEvent(event: ReturnType<typeof parseVerifiedStripeEvent>) {
  const object = asRecord(event.data.object);

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await completeCheckout(object, event.id);
    return;
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await markCheckout(object, "failed");
    return;
  }

  if (event.type === "checkout.session.expired") {
    await markCheckout(object, "expired");
    return;
  }

  if (event.type.startsWith("customer.subscription.")) {
    const subscriptionId = stringValue(object.id);
    if (!subscriptionId) throw new Error("Stripe subscription event is missing its subscription ID.");
    await syncSubscription(await retrieveStripeSubscription(subscriptionId), event.id);
    return;
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed") {
    const subscriptionId = invoiceSubscriptionId(object);
    if (!subscriptionId) return;
    await syncSubscription(await retrieveStripeSubscription(subscriptionId), event.id);
    const invoiceStatus = event.type === "invoice.payment_failed" ? "payment_failed" : "paid";
    const admin = createAdminClient();
    const result = await admin.from("hisab_billing_subscriptions").update({
      last_invoice_status: invoiceStatus,
      last_event_id: event.id,
      updated_at: new Date().toISOString(),
    }).eq("stripe_subscription_id", subscriptionId);
    if (result.error) throw new Error(result.error.message);
  }
}

export async function POST(request: Request) {
  const payload = await request.text();
  let event: ReturnType<typeof parseVerifiedStripeEvent>;
  try {
    event = parseVerifiedStripeEvent(payload, request.headers.get("stripe-signature"));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook." }, { status: 400 });
  }

  try {
    const disposition = await beginEvent(event);
    if (disposition === "duplicate") return NextResponse.json({ received: true, duplicate: true });
    await processEvent(event);
    await completeEvent(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    await failEvent(event.id, error).catch(() => undefined);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
