import { NextResponse } from "next/server";
import { verifyInvoicePayment } from "../../../../../lib/payments/invoices";
export const dynamic="force-dynamic";
export async function GET(request:Request) {
  const url=new URL(request.url);const ref=url.searchParams.get("tx_ref")||"";const merchant=url.searchParams.get("merchant")||"";
  if(!/^invoice-\d{10,16}-[a-f0-9]{12}$/.test(ref)||!/^[a-f0-9-]{36}$/i.test(merchant)) return NextResponse.json({error:"Invalid reference."},{status:400});
  try {await verifyInvoicePayment(ref,merchant);return NextResponse.json({received:true},{headers:{"Cache-Control":"no-store"}});}
  catch{return NextResponse.json({error:"Verification pending."},{status:503});}
}
export const POST=GET;
