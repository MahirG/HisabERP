import { DemoNotice } from "../../../../components/demo-notice";
import { SectionShell } from "../../../../components/section-shell";
import { createInvoice } from "../../../../lib/actions/erp";
import { listCustomers, listProducts } from "../../../../lib/data/erp";
import { getServerFoundationCopy } from "../../../../lib/server-locale";

export const metadata = { title: "New invoice" };
export const dynamic = "force-dynamic";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [params, customers, products, localized] = await Promise.all([searchParams, listCustomers(), listProducts(), getServerFoundationCopy()]);
  const mode = customers.mode === "live" && products.mode === "live" ? "live" : "demo";
  const c = localized.copy.invoice;
  return <SectionShell title={c.title} description={c.description}><DemoNotice mode={mode}/>{params.created && <div className="form-alert success">{c.createdPrefix} {params.created} {c.createdSuffix}</div>}<section className="data-panel invoice-form-panel"><div><p className="eyebrow">{c.postedTransaction}</p><h2>{c.createTitle}</h2><p>{c.explanation}</p></div><form action={createInvoice} className="erp-form two-column"><label>{c.customer}<select name="customerId" required disabled={mode === "demo"}>{customers.records.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></label><label>{c.product}<select name="productId" required disabled={mode === "demo"}>{products.records.map((product) => <option value={product.id} key={product.id}>{product.name} · {product.quantity} {c.available}</option>)}</select></label><input type="hidden" name="warehouseId" value={products.warehouseId || "demo"}/><label>{c.quantity}<input name="quantity" type="number" min="0.001" step="0.001" defaultValue="1" required disabled={mode === "demo"}/></label><label>{c.unitPrice}<input name="unitPrice" type="number" min="0" step="0.01" required disabled={mode === "demo"}/></label><label>{c.taxRate}<input name="taxRate" type="number" min="0" max="100" step="0.01" defaultValue="15" required disabled={mode === "demo"}/></label><label>{c.notes}<input name="notes" maxLength={500} disabled={mode === "demo"}/></label><button className="primary full" type="submit" disabled={mode === "demo" || !products.warehouseId || !customers.records.length || !products.records.length}>{c.post}</button></form></section></SectionShell>;
}
