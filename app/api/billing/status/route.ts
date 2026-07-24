import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { subscriptionGrantsAccess } from "../../../../lib/data/billing";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim() || "";
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const checkout = await supabase
    .from("hisab_billing_checkout_sessions")
    .select("status,plan_code,billing_cycle,stripe_subscription_id,completed_at")
    .eq("stripe_session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (checkout.error) return NextResponse.json({ error: "Billing status is unavailable." }, { status: 503 });
  if (!checkout.data) return NextResponse.json({ state: "processing", checkout: null, subscription: null });

  const subscription = await supabase
    .from("hisab_billing_subscriptions")
    .select("status,plan_code,billing_cycle,current_period_end,cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (subscription.error) return NextResponse.json({ error: "Subscription status is unavailable." }, { status: 503 });

  const state = subscriptionGrantsAccess(subscription.data?.status)
    ? "verified"
    : checkout.data.status === "complete"
      ? "activating"
      : checkout.data.status === "expired" || checkout.data.status === "failed"
        ? "failed"
        : "processing";

  return NextResponse.json({
    state,
    checkout: checkout.data,
    subscription: subscription.data,
  }, { headers: { "Cache-Control": "no-store" } });
}
