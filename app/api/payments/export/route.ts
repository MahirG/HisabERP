import {can,getCurrentUserContext} from "../../../../lib/data/context";
import {createClient} from "../../../../lib/supabase/server";
import {paymentCsv} from "../../../../lib/payments/csv";
export const dynamic="force-dynamic";
export async function GET(){
 const ctx=await getCurrentUserContext();
 if(!ctx||!can(ctx,"manage_finance"))return Response.json({error:"Finance permission required."},{status:403});
 const db=await createClient();const {data,error}=await db.from("invoice_payment_attempts").select("tx_ref,invoice_id,amount_etb,status,mode,payment_id,created_at,verified_at,posted_at").eq("organization_id",ctx.organizationId).order("created_at",{ascending:false}).limit(1000);
 if(error)return Response.json({error:"Export unavailable."},{status:503});
 return new Response(paymentCsv([["Reference","Invoice","ETB","Status","Mode","Receipt ID","Created","Verified","Posted"],...(data||[]).map(p=>[p.tx_ref,p.invoice_id,p.amount_etb,p.status,p.mode,p.payment_id,p.created_at,p.verified_at,p.posted_at])]),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=biloo-invoice-collections.csv","Cache-Control":"no-store","X-Export-Limit":"1000"}});
}
