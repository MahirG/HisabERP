"use server";

import { redirect } from "next/navigation";
import { getBillingPlan, getPlanAmountEtb, getPlanAmountMinor, isBillingCycle } from "../billing/catalog";
import { appConfig } from "../config";
import { subscriptionGrantsAccess } from "../data/billing";
import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { createStripeCheckoutSession, createStripePortalSession, retrieveStripeCheckoutSession } from "../stripe/api";

type CheckoutClaim = {
  claim_state: "claimed" | "reuse" | "busy";
  checkout_token: string | null;
  stripe_session_id: string | null;
};

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

function firstClaim(value: unknown): CheckoutClaim | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  const state = record.claim_state;
  if (state !== "claimed" && state !== "reuse" && state !== "busy") return null;
  return {
    claim_state: state,
    checkout_token: typeof record.checkout_token === "string" ? record.checkout_token : null,
    stripe_session_id: typeof record.stripe_session_id === "string" ? record.stripe_session_id : null,
  };
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

  let claim: CheckoutClaim | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const claimed = await admin.rpc("hisab_claim_checkout_lock", {
      p_user_id: userId,
      p_plan_code: plan.code,
      p_billing_cycle: billingCycle,
    });
    if (claimed.error) checkoutError("Secure checkout could not be reserved. Please try again.", plan.code, billingCycle);
    claim = firstClaim(claimed.data);
    if (!claim) checkoutError("Secure checkout returned an invalid reservation.", plan.code, billingCycle);

    if (claim.claim_state === "claimed") break;
    if (claim.claim_state === "busy") {
      checkoutError("A secure checkout is already being prepared. Refresh in a moment.", plan.code, billingCycle);
    }

    if (!claim.stripe_session_id) checkoutError("The existing checkout reservation is incomplete.", plan.code, billingCycle);
    try {
      const existing = await retrieveStripeCheckoutSession(claim.stripe_session_id);
      if (existing.status === "open" && existing.url) redirect(existing.url);
    } catch {
      // A provider lookup failure must not create a second subscription immediately.
      checkoutError("Your existing checkout is still being verified. Try again shortly.", plan.code, billingCycle);
    }

    await admin
      .from("hisab_billing_checkout_locks")
      .delete()
      .eq("user_id", userId)
      .eq("checkout_token", claim.checkout_token);
    claim = null;
  }

  if (!claim || claim.claim_state !== "claimed" || !claim.checkout_token) {
    checkoutError("Secure checkout could not be claimed. Please try again.", plan.code, billingCycle);
  }

  const customerResult = await admin
    .from("hisab_billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (customerResult.error) checkoutError("Billing is being prepared. Please try again shortly.", plan.code, billingCycle);

  let session: Awaited<ReturnType<typeof createStripeCheckoutSession>> | null = null;
  try {
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
      idempotencyKey: `hisab-checkout-${userId}-${claim.checkout_token}`,
    });
  } catch (error) {
    await admin.from("hisab_billing_checkout_locks").delete().eq("user_id", userId).eq("checkout_token", claim.checkout_token);
    checkoutError(error instanceof Error ? error.message : "Stripe checkout could not start.", plan.code, billingCycle);
  }

  if (!session?.id || !session.url) {
    await admin.from("hisab_billing_checkout_locks").delete().eq("user_id", userId).eq("checkout_token", claim.checkout_token);
    checkoutError("Stripe did not return a secure checkout link.", plan.code, billingCycle);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const insertResult = await admin.from("hisab_billing_checkout_sessions").upsert({
    stripe_session_id: session.id,
    user_id: userId,
    plan_code: plan.code,
    billing_cycle: billingCycle,
    amount_etb: getPlanAmountEtb(plan, billingCycle),
    currency: "ETB",
    status: "open",
    expires_at: expiresAt,
  }, { onConflict: "stripe_session_id" });
  if (insertResult.error) {
    await admin.from("hisab_billing_checkout_locks").delete().eq("user_id", userId).eq("checkout_token", claim.checkout_token);
    checkoutError("Checkout could not be recorded securely. Please try again.", plan.code, billingCycle);
  }

  const attached = await admin.rpc("hisab_attach_checkout_lock", {
    p_user_id: userId,
    p_checkout_token: claim.checkout_token,
    p_stripe_session_id: session.id,
    p_expires_at: expiresAt,
  });
  if (attached.error || attached.data !== true) {
    await admin.from("hisab_billing_checkout_sessions").update({ status: "failed", updated_at: new Date().toISOString() }).eq("stripe_session_id", session.id);
    await admin.from("hisab_billing_checkout_locks").delete().eq("user_id", userId).eq("checkout_token", claim.checkout_token);
    checkoutError("Checkout reservation expired before it could be finalized. Please try again.", plan.code, billingCycle);
  }

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
