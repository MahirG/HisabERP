"use server";

import { redirect } from "next/navigation";
import { getBillingPlan, getPlanAmountEtb, getPlanAmountMinor, isBillingCycle } from "../billing/catalog";
import { appConfig } from "../config";
import { subscriptionGrantsAccess } from "../data/billing";
import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { createStripeCheckoutSession, createStripePortalSession, retrieveStripeCheckoutSession } from "../stripe/api";

function checkoutError(message: string, planCode = "growth", billingCycle = "annual"): never {
  redirect(`/checkout?plan=${encodeURIComponent(planCode)}&billing=${encodeURIComponent(billingCycle)}&error=${encodeURIComponent(message)}`);
}

async function authenticatedBillingIdentity() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (!userId) redirect(`/auth/login?next=${encodeURIComponent("/pricing")}`);
  return { userId, email };
}

export async function createSubscriptionCheckout(formData: FormData) {
  const rawPlan = typeof formData.get("plan") === "string" ? String(formData.get("plan")) : "";
  const rawBilling = typeof formData.get("billing") === "string" ? String(formData.get("billing")) : "";
  const plan = getBillingPlan(rawPlan);
  const billingCycle = isBillingCycle(rawBilling) ? rawBilling : "annual";
  if (!plan) checkoutError("Choose a valid HisabERP plan.", rawPlan, billingCycle);

  const { userId, email } = await authenticatedBillingIdentity();
  const admin = createAdminClient();

  const subscriptionResult = await admin
    .from("hisab_billing_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  if (subscriptionResult.error) checkoutError("Subscription status is temporarily unavailable.", plan.code, billingCycle);
  if (subscriptionGrantsAccess(subscriptionResult.data?.status)) {
    redirect("/billing?notice=Your+HisabERP+subscription+is+already+active.");
  }

  const now = new Date().toISOString();
  const recentCheckout = await admin
    .from("hisab_billing_checkout_sessions")
    .select("stripe_session_id")
    .eq("user_id", userId)
    .eq("plan_code", plan.code)
    .eq("billing_cycle", billingCycle)
    .eq("status", "open")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recentCheckout.error) checkoutError("Checkout status is temporarily unavailable.", plan.code, billingCycle);

  let reusableCheckoutUrl = "";
  if (recentCheckout.data?.stripe_session_id) {
    try {
      const existing = await retrieveStripeCheckoutSession(String(recentCheckout.data.stripe_session_id));
      if (existing.status === "open" && existing.url) reusableCheckoutUrl = existing.url;
      else {
        await admin
          .from("hisab_billing_checkout_sessions")
          .update({ status: existing.status === "complete" ? "complete" : "expired", updated_at: new Date().toISOString() })
          .eq("stripe_session_id", String(recentCheckout.data.stripe_session_id));
      }
    } catch {
      await admin
        .from("hisab_billing_checkout_sessions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", String(recentCheckout.data.stripe_session_id));
    }
  }
  if (reusableCheckoutUrl) redirect(reusableCheckoutUrl);

  const customerResult = await admin
    .from("hisab_billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (customerResult.error) checkoutError("Billing is being prepared. Please try again shortly.", plan.code, billingCycle);

  let session: Awaited<ReturnType<typeof createStripeCheckoutSession>> | null = null;
  try {
    const minuteBucket = Math.floor(Date.now() / 60_000);
    session = await createStripeCheckoutSession({
      userId,
      email,
      customerId: customerResult.data?.stripe_customer_id ? String(customerResult.data.stripe_customer_id) : null,
      planCode: plan.code,
      planName: plan.name,
      description: plan.description,
      billingCycle,
      amountMinor: getPlanAmountMinor(plan, billingCycle),
      successUrl: `${appConfig.appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appConfig.appUrl}/billing/cancelled?plan=${encodeURIComponent(plan.code)}&billing=${encodeURIComponent(billingCycle)}`,
      idempotencyKey: `hisab-checkout-${userId}-${plan.code}-${billingCycle}-${minuteBucket}`,
    });
  } catch (error) {
    checkoutError(error instanceof Error ? error.message : "Stripe checkout could not start.", plan.code, billingCycle);
  }

  if (!session?.id || !session.url) checkoutError("Stripe did not return a secure checkout link.", plan.code, billingCycle);
  const insertResult = await admin.from("hisab_billing_checkout_sessions").upsert({
    stripe_session_id: session.id,
    user_id: userId,
    plan_code: plan.code,
    billing_cycle: billingCycle,
    amount_etb: getPlanAmountEtb(plan, billingCycle),
    currency: "ETB",
    status: "open",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: "stripe_session_id" });
  if (insertResult.error) checkoutError("Checkout could not be recorded securely. Please try again.", plan.code, billingCycle);

  redirect(session.url);
}

export async function openStripeBillingPortal() {
  const { userId } = await authenticatedBillingIdentity();
  const admin = createAdminClient();
  const { data, error } = await admin.from("hisab_billing_customers").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
  if (error || !data?.stripe_customer_id) redirect("/billing?error=No+Stripe+billing+account+is+available+yet.");

  let portalUrl = "";
  try {
    const portal = await createStripePortalSession(String(data.stripe_customer_id), `${appConfig.appUrl}/billing`);
    portalUrl = portal.url;
  } catch (error) {
    redirect(`/billing?error=${encodeURIComponent(error instanceof Error ? error.message : "The billing portal could not open.")}`);
  }
  redirect(portalUrl);
}
