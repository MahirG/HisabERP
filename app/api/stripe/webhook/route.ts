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
  const inserted = await admin.from("hisab_billing_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    livemode: Boolean(event.livemode),
    status: "processing",
    payload: event,
  });
  if (!inserted.error) return "process" as const;
  if (inserted.error.code !== "23505") throw new Error(inserted.error.message);

  const existing = await admin.from("hisab_billing_webhook_events").select("status,attempts").eq("stripe_event_id", event.id).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data?.status === "processed" || existing.data?.status === "processing") return "duplicate" as const;

  const retried = await admin.from("hisab_billing_webhook_events").update({
    status: "processing",
    attempts: Number(existing.data?.attempts || 1) + 1,
    error_message: null,
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", event.id);
  if (retried.error) throw new Error(retried.error.message);
  return "process" as const;
}

async function completeEvent(eventId: string) {
  const admin = createAdminClient();
  await admin.from("hisab_billing_webhook_events").update({
    status: "processed",
    processed_at: new Date().toISOString(),
    error_message: null,
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", eventId);
}

async function failEvent(eventId: string, error: unknown) {
  const admin = createAdminClient();
  await admin.from("hisab_billing_webhook_events").update({
    status: "failed",
    error_message: (error instanceof Error ? error.message : "Webhook processing failed.").slice(0, 1000),
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", eventId);
}

async function processEvent(event: ReturnType<typeof parseVerifiedStripeEvent>) {
  const object = asRecord(event.data.object);
  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const sessionId = stringValue(object.id);
    const userId = typeof object.client_reference_id === "string" ? object.client_reference_id : String(asRecord(object.metadata).hisab_user_id || "");
    const customerId = stringValue(object.customer);
    const subscriptionId = stringValue(object.subscription);
    if (!sessionId || !userId || !customerId || !subscriptionId) throw new Error("Completed Checkout Session is missing trusted identifiers.");

    const checkout = await admin.from("hisab_billing_checkout_sessions").update({
      status: "complete",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("stripe_session_id", sessionId).eq("user_id", userId);
    if (checkout.error) throw new Error(checkout.error.message);

    const customerDetails = asRecord(object.customer_details);
    const customer = await admin.from("hisab_billing_customers").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      email: typeof customerDetails.email === "string" ? customerDetails.email : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (customer.error) throw new Error(customer.error.message);

    await syncSubscription(await retrieveStripeSubscription(subscriptionId), event.id);
    return;
  }

  if (event.type === "checkout.session.expired") {
    const sessionId = stringValue(object.id);
    if (sessionId) {
      const result = await admin.from("hisab_billing_checkout_sessions").update({ status: "expired", updated_at: new Date().toISOString() }).eq("stripe_session_id", sessionId);
      if (result.error) throw new Error(result.error.message);
    }
    return;
  }

  if (event.type.startsWith("customer.subscription.")) {
    await syncSubscription(object as unknown as StripeSubscription, event.id);
    return;
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const subscriptionId = invoiceSubscriptionId(object);
    if (!subscriptionId) return;
    await syncSubscription(await retrieveStripeSubscription(subscriptionId), event.id);
    const invoiceStatus = event.type === "invoice.paid" ? "paid" : "payment_failed";
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
