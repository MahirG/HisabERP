import { NextResponse } from "next/server";
import { assertSameOrigin, BillingError, createCheckout, parseCheckoutRequest, requireBillingManager } from "../../../../lib/billing/server";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof BillingError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error("Billing checkout failed", error);
  return NextResponse.json({ error: "Unable to start checkout.", code: "checkout_failed" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireBillingManager();
    const input = parseCheckoutRequest(await request.json());
    const checkout = await createCheckout(user, input);
    return NextResponse.json(checkout, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
