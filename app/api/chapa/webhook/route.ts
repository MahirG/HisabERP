import { NextResponse } from "next/server";
import { verifyAndApplyChapaPayment } from "../../../../lib/chapa/settlement";
import { parseVerifiedChapaWebhook } from "../../../../lib/chapa/webhook";
import { configuredMerchant } from "../../../../lib/payments/config";
import { processPaymentEvent } from "../../../../lib/payments/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const merchant = configuredMerchant();
  if (!merchant) return NextResponse.json({ error: "Payments are not enabled." }, { status: 503 });
  const payload = await request.text();
  if (payload.length > 100_000) return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  let event;
  try { event = parseVerifiedChapaWebhook(payload, request.headers, merchant.webhookSecret); }
  catch { return NextResponse.json({ error: "Invalid webhook." }, { status: 400 }); }
  try {
    const result = await processPaymentEvent("subscriptions", payload, event, () => verifyAndApplyChapaPayment(event.tx_ref!));
    return NextResponse.json({ received: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Verification pending; retry delivery." }, { status: 503, headers: { "Retry-After": "30" } }); }
}
