import { isStripeConfigured } from "../stripe/api";
import { createClient } from "../supabase/server";

export type BillingSubscriptionSnapshot = {
  userId: string;
  planCode: string;
  billingCycle: "monthly" | "annual";
  status: string;
  amountEtb: number;
  currency: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  lastInvoiceStatus: string | null;
  updatedAt: string;
};

export type BillingSnapshot = {
  configured: boolean;
  enforcementEnabled: boolean;
  subscription: BillingSubscriptionSnapshot | null;
};

function billingEnforcementEnabled() {
  return process.env.BILLING_ENFORCEMENT_ENABLED?.trim().toLowerCase() === "true";
}

export function subscriptionGrantsAccess(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export async function getCurrentBillingSnapshot(): Promise<BillingSnapshot> {
  const configured = isStripeConfigured();
  const enforcementEnabled = billingEnforcementEnabled();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";
  if (!userId) return { configured, enforcementEnabled, subscription: null };

  const { data, error } = await supabase
    .from("hisab_billing_subscriptions")
    .select("user_id,plan_code,billing_cycle,status,amount_etb,currency,stripe_customer_id,stripe_subscription_id,current_period_start,current_period_end,cancel_at_period_end,last_invoice_status,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return { configured, enforcementEnabled, subscription: null };
  return {
    configured,
    enforcementEnabled,
    subscription: {
      userId: String(data.user_id),
      planCode: String(data.plan_code),
      billingCycle: data.billing_cycle === "annual" ? "annual" : "monthly",
      status: String(data.status),
      amountEtb: Number(data.amount_etb || 0),
      currency: String(data.currency || "ETB"),
      stripeCustomerId: data.stripe_customer_id ? String(data.stripe_customer_id) : null,
      stripeSubscriptionId: data.stripe_subscription_id ? String(data.stripe_subscription_id) : null,
      currentPeriodStart: data.current_period_start ? String(data.current_period_start) : null,
      currentPeriodEnd: data.current_period_end ? String(data.current_period_end) : null,
      cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
      lastInvoiceStatus: data.last_invoice_status ? String(data.last_invoice_status) : null,
      updatedAt: String(data.updated_at),
    },
  };
}
