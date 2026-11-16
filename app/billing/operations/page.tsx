import {notFound} from "next/navigation";
import Link from "next/link";
import {billingOperator} from "../../../lib/payments/operator";
import {createAdminClient} from "../../../lib/supabase/admin";
import {decideBillingRefund,operatorRecheckPayment} from "../../../lib/actions/billing-operations";
import {isChapaConfigured} from "../../../lib/chapa/api";
export const dynamic="force-dynamic";
export const metadata={title:"Billing operations"};
export default async function BillingOperations({searchParams}:{searchParams:Promise<{notice?:string}>}){
 if(!await billingOperator())notFound();
 const db=createAdminClient();const params=await searchParams;
 const [refunds,events,payments]=await Promise.all([
 db.from("hisab_billing_refund_requests").select("id,tx_ref,reason,status,created_at").order("created_at",{ascending:false}).limit(100),
 db.from("hisab_billing_webhook_events").select("event_key,tx_ref,status,attempts,updated_at").neq("status","processed").order("updated_at",{ascending:true}).limit(100),
 db.from("hisab_billing_payment_attempts").select("tx_ref,amount_etb,status,mode,created_at").order("created_at",{ascending:false}).limit(100),
 ]);
 return <main className="payment-center"><header className="pay-heading"><div><span className="pay-eyebrow">HisabTech · Restricted operations</span><h1>Billing operations</h1><p>Platform subscriptions, verification recovery, and refund decisions. Requires an explicitly assigned operator and MFA.</p></div><span className="pay-badge">{isChapaConfigured()?"Gateway enabled":"Gateway disabled"}</span></header><nav className="pay-nav"><Link href="/billing">Billing</Link></nav>
 {params.notice?<div className="pay-notice" role="status">{params.notice}</div>:null}
 {[refunds,events,payments].some(r=>r.error)?<div className="pay-notice">Some billing records are unavailable. Apply the payment migration and retry.</div>:null}
 <section className="pay-panel"><h2>Refund requests</h2><p>Approval authorizes an operator to arrange the refund through the provider; it does not send money. Only a provider-verified refund changes payment and access records.</p>{refunds.data?.map(r=><article key={r.id}><strong>{r.tx_ref} · {r.status}</strong><p>{r.reason}</p>{r.status==="requested"?<form action={decideBillingRefund} className="pay-form"><input name="id" value={r.id} type="hidden"/><label>Decision<select name="decision"><option value="approved">Approve request</option><option value="rejected">Reject request</option></select></label><label>Decision note<textarea name="note" required minLength={5} maxLength={1000}/></label><button className="pay-button">Record decision</button></form>:null}<form action={operatorRecheckPayment}><input type="hidden" name="txRef" value={r.tx_ref}/><button className="pay-text-button">Verify provider refund status</button></form></article>)}{!refunds.data?.length?<p>No refund requests.</p>:null}</section>
 <section className="pay-panel"><h2>Verification recovery</h2><p>Failed events and expired worker leases can be recovered by provider redelivery. Recheck the transaction below to recover its payment state directly.</p>{events.data?.map(e=><article key={e.event_key}><strong>{e.tx_ref||"Unknown reference"}</strong><p>{e.status} · {e.attempts} attempt(s)</p>{e.tx_ref?.startsWith("hisab-")?<form action={operatorRecheckPayment}><input type="hidden" name="txRef" value={e.tx_ref}/><button className="pay-text-button">Recheck transaction</button></form>:null}</article>)}{!events.data?.length?<p>No events awaiting recovery.</p>:null}</section>
 <section className="pay-panel"><h2>Latest subscription attempts</h2><div className="pay-table-wrap"><table><thead><tr><th>Reference</th><th>ETB</th><th>Status</th><th>Mode</th></tr></thead><tbody>{payments.data?.map(p=><tr key={p.tx_ref}><td><code>{p.tx_ref}</code></td><td>{p.amount_etb}</td><td>{p.status}</td><td>{p.mode}</td></tr>)}</tbody></table></div></section>
 </main>;
}
