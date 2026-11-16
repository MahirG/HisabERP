import "server-only";
import {createClient} from "../supabase/server";
export async function billingOperator(){
 const db=await createClient();const {data}=await db.auth.getClaims();const claims=data?.claims;
 const ids=(process.env.BILLING_ADMIN_USER_IDS||"").split(",").map(s=>s.trim()).filter(Boolean);
 return typeof claims?.sub==="string"&&claims.aal==="aal2"&&ids.includes(claims.sub)?claims.sub:null;
}
