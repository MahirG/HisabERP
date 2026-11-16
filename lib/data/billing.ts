import { currentPaidPeriod } from "../payments/access";
import { isChapaConfigured } from "../chapa/api";
import { createClient } from "../supabase/server";

export type BillingAccessSnapshot = {
  userId: string;
  planCode: string;
  billingCycle: "monthly" | "annual";
  status: string;
  amountEtb: number;
  currency: string;
  provider: "chapa";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  lastTxRef: string;
  lastPaymentStatus: string;
  updatedAt: string;
};

export type BillingSnapshot = {
  configured: boolean;
  enforcementEnabled: boolean;
  signedIn: boolean;
  readError: boolean;
  access: BillingAccessSnapshot | null;
};

function billingEnforcementEnabled() {
  return process.env.BILLING_ENFORCEMENT_ENABLED?.trim().toLowerCase() === "true";
}

export function billingGrantsAccess(status: string | null | undefined, currentPeriodEnd?: string | null) {
  if (status !== "active" || !currentPeriodEnd) return false;
  const end = new Date(currentPeriodEnd).getTime();
  return Number.isFinite(end) && end > Date.now();
}

export async function getCurrentBillingSnapshot(): Promise<BillingSnapshot> {
  const configured = isChapaConfigured();
  const enforcementEnabled = billingEnforcementEnabled();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";
  if (!userId) return { configured, enforcementEnabled, signedIn: false, readError: false, access: null };

  const { data, error } = await supabase
    .from("hisab_billing_access")
    .select("user_id,plan_code,billing_cycle,status,amount_etb,currency,provider,current_period_start,current_period_end,last_tx_ref,last_payment_status,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { configured, enforcementEnabled, signedIn: true, readError: true, access: null };
  if (!data) return { configured, enforcementEnabled, signedIn: true, readError: false, access: null };
  const periods = await supabase.from("hisab_billing_periods").select("tx_ref,plan_code,starts_at,ends_at,revoked_at").eq("user_id", userId).order("starts_at", { ascending: true });
  const current = periods.error ? null : currentPaidPeriod(periods.data || []);
  if (!periods.error && !current) return { configured, enforcementEnabled, signedIn: true, readError: false, access: null };
  const currentAttempt = current ? await supabase.from("hisab_billing_payment_attempts").select("billing_cycle,amount_etb,tx_ref,updated_at").eq("tx_ref",current.tx_ref).eq("user_id",userId).maybeSingle() : null;
  if (currentAttempt?.error) return { configured, enforcementEnabled, signedIn: true, readError: true, access: null };
  return {
    configured,
    enforcementEnabled,
    signedIn: true,
    readError: false,
    access: {
      userId: String(data.user_id),
      planCode: current?.plan_code || String(data.plan_code),
      billingCycle: (currentAttempt?.data?.billing_cycle || data.billing_cycle) === "annual" ? "annual" : "monthly",
      status: current ? "active" : String(data.status),
      amountEtb: Number(currentAttempt?.data?.amount_etb || data.amount_etb || 0),
      currency: String(data.currency || "ETB"),
      provider: "chapa",
      currentPeriodStart: current?.starts_at || String(data.current_period_start),
      currentPeriodEnd: current?.ends_at || String(data.current_period_end),
      lastTxRef: current?.tx_ref || String(data.last_tx_ref),
      lastPaymentStatus: String(data.last_payment_status),
      updatedAt: String(data.updated_at),
    },
  };
}
