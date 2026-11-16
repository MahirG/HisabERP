import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoicePaymentLink } from "../../../lib/payments/invoices";
import { refreshInvoicePayment, startInvoiceCheckout } from "../../../lib/actions/invoice-payments";
import { formatEtb } from "../../../lib/billing/catalog";
export const dynamic="force-dynamic";
export const metadata={title:"Secure invoice payment | Biloo",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default async function InvoicePayPage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{state?:string}>}) {
  const {token}=await params; const query=await searchParams;
  if(!/^[a-f0-9]{64}$/.test(token)) notFound();
  let details;
  try {details=await getInvoicePaymentLink(token);} catch {return <main className="pay-public"><h1>Payments are being prepared.</h1><p>Please ask the business for an updated payment link.</p></main>;}
  if(!details) notFound();
  const state=details.attempt?.status;
  const success=state==="success";
  return <main className="pay-public"><section className="pay-public-card">
    <img src="/hisab-logo.svg" alt="Biloo" width="54" height="54"/>
    <span className="pay-eyebrow">{details.link.mode==="test"?"Test environment · no real payment":"Secure invoice payment"}</span>
    <h1>{details.merchant}</h1><p>Invoice {details.invoice.invoice_number}</p>
    <div className="pay-amount"><small>ETB</small><strong>{formatEtb(Number(details.link.amount_etb))}</strong></div>
    <p>{success?(details.link.mode==="test"?"Test payment verified. No live receipt has been posted.":"Payment verified. The business will reconcile your receipt."):state==="refunded"||state==="reversed"?"The provider has confirmed a refund or reversal.":"Complete payment with the options available on the business’s Chapa checkout."}</p>
    {!details.configured?<div className="pay-notice">Online payments are not enabled for this business yet.</div>:null}
    {query.state==="processing"?<div className="pay-notice" role="status">Verification is pending. Check the status before making another payment.</div>:null}
    {!details.available&&!state?<div className="pay-notice">This invoice balance has changed. Request a new payment link.</div>:null}
    {details.available&&details.configured?<form action={startInvoiceCheckout}><input type="hidden" name="token" value={token}/><button className="pay-button" type="submit">{details.attempt&&["open","creating","pending"].includes(state||"")?"Resume secure checkout":"Pay with Chapa"}</button></form>:null}
    {details.attempt?<form action={refreshInvoicePayment}><input type="hidden" name="token" value={token}/><button className="pay-button secondary" type="submit">Check payment status</button></form>:null}
    <small>Expires {new Date(details.link.expires_at).toLocaleDateString("en-ET")}. This link is private; share it only with the payer.</small>
    <Link href="/">Powered by Biloo ERP</Link>
  </section></main>;
}
