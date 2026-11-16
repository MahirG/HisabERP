"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {billingOperator} from "../payments/operator";
import {createAdminClient} from "../supabase/admin";
import {verifyAndApplyChapaPayment} from "../chapa/settlement";
import {requiredText} from "../validation";
export async function decideBillingRefund(form:FormData){
 const actor=await billingOperator();if(!actor)throw new Error("Billing operator with MFA required.");
 const status=form.get("decision");if(status!=="approved"&&status!=="rejected")throw new Error("Invalid decision.");
 const db=createAdminClient();const {error}=await db.from("hisab_billing_refund_requests").update({status,decision_note:requiredText(form.get("note"),"Decision note",1000),decided_by:actor,updated_at:new Date().toISOString()}).eq("id",requiredText(form.get("id"),"Request",80)).eq("status","requested");
 if(error)throw new Error("Decision could not be saved.");
 revalidatePath("/billing/operations");redirect("/billing/operations?notice=Decision+recorded.+No+funds+were+moved.+An+approved+refund+must+be+executed+in+the+merchant+dashboard+and+verified.");
}
export async function operatorRecheckPayment(form:FormData){
 if(!await billingOperator())throw new Error("Billing operator with MFA required.");
 try{await verifyAndApplyChapaPayment(requiredText(form.get("txRef"),"Payment",100));}
 catch{redirect("/billing/operations?notice=Verification+unavailable.+No+status+was+assumed.");}
 revalidatePath("/billing/operations");redirect("/billing/operations?notice=Payment+verified+directly+with+Chapa.");
}
