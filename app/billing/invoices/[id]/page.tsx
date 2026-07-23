import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "../../../../lib/data/context";
import { createClient } from "../../../../lib/supabase/server";

export const metadata: Metadata = { title: "Subscription invoice" };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstRelated(value: unknown) {
  return Array.isArray(value) ? asRecord(value[0]) : asRecord(value);
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  return new Intl.DateTimeFormat("en-ET", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function formatMoney(value: unknown, currency: string) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value ?? 0));
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUserContext({ required: true })]);
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_invoices")
    .select("id,invoice_number,status,currency,subtotal,tax_amount,total_amount,issued_at,due_at,paid_at,period_start,period_end,customer_snapshot,seller_snapshot,line_items,provider,provider_reference,billing_plans(name,slug)")
    .eq("id", id)
    .eq("organization_id", user.organizationId)
    .maybeSingle();

  if (error || !data) notFound();
  const invoice = asRecord(data);
  const customer = asRecord(invoice.customer_snapshot);
  const seller = asRecord(invoice.seller_snapshot);
  const plan = firstRelated(invoice.billing_plans);
  const lines = Array.isArray(invoice.line_items) ? invoice.line_items.map(asRecord) : [];
  const currency = typeof invoice.currency === "string" ? invoice.currency : "ETB";

  return (
    <main className="billing-invoice-page">
      <div className="billing-invoice-toolbar"><Link href="/billing">← Billing center</Link><span>Use your browser’s print command to save this invoice as PDF.</span><button type="button" onClick={undefined} className="billing-print-hint">Print / Save PDF</button></div>
      <article className="billing-invoice-document">
        <header>
          <div className="billing-invoice-brand"><img src="/hisab-logo.svg" width="48" height="48" alt="" /><span><strong>{String(seller.name || "Hisab Technologies")}</strong><small>HisabERP subscription billing</small></span></div>
          <div><span>INVOICE</span><strong>{String(invoice.invoice_number)}</strong><b className={`billing-status-badge tone-${invoice.status === "paid" ? "success" : "warning"}`}>{String(invoice.status).toUpperCase()}</b></div>
        </header>
        <section className="billing-invoice-parties">
          <div><span>Issued by</span><strong>{String(seller.name || "Hisab Technologies")}</strong><p>{String(seller.email || "info@hisabtech.com")}<br />{String(seller.phone || "+251 924 093 037")}</p>{seller.tin ? <small>TIN: {String(seller.tin)}</small> : null}{seller.vat_number ? <small>VAT: {String(seller.vat_number)}</small> : null}</div>
          <div><span>Billed to</span><strong>{String(customer.name || user.organizationName)}</strong><p>{String(customer.email || user.email)}{customer.phone ? <><br />{String(customer.phone)}</> : null}</p></div>
          <dl><div><dt>Issued</dt><dd>{formatDate(invoice.issued_at)}</dd></div><div><dt>Paid</dt><dd>{formatDate(invoice.paid_at)}</dd></div><div><dt>Service period</dt><dd>{formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}</dd></div><div><dt>Payment method</dt><dd>{String(invoice.provider || "—")}</dd></div></dl>
        </section>
        <section className="billing-invoice-lines">
          <table><thead><tr><th>Description</th><th>Qty</th><th>Unit amount</th><th>Tax</th><th>Total</th></tr></thead><tbody>{lines.length ? lines.map((line, index) => <tr key={index}><td><strong>{String(line.description || plan.name || "HisabERP subscription")}</strong></td><td>{String(line.quantity || 1)}</td><td>{formatMoney(line.unit_amount, currency)}</td><td>{formatMoney(line.tax_amount, currency)}</td><td>{formatMoney(line.total_amount, currency)}</td></tr>) : <tr><td><strong>{String(plan.name || "HisabERP subscription")}</strong></td><td>1</td><td>{formatMoney(invoice.subtotal, currency)}</td><td>{formatMoney(invoice.tax_amount, currency)}</td><td>{formatMoney(invoice.total_amount, currency)}</td></tr>}</tbody></table>
        </section>
        <section className="billing-invoice-totals"><dl><div><dt>Subtotal</dt><dd>{formatMoney(invoice.subtotal, currency)}</dd></div><div><dt>Tax</dt><dd>{formatMoney(invoice.tax_amount, currency)}</dd></div><div className="total"><dt>Total paid</dt><dd>{formatMoney(invoice.total_amount, currency)}</dd></div></dl></section>
        <footer><div><strong>Payment reference</strong><span>{String(invoice.provider_reference || "Verified by HisabTech billing")}</span></div><p>This invoice records a verified HisabERP subscription payment. It does not expose wallet, bank-login or card credentials.</p></footer>
      </article>
    </main>
  );
}
