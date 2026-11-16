import {timingSafeEqual} from "node:crypto";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {verifyAndApplyChapaPayment} from "../../../../lib/chapa/settlement";
import {verifyInvoicePayment} from "../../../../lib/payments/invoices";
import {paymentsEnabled} from "../../../../lib/payments/config";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(request:Request){
 const secret=process.env.CRON_SECRET?.trim();const token=request.headers.get("authorization")||"";
 const expected=secret?`Bearer ${secret}`:"";
 const receivedBytes=Buffer.from(token);const expectedBytes=Buffer.from(expected);
 if(!expected||receivedBytes.length!==expectedBytes.length||!timingSafeEqual(receivedBytes,expectedBytes))return Response.json({error:"Unauthorized."},{status:401});
 if(!paymentsEnabled())return Response.json({skipped:true,reason:"Payments disabled"},{headers:{"Cache-Control":"no-store"}});
 const db=createAdminClient();const before=new Date(Date.now()-60_000).toISOString();
 const [subscriptions,invoices]=await Promise.all([
 db.from("hisab_billing_payment_attempts").select("tx_ref").in("status",["creating","open","pending","success"]).or(`last_checked_at.is.null,last_checked_at.lt.${before}`).order("last_checked_at",{ascending:true,nullsFirst:true}).limit(2),
 db.from("invoice_payment_attempts").select("tx_ref,organization_id").in("status",["creating","open","pending","success"]).or(`last_checked_at.is.null,last_checked_at.lt.${before}`).order("last_checked_at",{ascending:true,nullsFirst:true}).limit(2),
 ]);
 if(subscriptions.error||invoices.error)return Response.json({error:"Payment ledger unavailable."},{status:503});
 const work=[...(subscriptions.data||[]).map(p=>verifyAndApplyChapaPayment(p.tx_ref)),...(invoices.data||[]).map(p=>verifyInvoicePayment(p.tx_ref,p.organization_id))];
 const result=await Promise.allSettled(work);
 return Response.json({checked:result.length,verified:result.filter(r=>r.status==="fulfilled").length,retry:result.filter(r=>r.status==="rejected").length},{headers:{"Cache-Control":"no-store"}});
}
