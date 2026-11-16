import { NextResponse, type NextRequest } from "next/server";
import { isValidHisabTxRef, verifyAndApplyChapaPayment } from "../../../../lib/chapa/settlement";
import { currentPaidPeriod } from "../../../../lib/payments/access";
import { billingGrantsAccess } from "../../../../lib/data/billing";
import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const txRef = request.nextUrl.searchParams.get("tx_ref")?.trim() || "";
  if (!isValidHisabTxRef(txRef)) return NextResponse.json({ error: "Invalid transaction reference." }, { status: 400 });

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let attempt = await supabase
    .from("hisab_billing_payment_attempts")
    .select("status,plan_code,billing_cycle,amount_etb,currency,chapa_reference,verified_at,mode,last_checked_at")
    .eq("tx_ref", txRef)
    .eq("user_id", userId)
    .maybeSingle();
  if (attempt.error) return NextResponse.json({ error: "Payment status is unavailable." }, { status: 503 });
  if (!attempt.data) return NextResponse.json({ error: "Payment reference not found." }, { status: 404 });

  if (["creating", "open", "pending"].includes(String(attempt.data.status)) && (!attempt.data.last_checked_at || Date.now()-Date.parse(attempt.data.last_checked_at)>30_000)) {
    await verifyAndApplyChapaPayment(txRef).catch(() => undefined);
    attempt = await supabase
      .from("hisab_billing_payment_attempts")
      .select("status,plan_code,billing_cycle,amount_etb,currency,chapa_reference,verified_at,mode,last_checked_at")
      .eq("tx_ref", txRef)
      .eq("user_id", userId)
      .maybeSingle();
  }

  if (attempt.error || !attempt.data) return NextResponse.json({error:"Payment status unavailable."},{status:503});

  const access = await supabase
    .from("hisab_billing_access")
    .select("status,plan_code,billing_cycle,current_period_start,current_period_end,last_payment_status,last_tx_ref")
    .eq("user_id", userId)
    .maybeSingle();
  if (access.error) return NextResponse.json({ error: "Paid access status is unavailable." }, { status: 503 });

  const periods = await supabase.from("hisab_billing_periods").select("tx_ref,plan_code,starts_at,ends_at,revoked_at").eq("user_id", userId).order("starts_at",{ascending:true});
  if (periods.error) return NextResponse.json({error:"Paid access periods unavailable."},{status:503});
  const current = currentPaidPeriod(periods.data || []);
  const grantsAccess = Boolean(current && billingGrantsAccess("active",current.ends_at));
  const paymentStatus = String(attempt.data?.status || "pending");
  const failed = ["failed", "cancelled", "refunded", "reversed"].includes(paymentStatus);
  const state = paymentStatus === "success" && attempt.data.mode === "test"
    ? "test_verified"
    : grantsAccess && paymentStatus === "success"
    ? "verified"
    : paymentStatus === "success"
      ? "scheduled"
      : failed
        ? "failed"
        : "processing";

  return NextResponse.json({ state, payment: attempt.data, access: access.data }, { headers: { "Cache-Control": "no-store" } });
}
