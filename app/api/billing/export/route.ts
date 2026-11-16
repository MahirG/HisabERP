import {createClient} from "../../../../lib/supabase/server";
import {paymentCsv} from "../../../../lib/payments/csv";
export const dynamic="force-dynamic";
export async function GET(){
 const db=await createClient();const {data:claims}=await db.auth.getClaims();const user=claims?.claims?.sub;
 if(typeof user!=="string")return Response.json({error:"Authentication required."},{status:401});
 const {data,error}=await db.from("hisab_billing_payment_attempts").select("tx_ref,plan_code,billing_cycle,amount_etb,status,mode,created_at,verified_at").eq("user_id",user).order("created_at",{ascending:false}).limit(1000);
 if(error)return Response.json({error:"Export unavailable."},{status:503});
 return new Response(paymentCsv([["Reference","Plan","Cycle","ETB","Status","Mode","Created","Verified"],...(data||[]).map(p=>[p.tx_ref,p.plan_code,p.billing_cycle,p.amount_etb,p.status,p.mode,p.created_at,p.verified_at])]),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=biloo-subscription-payments.csv","Cache-Control":"no-store","X-Export-Limit":"1000"}});
}
