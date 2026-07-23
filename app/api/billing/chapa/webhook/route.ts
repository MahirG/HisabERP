import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyChapaWebhookSignature } from "../../../../../lib/billing/chapa";
import { BillingError, completeBillingEvent, recordBillingEvent, verifyAndFinalizeChapaOrder } from "../../../../../lib/billing/server";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyChapaWebhookSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = asRecord(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const nestedData = asRecord(payload.data);
  const txRef = firstString(payload.tx_ref, payload.trx_ref, nestedData.tx_ref, nestedData.trx_ref);
  const eventType = firstString(payload.event, payload.type, nestedData.event, "transaction.updated");
  const providerReference = firstString(payload.reference, payload.ref_id, nestedData.reference, nestedData.ref_id);
  const eventKey = firstString(
    payload.id,
    nestedData.id,
    providerReference && `${eventType}:${providerReference}`,
    txRef && `${eventType}:${txRef}:${firstString(payload.status, nestedData.status)}`,
  ) || `sha256:${createHash("sha256").update(rawBody).digest("hex")}`;

  let event: Awaited<ReturnType<typeof recordBillingEvent>>;
  try {
    event = await recordBillingEvent({ provider: "chapa", eventKey, eventType, txRef: txRef || null, payload });
  } catch (error) {
    console.error("Unable to record Chapa webhook", error);
    return NextResponse.json({ error: "Webhook event could not be recorded." }, { status: 500 });
  }

  if (event.duplicate) return NextResponse.json({ received: true, duplicate: true });
  if (!txRef) {
    await completeBillingEvent(event.id!, "ignored", null, "No transaction reference was supplied.");
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const result = await verifyAndFinalizeChapaOrder(txRef);
    await completeBillingEvent(event.id!, "processed", result.orderId);
    return NextResponse.json({ received: true, status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    await completeBillingEvent(event.id!, "failed", null, message);
    console.error("Chapa webhook processing failed", error);
    const status = error instanceof BillingError ? error.status : 500;
    return NextResponse.json({ error: message }, { status: status >= 500 ? 500 : status });
  }
}
