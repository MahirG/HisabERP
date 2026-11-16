/** Provider-independent verification rules. Monetary values never use float tolerance. */
export type PaymentState = "success" | "pending" | "failed" | "cancelled" | "refunded" | "reversed";
export type PaymentMode = "test" | "live";

export function minorUnits(value: unknown): number {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(text)) throw new Error("Invalid payment amount.");
  const [whole, fraction = ""] = text.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid payment amount.");
  return amount;
}

export function paymentState(value: unknown): PaymentState {
  const status = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["success", "successful", "paid"].includes(status)) return "success";
  if (["failed", "failure"].includes(status)) return "failed";
  if (["cancelled", "canceled"].includes(status)) return "cancelled";
  if (status === "refunded" || status === "reversed") return status;
  return "pending";
}

export function validatePayment(data: Record<string, unknown>, expected: { txRef: string; amount: unknown; mode: PaymentMode }) {
  const verifiedTxRef = data.tx_ref ?? data.txRef ?? data.reference_id;
  const txRef = expected.txRef;
  if (verifiedTxRef !== txRef) throw new Error("Chapa returned a different transaction reference.");
  const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : "";
  if (currency !== "ETB") throw new Error("Chapa returned an unexpected currency.");
  if (minorUnits(data.amount) !== minorUnits(expected.amount)) throw new Error("Chapa returned an unexpected payment amount.");
  if (data.mode !== expected.mode) throw new Error("Chapa returned an unexpected payment mode.");
  // The envelope's success status only means the API request succeeded.
  return paymentState(data.status);
}

export function safeCheckoutUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid checkout address.");
  const url = new URL(value);
  const allowed = ["checkout.chapa.co", "checkout.chapa.global"];
  if (url.protocol !== "https:" || !allowed.includes(url.hostname) || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Chapa returned an unexpected checkout address.");
  }
  return url.toString();
}

export function effectivePaymentState(stored: PaymentState, incoming: PaymentState): PaymentState {
  if (stored === "refunded" || stored === "reversed") return stored;
  if (stored === "success" && !["refunded", "reversed"].includes(incoming)) return stored;
  return incoming;
}
