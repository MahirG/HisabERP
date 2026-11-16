"use server";
import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { can, getCurrentUserContext } from "../data/context";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { getInvoicePaymentLink, paymentTokenHash, verifyInvoicePayment } from "../payments/invoices";
import { configuredMerchant } from "../payments/config";
import { initializeChapaPayment } from "../chapa/api";
import { appConfig } from "../config";
import { minorUnits, safeCheckoutUrl } from "../payments/verification";
import { requiredText } from "../validation";

async function paymentContext(finance = false) {
  const ctx = await getCurrentUserContext({ required: true });
  if (!ctx || !(finance ? can(ctx,"manage_finance") : can(ctx,"manage_sales"))) throw new Error("Payment management permission required.");
  return ctx;
}
function finish(message: string): never {
  revalidatePath("/payments"); revalidatePath("/sales"); revalidatePath("/finance");
  redirect(`/payments?notice=${encodeURIComponent(message)}`);
}
export async function savePaymentConnection(form: FormData) {
  const ctx = await paymentContext(true); const db = await createClient();
  const { error } = await db.rpc("save_payment_connection", {p_org:ctx.organizationId,p_label:requiredText(form.get("label"),"Merchant name",120),p_mode:form.get("mode")==="live"?"live":"test",p_enabled:form.get("enabled")==="on",p_account:requiredText(form.get("account"),"Settlement account",80)});
  if(error) finish("Settings could not be saved. Check the settlement account and permissions.");
  finish("Merchant settings saved. Checkout also requires server credentials and payment activation.");
}
export async function createInvoicePaymentLink(form: FormData) {
  const ctx = await paymentContext(); const db = await createClient();
  const amount = minorUnits(form.get("amount"))/100; const token = randomBytes(32).toString("hex");
  const days = Math.min(30,Math.max(1,Number(form.get("days"))||7));
  const {error} = await db.rpc("create_invoice_payment_link",{p_org:ctx.organizationId,p_invoice:requiredText(form.get("invoice"),"Invoice",80),p_amount:amount,p_hash:paymentTokenHash(token),p_expires:new Date(Date.now()+days*86_400_000).toISOString()});
  if(error) finish("Link could not be created. Check merchant settings and the open invoice balance.");
  // Raw bearer tokens are returned only once, never stored or placed in dashboard query strings.
  redirect(`/pay/${token}`);
}
export async function revokeInvoicePaymentLink(form: FormData) {
  const ctx = await paymentContext(); const db = await createClient();
  const {error}=await db.rpc("revoke_invoice_payment_link",{p_org:ctx.organizationId,p_link:requiredText(form.get("linkId"),"Link",80)});
  if(error) finish("Link could not be revoked.");
  finish("Payment link revoked. Previously initiated payments will still be verified.");
}
export async function postInvoiceCollection(form: FormData) {
  const ctx = await paymentContext(true); const db = await createClient();
  const {data,error}=await db.rpc("post_verified_invoice_payment",{p_org:ctx.organizationId,p_tx_ref:requiredText(form.get("txRef"),"Payment",100)});
  if(error) finish("Collection was not posted. Verify its live status and resolve any changed invoice balance in reconciliation.");
  finish(`Receipt ${String(data)} posted. Reconcile provider settlement and fees separately.`);
}
export async function recheckInvoiceCollection(form: FormData) {
  const ctx = await paymentContext(true);
  try { await verifyInvoicePayment(requiredText(form.get("txRef"),"Payment",100),ctx.organizationId); }
  catch { finish("Provider verification is unavailable. No status was assumed."); }
  finish("Payment checked directly with the business merchant account.");
}
export async function startInvoiceCheckout(form: FormData) {
  const token=requiredText(form.get("token"),"Payment link",64);
  const details=await getInvoicePaymentLink(token);
  if(!details?.configured || !details.available) redirect(`/pay/${token}?state=unavailable`);
  const credentials=configuredMerchant(details.link.organization_id,details.link.mode)!;
  const db=createAdminClient();
  const txRef=`invoice-${Date.now()}-${randomUUID().replaceAll("-","").slice(0,12)}`;
  const {data,error}=await db.rpc("reserve_invoice_checkout",{p_hash:paymentTokenHash(token),p_tx_ref:txRef});
  if(error || !data) redirect(`/pay/${token}?state=unavailable`);
  const attempt=data as {tx_ref:string;checkout_url?:string;newly_created?:boolean};
  if(!attempt.newly_created) {
    if(attempt.checkout_url) redirect(safeCheckoutUrl(attempt.checkout_url));
    redirect(`/pay/${token}?state=processing`);
  }
  let url="";
  try {
    const result=await initializeChapaPayment({txRef,amountEtb:Number(details.link.amount_etb),email:null,userId:"",planCode:"invoice",planName:details.invoice.invoice_number,billingCycle:"monthly",credentials,
      callbackUrl:`${appConfig.appUrl}/api/payments/chapa/callback?tx_ref=${txRef}&merchant=${details.link.organization_id}`,
      returnUrl:`${appConfig.appUrl}/pay/${token}`});
    url=result.checkoutUrl;
    const updated=await db.from("invoice_payment_attempts").update({checkout_url:url,status:"open",updated_at:new Date().toISOString()}).eq("tx_ref",txRef).eq("status","creating");
    if(updated.error) throw new Error("Could not record checkout");
  } catch {
    await db.from("invoice_payment_attempts").update({status:"pending",updated_at:new Date().toISOString()}).eq("tx_ref",txRef).eq("status","creating");
    redirect(`/pay/${token}?state=processing`);
  }
  redirect(url);
}
export async function refreshInvoicePayment(form: FormData) {
  const token=requiredText(form.get("token"),"Payment link",64);
  const details=await getInvoicePaymentLink(token);
  if(details?.attempt) {
    try { await verifyInvoicePayment(details.attempt.tx_ref,details.link.organization_id); }
    catch { redirect(`/pay/${token}?state=processing`); }
  }
  revalidatePath(`/pay/${token}`);
  redirect(`/pay/${token}`);
}

export async function reverseInvoiceCollection(form: FormData) {
 const ctx=await paymentContext(true);const db=await createClient();
 const {error}=await db.rpc("reverse_verified_invoice_payment",{p_org:ctx.organizationId,p_tx_ref:requiredText(form.get("txRef"),"Payment",100),p_reason:requiredText(form.get("reason"),"Reason",1000)});
 if(error)finish("Reversal was not posted. Confirm provider refund status and inspect the original receipt.");
 finish("Reversal journal posted. Original receipt and provider evidence are preserved.");
}
