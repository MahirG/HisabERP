import Link from "next/link";
import { getPaymentHistory } from "../lib/data/payment-history";
import { formatEtb } from "../lib/billing/catalog";
import { recheckBillingPayment,requestBillingRefund } from "../lib/actions/payment-management";

export async function BillingPaymentHistory() {
  const history=await getPaymentHistory();
  const future=history.periods.filter(p=>!p.revoked_at&&Date.parse(p.starts_at)>Date.now());
  return <section className="billing-history pay-panel"><div className="pay-section-title"><div><h2>Payment history &amp; receipts</h2><p>Verified payments, manual renewals, and refund requests in one place.</p></div><Link href="/api/billing/export">Export CSV</Link></div>
    {history.unavailable?<div className="pay-notice">Detailed payment history is unavailable. Payment management will be available after the database upgrade.</div>:null}
    {future.length?<div className="pay-notice">Upcoming paid periods: {future.map(p=>`${p.plan_code} from ${new Date(p.starts_at).toLocaleDateString("en-ET")}`).join(" · ")}. Plan changes begin after previously paid periods end.</div>:null}
    <div className="pay-table-wrap"><table><thead><tr><th>Payment</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {history.payments.map(p=><tr key={p.tx_ref}><td><strong>{p.plan_code} · {p.billing_cycle}</strong><small>{new Date(p.created_at).toLocaleDateString("en-ET")} · {p.mode||"unconfirmed mode"}</small><code>{p.tx_ref}</code></td><td>ETB {formatEtb(Number(p.amount_etb))}</td><td>{p.status}{history.refunds.find(r=>r.tx_ref===p.tx_ref)?<small>Refund: {history.refunds.find(r=>r.tx_ref===p.tx_ref)?.status}</small>:null}</td><td><div className="pay-row-actions"><form action={recheckBillingPayment}><input name="txRef" value={p.tx_ref} type="hidden"/><button className="pay-text-button">Check status</button></form>{p.verified_at&&["success","refunded","reversed"].includes(p.status)?<Link href={`/billing/receipts/${p.tx_ref}`}>View receipt</Link>:null}</div>
      {p.status==="success"&&p.mode==="live"&&!history.refunds.some(r=>r.tx_ref===p.tx_ref)?<details><summary>Request a refund</summary><form action={requestBillingRefund} className="pay-form"><input name="txRef" value={p.tx_ref} type="hidden"/><label>Reason<textarea name="reason" required minLength={10} maxLength={1000}/></label><button className="pay-button">Submit refund request</button><small>Submitting a request does not return funds or change your access.</small></form></details>:null}
      </td></tr>)}{!history.payments.length?<tr><td colSpan={4}>No payments recorded.</td></tr>:null}
    </tbody></table></div><p>Renewal is manual. There is no automatic debit or recurring payment authorization.</p><Link href="/payments">Open business invoice collections →</Link>
  </section>;
}
