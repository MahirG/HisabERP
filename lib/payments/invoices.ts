import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "../supabase/admin";
import { configuredMerchant } from "./config";
import { validatePayment } from "./verification";
import { verifyChapaTransaction } from "../chapa/api";

export function paymentTokenHash(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid payment link.");
  return createHash("sha256").update(token).digest("hex");
}

export async function getInvoicePaymentLink(token: string) {
  const admin = createAdminClient();
  const { data: link, error } = await admin.from("invoice_payment_links").select("id,organization_id,invoice_id,amount_etb,mode,expires_at,revoked_at").eq("token_hash", paymentTokenHash(token)).maybeSingle();
  if (error) throw new Error("Payment links are temporarily unavailable.");
  if (!link || link.revoked_at || new Date(link.expires_at).getTime() <= Date.now()) return null;
  const [connection, invoice, organization, attempts] = await Promise.all([
    admin.from("payment_connections").select("merchant_label,mode,enabled").eq("organization_id", link.organization_id).maybeSingle(),
    admin.from("sales_invoice_balance_view").select("invoice_number,outstanding_amount,status").eq("id", link.invoice_id).eq("organization_id", link.organization_id).maybeSingle(),
    admin.from("organizations").select("name").eq("id", link.organization_id).maybeSingle(),
    admin.from("invoice_payment_attempts").select("tx_ref,status,mode,verified_at").eq("link_id", link.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if ([connection, invoice, organization, attempts].some((r) => r.error)) throw new Error("Payment details are temporarily unavailable.");
  if (!connection.data || !invoice.data || !organization.data) return null;
  const paid = Boolean(attempts.data && ["success", "refunded", "reversed"].includes(attempts.data.status));
  const available = !paid && ["posted", "partially_paid"].includes(invoice.data.status) && Number(invoice.data.outstanding_amount) >= Number(link.amount_etb);
  const configured = Boolean(connection.data.enabled && connection.data.mode === link.mode && configuredMerchant(link.organization_id, link.mode));
  return { link, invoice: invoice.data, merchant: organization.data.name, configured, available, attempt: attempts.data };
}

export async function verifyInvoicePayment(txRef: string, organizationId: string) {
  if (!/^invoice-\d{10,16}-[a-f0-9]{12}$/.test(txRef)) throw new Error("Invalid invoice payment reference.");
  const admin = createAdminClient();
  const { data: attempt, error } = await admin.from("invoice_payment_attempts").select("tx_ref,organization_id,amount_etb,mode,status").eq("tx_ref", txRef).eq("organization_id", organizationId).maybeSingle();
  if (error || !attempt) throw new Error("Payment not found.");
  const credentials = configuredMerchant(organizationId, attempt.mode);
  if (!credentials) throw new Error("Merchant payments are not configured.");
  const checked = await admin.from("invoice_payment_attempts").update({last_checked_at:new Date().toISOString()}).eq("tx_ref",txRef)
    .or(`last_checked_at.is.null,last_checked_at.lt.${new Date(Date.now()-20_000).toISOString()}`).select("tx_ref");
  if(checked.error) throw new Error("Verification is unavailable.");
  if(!checked.data?.length) throw new Error("Please wait before verifying this payment again.");
  const response = await verifyChapaTransaction(txRef, credentials);
  const data = response.data || {};
  const status = validatePayment(data, { txRef, amount: attempt.amount_etb, mode: attempt.mode });
  const result = await admin.rpc("apply_invoice_payment", {
    p_tx_ref: txRef, p_status: status, p_reference: typeof data.reference === "string" ? data.reference : null,
    p_mode: attempt.mode, p_method: typeof data.payment_method === "string" ? data.payment_method : null,
  });
  if (result.error) throw new Error("Verified payment could not be recorded.");
  return result.data as string;
}
