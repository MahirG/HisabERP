import { NextResponse } from "next/server";
import { assertSameOrigin, BillingError, requireBillingManager, updateSubscriptionRenewal } from "../../../../lib/billing/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireBillingManager();
    const body = await request.json() as { action?: unknown };
    if (body.action !== "cancel" && body.action !== "resume") {
      throw new BillingError("Choose cancel or resume.", 400, "invalid_subscription_action");
    }
    const subscription = await updateSubscriptionRenewal(user, body.action);
    return NextResponse.json({ subscription }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("Subscription update failed", error);
    return NextResponse.json({ error: "Unable to update the subscription." }, { status: 500 });
  }
}
