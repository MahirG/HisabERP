"use server";

import { isChapaConfigured } from "../chapa/api";
import { paymentMode } from "../payments/config";
import { safeCheckoutUrl } from "../payments/verification";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getBillingPlan, getPlanAmountEtb, isBillingCycle } from "../billing/catalog";
import { initializeChapaPayment } from "../chapa/api";
import { appConfig } from "../config";
import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";

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

export async function createChapaCheckout(formData: FormData) {
  const rawPlan = typeof formData.get("plan") === "string" ? String(formData.get("plan")) : "";
  const rawBilling = typeof formData.get("billing") === "string" ? String(formData.get("billing")) : "";
  const plan = getBillingPlan(rawPlan);
  const billingCycle = isBillingCycle(rawBilling) ? rawBilling : "annual";
  if (!plan) checkoutError("Choose a valid HisabERP plan.", rawPlan, billingCycle);

  const { userId, email } = await authenticatedBillingIdentity();
  const amountEtb = getPlanAmountEtb(plan, billingCycle);
  const txRef = `hisab-${Date.now()}-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const admin = createAdminClient();

  if (!isChapaConfigured()) checkoutError("Payments are not enabled yet.", plan.code, billingCycle);
  const requestKey = String(formData.get("requestKey") || "");
  if (!/^[a-f0-9-]{36}$/i.test(requestKey)) checkoutError("Refresh checkout before trying again.", plan.code, billingCycle);
  const reserved = await admin.rpc("hisab_reserve_checkout", {
    p_user: userId, p_key: requestKey, p_tx_ref: txRef, p_plan: plan.code,
    p_cycle: billingCycle, p_amount: amountEtb, p_mode: paymentMode(),
  });
  if (reserved.error) checkoutError("Review any unfinished payment in Billing before trying again.", plan.code, billingCycle);
  const attempt = reserved.data as { tx_ref: string; checkout_url?: string; newly_created?: boolean };
  if (!attempt.newly_created) {
    if (attempt.checkout_url) redirect(safeCheckoutUrl(attempt.checkout_url));
    redirect(`/billing/success?tx_ref=${encodeURIComponent(attempt.tx_ref)}`);
  }

  let checkoutUrl = "";
  try {
    const initialized = await initializeChapaPayment({
      txRef,
      amountEtb,
      email,
      userId,
      planCode: plan.code,
      planName: plan.name,
      billingCycle,
      callbackUrl: `${appConfig.appUrl}/api/chapa/callback?tx_ref=${encodeURIComponent(txRef)}`,
      returnUrl: `${appConfig.appUrl}/billing/success?tx_ref=${encodeURIComponent(txRef)}`,
    });
    checkoutUrl = initialized.checkoutUrl;

    const updated = await admin.from("hisab_billing_payment_attempts").update({
      status: "open",
      checkout_url: checkoutUrl,
      updated_at: new Date().toISOString(),
    }).eq("tx_ref", txRef).eq("user_id", userId).eq("status", "creating");
    if (updated.error) throw new Error(updated.error.message);
  } catch {
    await admin.from("hisab_billing_payment_attempts").update({
      status: "pending",
      updated_at: new Date().toISOString(),
    }).eq("tx_ref", txRef).eq("user_id", userId).eq("status", "creating");
    checkoutError("Checkout could not be confirmed. Review payment status in Billing before trying again.", plan.code, billingCycle);
  }

  redirect(checkoutUrl);
}
