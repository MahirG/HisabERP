import Link from "next/link";
import { can, getCurrentUserContext } from "../../lib/data/context";
import { createClient } from "../../lib/supabase/server";
import { configuredMerchant } from "../../lib/payments/config";
import { reverseInvoiceCollection,createInvoicePaymentLink,postInvoiceCollection,recheckInvoiceCollection,revokeInvoicePaymentLink,savePaymentConnection } from "../../lib/actions/invoice-payments";
import { formatEtb } from "../../lib/billing/catalog";
import { Icon } from "../../components/ui/icon";
export const dynamic="force-dynamic";
export const metadata={title:"Payments & collections"};

export default async function PaymentsPage({searchParams}:{searchParams:Promise<{notice?:string}>}) {
  const ctx=await getCurrentUserContext({required:true});
  if(!ctx||!can(ctx,"manage_sales")) return <main className="payment-center"><h1>Payment access restricted</h1><p>Ask your business administrator for sales or finance permissions.</p></main>;
  const finance=can(ctx,"manage_finance"); const db=await createClient(); const params=await searchParams;
  const [connection,attempts,links,invoices,accounts]=await Promise.all([
    db.from("payment_connections").select("merchant_label,mode,enabled,settlement_account_id").eq("organization_id",ctx.organizationId).maybeSingle(),
    db.from("invoice_payment_attempts").select("tx_ref,invoice_id,amount_etb,status,mode,verified_at,created_at,payment_id,posted_at,reversal_journal_id").eq("organization_id",ctx.organizationId).order("created_at",{ascending:false}).limit(100),
    db.from("invoice_payment_links").select("id,invoice_id,amount_etb,mode,expires_at,revoked_at").eq("organization_id",ctx.organizationId).order("created_at",{ascending:false}).limit(50),
    db.from("sales_invoice_balance_view").select("id,invoice_number,outstanding_amount").eq("organization_id",ctx.organizationId).in("status",["posted","partially_paid"]).gt("outstanding_amount",0).order("invoice_date",{ascending:false}).limit(100),
    db.from("accounts").select("id,code,name").eq("organization_id",ctx.organizationId).eq("account_type","asset").eq("is_active",true).order("code"),
  ]);
  const unavailable=Boolean(connection.error||attempts.error||links.error||invoices.error||accounts.error);
  const rows=attempts.data||[];const ready=Boolean(connection.data?.enabled&&configuredMerchant(ctx.organizationId,connection.data.mode));
  const review=rows.filter(p=>p.status==="success"&&p.mode==="live"&&!p.payment_id);
  const reversal=rows.filter(p=>["refunded","reversed"].includes(p.status)&&p.payment_id&&!p.reversal_journal_id);
  const money=(n:number)=>`ETB ${formatEtb(n)}`;
  return <main className="payment-center">
    <header className="pay-heading"><div><span className="pay-eyebrow">{ctx.organizationName} · Finance</span><h1>Payments &amp; collections</h1><p>Collect invoice payments, verify every transaction, and approve each accounting entry.</p></div><span className={`pay-badge ${ready?"good":""}`}><Icon name="shield-check" size={16}/>{ready?"Merchant connected":"Awaiting merchant integration"}</span></header>
    <nav className="pay-nav"><Link href="/billing">Your ERP subscription</Link><Link href="/reconciliation">Settlement &amp; fees</Link><Link href="/sales?tab=invoices">Sales invoices</Link></nav>
    {params.notice?<div className="pay-notice" role="status">{params.notice}</div>:null}
    {unavailable?<div className="pay-notice" role="alert">Payment records are not available yet. The payment database migration must be applied before this workspace can save records. No payment status is being assumed.</div>:null}
    <section className="pay-metrics" aria-label="Latest 100 payment attempts">
      <article><Icon name="wallet"/><small>Awaiting finance approval</small><strong>{money(review.reduce((s,p)=>s+Number(p.amount_etb),0))}</strong><span>{review.length} verified collections</span></article>
      <article><Icon name="receipt"/><small>Posted to accounts</small><strong>{rows.filter(p=>p.payment_id).length}</strong><span>Latest 100 attempts</span></article>
      <article><Icon name="refresh-cw"/><small>Still processing</small><strong>{rows.filter(p=>["creating","open","pending"].includes(p.status)).length}</strong><span>Check status before retrying payment</span></article>
    </section>
    {reversal.length?<div className="pay-notice" role="alert">{reversal.length} posted payment(s) have a provider-confirmed refund or reversal. Use the reversal action below to post a separate journal; original evidence is preserved.</div>:null}
    <div className="pay-grid">
      <section className="pay-panel"><h2><Icon name="landmark"/> Business merchant</h2><p>Invoice collections settle with your business’s own merchant account. Subscription payments use HisabTech’s separate account.</p>
        {finance?<form action={savePaymentConnection} className="pay-form">
          <label>Merchant display name<input name="label" required minLength={2} maxLength={120} defaultValue={connection.data?.merchant_label||ctx.organizationName}/></label>
          <label>Environment<select name="mode" defaultValue={connection.data?.mode||"test"}><option value="test">Test · no live accounting</option><option value="live">Live · approved merchant only</option></select></label>
          <label>Settlement clearing account<select name="account" required defaultValue={connection.data?.settlement_account_id||""}><option value="" disabled>Select an asset account</option>{accounts.data?.map(a=><option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}</select></label>
          <label className="pay-checkbox"><input type="checkbox" name="enabled" defaultChecked={connection.data?.enabled}/> Enable checkout when credentials are installed</label>
          <button className="pay-button" disabled={unavailable}>Save merchant settings</button>
        </form>:<p>Finance permission is required to configure this merchant.</p>}
        <small>No API keys are entered or displayed here. An administrator installs credentials securely on the server.</small>
      </section>
      <section className="pay-panel"><h2><Icon name="link"/> Create a payment link</h2><p>Choose an open invoice and a full or partial amount. Links expire, can be revoked, and reveal only the information needed to pay.</p>
        <form action={createInvoicePaymentLink} className="pay-form">
          <label>Invoice<select name="invoice" required defaultValue=""><option value="" disabled>Select an invoice</option>{invoices.data?.map(i=><option key={i.id} value={i.id}>{i.invoice_number} · {money(Number(i.outstanding_amount))} outstanding</option>)}</select></label>
          <label>Amount in ETB<input type="number" name="amount" min="0.01" step="0.01" max="999999999999.99" required/></label>
          <label>Link valid for<select name="days" defaultValue="7"><option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option></select></label>
          <button className="pay-button" disabled={unavailable||!connection.data}>Create private payment link</button>
        </form><small>You’ll open the link once it is created. Copy its address for the payer. We retain its hash rather than the private token.</small>
      </section>
    </div>
    <section className="pay-panel"><div className="pay-section-title"><div><h2>Collections register</h2><p>Verified payments remain separate from posted accounting receipts.</p></div><Link href="/api/payments/export">Export CSV <Icon name="download" size={16}/></Link></div>
      <div className="pay-table-wrap"><table><thead><tr><th>Payment reference</th><th>Amount</th><th>State</th><th>Accounting</th><th>Actions</th></tr></thead><tbody>
        {rows.map(p=><tr key={p.tx_ref}><td><code>{p.tx_ref}</code><small>{new Date(p.created_at).toLocaleDateString("en-ET")} · {p.mode}</small></td><td>{money(Number(p.amount_etb))}</td><td><span className={`pay-badge ${p.status==="success"?"good":""}`}>{p.status}</span></td><td>{p.payment_id?"Receipt posted":p.mode==="test"?"Test only":p.status==="success"?"Awaiting approval":"—"}</td><td><div className="pay-row-actions">{finance?<form action={recheckInvoiceCollection}><input type="hidden" name="txRef" value={p.tx_ref}/><button className="pay-text-button">Verify status</button></form>:null}{finance&&p.status==="success"&&p.mode==="live"&&!p.payment_id?<form action={postInvoiceCollection}><input type="hidden" name="txRef" value={p.tx_ref}/><button className="pay-text-button">Approve &amp; post</button></form>:null}</div>{finance&&["refunded","reversed"].includes(p.status)&&p.payment_id&&!p.reversal_journal_id?<details><summary>Reverse original receipt</summary><form action={reverseInvoiceCollection} className="pay-form"><input type="hidden" name="txRef" value={p.tx_ref}/><label>Reason<textarea name="reason" required minLength={10} maxLength={1000}/></label><button className="pay-button">Post reversal journal</button></form></details>:null}{p.reversal_journal_id?<small>Reversal journal posted</small>:null}</td></tr>)}
        {!rows.length?<tr><td colSpan={5}>No collection attempts recorded. Payments will appear here after checkout begins.</td></tr>:null}
      </tbody></table></div>
    </section>
    <section className="pay-panel"><h2>Payment links</h2><div className="pay-link-list">{links.data?.map(l=><article key={l.id}><div><strong>{money(Number(l.amount_etb))}</strong><small>{l.mode} · {l.revoked_at?"Revoked":Date.parse(l.expires_at)<Date.now()?"Expired":`Expires ${new Date(l.expires_at).toLocaleDateString("en-ET")}`}</small></div>{!l.revoked_at?<form action={revokeInvoicePaymentLink}><input name="linkId" type="hidden" value={l.id}/><button className="pay-text-button">Revoke link</button></form>:null}</article>)}{!links.data?.length?<p>No payment links yet.</p>:null}</div></section>
  </main>;
}
