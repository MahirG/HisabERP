import { NextResponse } from "next/server";
import { configuredMerchant } from "../../../../../lib/payments/config";
import { parseVerifiedChapaWebhook } from "../../../../../lib/chapa/webhook";
import { processPaymentEvent } from "../../../../../lib/payments/inbox";
import { verifyInvoicePayment } from "../../../../../lib/payments/invoices";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  const org=new URL(request.url).searchParams.get("merchant")||"";
  if(!/^[a-f0-9-]{36}$/i.test(org)) return NextResponse.json({error:"Invalid merchant."},{status:400});
  // The saved mode is resolved by org; no credentials are selected by request data.
  const {createAdminClient}=await import("../../../../../lib/supabase/admin");
  try {
    const connection=await createAdminClient().from("payment_connections").select("mode").eq("organization_id",org).maybeSingle();
    const merchant=connection.data && configuredMerchant(org,connection.data.mode);
    if(!merchant) return NextResponse.json({error:"Merchant unavailable."},{status:503});
    const raw=await request.text();
    if(raw.length>100_000) return NextResponse.json({error:"Payload too large."},{status:413});
    let event;
    try {event=parseVerifiedChapaWebhook(raw,request.headers,merchant.webhookSecret);}
    catch{return NextResponse.json({error:"Invalid webhook."},{status:400});}
    const result=await processPaymentEvent(`invoice:${org}`,raw,event,()=>verifyInvoicePayment(event.tx_ref!,org));
    return NextResponse.json({received:true,...result},{headers:{"Cache-Control":"no-store"}});
  } catch {return NextResponse.json({error:"Retry verification."},{status:503,headers:{"Retry-After":"30"}});}
}
