"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { verifyAndApplyChapaPayment } from "../chapa/settlement";
import { requiredText } from "../validation";

export async function requestBillingRefund(form: FormData) {
  const db = await createClient();
  const { error } = await db.rpc("hisab_request_refund", {p_tx_ref:requiredText(form.get("txRef"),"Payment",100),p_reason:requiredText(form.get("reason"),"Reason",1000)});
  if(error) redirect("/billing?error=Refund+request+could+not+be+recorded.+Check+the+payment+and+reason.");
  revalidatePath("/billing");
  redirect("/billing?notice=Refund+requested.+Approval+does+not+mean+funds+have+been+returned.");
}
export async function recheckBillingPayment(form: FormData) {
  const db = await createClient();
  const txRef = requiredText(form.get("txRef"),"Payment",100);
  const {data,error} = await db.from("hisab_billing_payment_attempts").select("tx_ref,last_checked_at").eq("tx_ref",txRef).maybeSingle();
  if(error || !data) redirect("/billing?error=Payment+not+found.");
  if(data.last_checked_at && Date.now()-Date.parse(data.last_checked_at)<30_000) redirect("/billing?notice=Please+wait+30+seconds+between+checks.");
  try { await verifyAndApplyChapaPayment(txRef); }
  catch { redirect("/billing?error=Provider+verification+is+unavailable.+No+payment+status+was+assumed."); }
  revalidatePath("/billing");
  redirect("/billing?notice=Payment+status+checked+directly+with+Chapa.");
}
