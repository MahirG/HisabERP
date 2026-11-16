import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createAdminClient } from "../supabase/admin";

export async function processPaymentEvent(scope: string, rawPayload: string, event: Record<string, unknown>, apply: () => Promise<unknown>) {
  const admin = createAdminClient();
  const key = createHash("sha256").update(`${scope}:${rawPayload}`).digest("hex");
  const lease = randomUUID();
  const claim = await admin.rpc("hisab_claim_payment_event", {
    p_key: key, p_type: String(event.event || "payment"), p_tx_ref: String(event.tx_ref || ""),
    p_mode: typeof event.mode === "string" ? event.mode : null, p_payload: event, p_lease: lease,
  });
  if (claim.error) throw new Error("Payment inbox is unavailable.");
  if (claim.data === "processed") return { duplicate: true };
  if (claim.data !== "claimed") throw new Error("Payment processing is already in progress. Retry delivery.");
  try {
    const result = await apply();
    const completed = await admin.rpc("hisab_finish_payment_event", { p_key: key, p_lease: lease, p_error: null });
    if (completed.error || !completed.data) throw new Error("Payment inbox acknowledgement failed.");
    return { result };
  } catch (error) {
    await admin.rpc("hisab_finish_payment_event", { p_key: key, p_lease: lease, p_error: "Verification or settlement failed. Retry server verification." });
    throw error;
  }
}
