import Link from "next/link";
import {notFound} from "next/navigation";
import {createClient} from "../../../../lib/supabase/server";
import {isValidHisabTxRef} from "../../../../lib/chapa/settlement";
import {formatEtb} from "../../../../lib/billing/catalog";
import {PrintReceipt} from "../../../../components/print-receipt";
export const dynamic="force-dynamic";
export const metadata={title:"Payment receipt",robots:{index:false,follow:false}};
export default async function ReceiptPage({params}:{params:Promise<{txRef:string}>}) {
  const {txRef}=await params;if(!isValidHisabTxRef(txRef))notFound();
  const db=await createClient();const {data:claims}=await db.auth.getClaims();
  if(typeof claims?.claims?.sub!=="string")notFound();
  const {data,error}=await db.from("hisab_billing_payment_attempts").select("tx_ref,plan_code,billing_cycle,amount_etb,status,mode,payment_method,chapa_reference,verified_at").eq("user_id",claims.claims.sub).eq("tx_ref",txRef).maybeSingle();
  if(error||!data||!data.verified_at||!["success","refunded","reversed"].includes(data.status))notFound();
  return <main className="pay-receipt"><img src="/hisab-logo.svg" alt="Biloo ERP" width="56" height="56"/><span className="pay-eyebrow">Hisab Technologies · Biloo ERP</span><h1>{data.mode==="test"?"Test payment record":"Payment receipt"}</h1><p>This records the provider-verified payment. It is not a fiscal tax invoice.</p><dl>
    {[['Reference',data.tx_ref],['Provider reference',data.chapa_reference||'—'],['Plan',`${data.plan_code} · ${data.billing_cycle}`],['Amount',`ETB ${formatEtb(Number(data.amount_etb))}`],['Status',data.status],['Environment',data.mode||'Unconfirmed'],['Method',data.payment_method||'Chapa'],['Verified',new Date(data.verified_at).toLocaleString('en-ET',{timeZone:'Africa/Addis_Ababa'})]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
  </dl>{data.mode==="test"?<p>Test transaction. No paid access or real settlement is evidenced by this record.</p>:null}<nav className="pay-alert-actions"><PrintReceipt/><Link href="/billing">Back to billing</Link></nav></main>;
}
