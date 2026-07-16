import { DemoNotice } from "../../components/demo-notice";
import { SectionShell } from "../../components/section-shell";
import { createCustomer } from "../../lib/actions/erp";
import { listCustomers } from "../../lib/data/erp";
import { getServerFoundationCopy } from "../../lib/server-locale";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [params, data, localized] = await Promise.all([searchParams, listCustomers(), getServerFoundationCopy()]);
  const { mode, records } = data;
  const c = localized.copy.customers;
  return <SectionShell title={c.title} description={c.description}><DemoNotice mode={mode}/>{params.created && <div className="form-alert success">{c.created}</div>}<div className="management-grid"><section className="data-panel"><div className="panel-head"><div><p className="eyebrow">{c.directory}</p><h2>{records.length} {c.count}</h2></div></div><div className="record-list">{records.map((customer) => <article className="record-row" key={customer.id}><div><strong>{customer.name}</strong><span>{customer.email || customer.phone || c.noContact}</span></div><div><small>{c.creditLimit}</small><strong>ETB {customer.creditLimit.toLocaleString()}</strong></div></article>)}</div></section><section className="data-panel"><p className="eyebrow">{c.newLabel}</p><h2>{c.addTitle}</h2><form action={createCustomer} className="erp-form"><label>{c.name}<input name="name" required disabled={mode === "demo"}/></label><label>{c.email}<input name="email" type="email" disabled={mode === "demo"}/></label><label>{c.phone}<input name="phone" disabled={mode === "demo"}/></label><label>{c.tin}<input name="tin" disabled={mode === "demo"}/></label><label>{c.creditLimitEtb}<input name="creditLimit" type="number" min="0" step="0.01" defaultValue="0" disabled={mode === "demo"}/></label><button className="primary" type="submit" disabled={mode === "demo"}>{c.save}</button></form></section></div></SectionShell>;
}
