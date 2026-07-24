import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

function parseSignature(header: string) {
  const values = header.split(",").map((part) => part.trim()).filter(Boolean);
  const timestamp = values.find((part) => part.startsWith("t="))?.slice(2) || "";
  const signatures = values.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  return { timestamp, signatures };
}

function constantTimeHexEquals(expectedHex: string, receivedHex: string) {
  if (!/^[a-f0-9]+$/i.test(receivedHex) || expectedHex.length !== receivedHex.length) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Stripe webhook verification is not configured.");
  if (!signatureHeader) throw new Error("Missing Stripe-Signature header.");

  const { timestamp, signatures } = parseSignature(signatureHeader);
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || signatures.length === 0) throw new Error("Invalid Stripe signature header.");

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (age > toleranceSeconds) throw new Error("Stripe webhook timestamp is outside the accepted window.");

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  if (!signatures.some((signature) => constantTimeHexEquals(expected, signature))) {
    throw new Error("Stripe webhook signature is invalid.");
  }
}

export type StripeEvent<T = Record<string, unknown>> = {
  id: string;
  object: "event";
  type: string;
  created: number;
  livemode: boolean;
  data: { object: T };
};

export function parseVerifiedStripeEvent(payload: string, signatureHeader: string | null) {
  verifyStripeWebhookSignature(payload, signatureHeader);
  const event = JSON.parse(payload) as StripeEvent;
  if (!event?.id || event.object !== "event" || !event.type || !event.data?.object) {
    throw new Error("Stripe webhook payload is invalid.");
  }
  return event;
}
