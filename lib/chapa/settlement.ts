import "server-only";

import { getBillingPlan, isBillingCycle } from "../billing/catalog";
import { createAdminClient } from "../supabase/admin";
import { verifyChapaTransaction } from "./api";
import { configuredMerchant, paymentMode } from "../payments/config";
import { validatePayment } from "../payments/verification";

type UnknownRecord = Record<string, unknown>;

export type ChapaSettlementState = "success" | "pending" | "failed" | "cancelled" | "refunded" | "reversed";

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : value === null || value === undefined ? "" : String(value).trim();
}

export function isValidHisabTxRef(value: string) {
  return /^hisab-[0-9]{10,16}-[a-f0-9]{12}$/i.test(value);
}

export async function verifyAndApplyChapaPayment(txRef: string) {
  if (!isValidHisabTxRef(txRef)) throw new Error("Invalid Hisab payment reference.");

  const admin = createAdminClient();
  const attemptResult = await admin
    .from("hisab_billing_payment_attempts")
    .select("tx_ref,user_id,plan_code,billing_cycle,amount_etb,currency,status,chapa_reference,mode,payment_method")
    .eq("tx_ref", txRef)
    .maybeSingle();
  if (attemptResult.error) throw new Error(attemptResult.error.message);
  if (!attemptResult.data) throw new Error("Unknown Hisab payment reference.");

  const attempt = attemptResult.data;


  const plan = getBillingPlan(attempt.plan_code);
  const billingCycle = isBillingCycle(attempt.billing_cycle) ? attempt.billing_cycle : null;
  if (!plan || !billingCycle) throw new Error("The stored Hisab payment plan is invalid.");

  const credentials = configuredMerchant();
  if (!credentials) throw new Error("Chapa is not enabled or configured.");
  const checked = await admin.from("hisab_billing_payment_attempts").update({ last_checked_at: new Date().toISOString() }).eq("tx_ref", txRef)
    .or(`last_checked_at.is.null,last_checked_at.lt.${new Date(Date.now()-20_000).toISOString()}`).select("tx_ref");
  if (checked.error) throw new Error("Payment verification is unavailable.");
  if (!checked.data?.length) throw new Error("Please wait before verifying this payment again.");
  const response = await verifyChapaTransaction(txRef, credentials);
  const data = asRecord(response.data);
  const status = validatePayment(data, { txRef, amount: attempt.amount_etb, mode: paymentMode() });

  if (status === "pending") {
    const pending = await admin.from("hisab_billing_payment_attempts").update({
      status: "pending",
      chapa_reference: text(data.reference) || null,
      mode: text(data.mode) || null,
      payment_method: text(data.payment_method || data.paymentMethod) || null,
      updated_at: new Date().toISOString(),
    }).eq("tx_ref", txRef).in("status", ["creating", "open", "pending"]);
    if (pending.error) throw new Error(pending.error.message);
    return { state: attempt.status === "success" ? "success" as const : "pending" as const };
  }

  const applied = await admin.rpc("hisab_apply_chapa_transaction", {
    p_tx_ref: txRef,
    p_status: status,
    p_chapa_reference: text(data.reference) || null,
    p_mode: text(data.mode) || null,
    p_payment_method: text(data.payment_method || data.paymentMethod) || null,
  });
  if (applied.error) throw new Error(applied.error.message);

  return { state: status, disposition: applied.data };
}
