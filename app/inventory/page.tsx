import { DemoNotice } from "../../components/demo-notice";
import { SectionShell } from "../../components/section-shell";
import { createProduct } from "../../lib/actions/erp";
import { listProducts } from "../../lib/data/erp";
import { getServerFoundationCopy } from "../../lib/server-locale";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [params, data, localized] = await Promise.all([searchParams, listProducts(), getServerFoundationCopy()]);
  const { mode, records, warehouseId } = data;
  const c = localized.copy.inventory;
  return <SectionShell title={c.title} description={c.description}><DemoNotice mode={mode}/>{params.created && <div className="form-alert success">{c.created}</div>}<div className="management-grid"><section className="data-panel"><div className="panel-head"><div><p className="eyebrow">{c.stockPosition}</p><h2>{records.length} {c.count}</h2></div></div><div className="record-list">{records.map((product) => { const low = product.quantity <= product.reorderLevel; return <article className="record-row" key={product.id}><div><strong>{product.name}</strong><span>{product.sku} · {product.warehouseName}</span></div><div className={low ? "stock-warning" : ""}><small>{c.available}</small><strong>{product.quantity.toLocaleString()}</strong><span>{c.reorderAt} {product.reorderLevel}</span></div></article>; })}</div></section><section className="data-panel"><p className="eyebrow">{c.newLabel}</p><h2>{c.createTitle}</h2><form action={createProduct} className="erp-form"><input type="hidden" name="warehouseId" value={warehouseId || "demo"}/><label>{c.sku}<input name="sku" required disabled={mode === "demo" || !warehouseId}/></label><label>{c.productName}<input name="name" required disabled={mode === "demo" || !warehouseId}/></label><label>{c.unitPrice}<input name="unitPrice" type="number" min="0" step="0.01" required disabled={mode === "demo" || !warehouseId}/></label><label>{c.costPrice}<input name="costPrice" type="number" min="0" step="0.01" defaultValue="0" disabled={mode === "demo" || !warehouseId}/></label><label>{c.openingQuantity}<input name="openingQuantity" type="number" min="0" step="0.001" defaultValue="0" disabled={mode === "demo" || !warehouseId}/></label><label>{c.reorderLevel}<input name="reorderLevel" type="number" min="0" step="0.001" defaultValue="0" disabled={mode === "demo" || !warehouseId}/></label><button className="primary" type="submit" disabled={mode === "demo" || !warehouseId}>{c.save}</button>{mode === "live" && !warehouseId && <small>{c.warehouseRequired}</small>}</form></section></div></SectionShell>;
}
