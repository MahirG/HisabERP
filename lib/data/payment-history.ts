import "server-only";
import { createClient } from "../supabase/server";

export async function getPaymentHistory() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") return { payments: [], refunds: [], periods: [], unavailable: false };
  const [payments, refunds, periods] = await Promise.all([
    supabase.from("hisab_billing_payment_attempts").select("tx_ref,plan_code,billing_cycle,amount_etb,currency,status,mode,payment_method,verified_at,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(100),
    supabase.from("hisab_billing_refund_requests").select("id,tx_ref,status,created_at,decision_note").eq("user_id",userId).order("created_at",{ascending:false}).limit(100),
    supabase.from("hisab_billing_periods").select("tx_ref,plan_code,starts_at,ends_at,revoked_at").eq("user_id",userId).order("starts_at",{ascending:true}).limit(200),
  ]);
  return { payments: payments.data || [], refunds: refunds.data || [], periods: periods.data || [], unavailable: Boolean(payments.error || refunds.error || periods.error) };
}
