'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  Bank,
  Building,
  Cart,
  Check,
  CheckCircle,
  Clock,
  Cube,
  Headset,
  IconoirProvider,
  Reports,
  ShieldCheck,
} from 'iconoir-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { InteractiveErpOffice } from './interactive-erp-office';

const products = [
  {
    id: 'sales', label: 'Sales', Icon: Cart,
    title: 'Move from invoice to collection without losing the trail.',
    description: 'Create VAT-ready invoices, record full or partial payments, follow customer balances and keep every branch on the same current record.',
    stat: 'ETB 5.28M', statLabel: 'cash collected in August',
    chart: [2.8, 3.2, 3.05, 3.8, 4.15, 4.82, 5.28],
    rows: [
      { label: 'Selam Supermarket', value: 'ETB 126,500', meta: 'Paid · Addis HQ' },
      { label: 'Yod Ent. Wholesale', value: 'ETB 89,760', meta: 'Partial · Adama' },
      { label: 'Abrelo Retail', value: 'ETB 45,600', meta: 'Overdue · Hawassa' },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', Icon: Cube,
    title: 'Know what is on hand, what is moving and what needs action.',
    description: 'Track stock by warehouse, connect purchasing to sales demand and see the financial impact of every movement.',
    stat: 'ETB 12.76M', statLabel: 'stock value on hand',
    chart: [8.1, 8.8, 9.4, 9.25, 10.8, 11.9, 12.76],
    rows: [
      { label: 'Premium coffee 1kg', value: '1,248 units', meta: 'Healthy · Addis HQ' },
      { label: 'Cooking oil 5L', value: '7 units', meta: 'Reorder · Adama' },
      { label: 'Packaging box M', value: '386 units', meta: 'Stable · Hawassa' },
    ],
  },
  {
    id: 'finance', label: 'Finance', Icon: Bank,
    title: 'Close the month with a ledger that explains itself.',
    description: 'Keep cash, journals, reconciliations, payables, receivables and approvals connected to source records and branch activity.',
    stat: 'ETB 3.42M', statLabel: 'current cash balance',
    chart: [1.9, 2.2, 2.1, 2.55, 2.8, 3.18, 3.42],
    rows: [
      { label: 'Collections received', value: 'ETB 1.48M', meta: 'Reconciled' },
      { label: 'Supplier payments', value: 'ETB 524K', meta: 'Approved' },
      { label: 'Operating expenses', value: 'ETB 368K', meta: 'Posted' },
    ],
  },
  {
    id: 'reports', label: 'Reports', Icon: Reports,
    title: 'Turn daily work into decision-ready management records.',
    description: 'Compare periods, branches, customers and products with answers that remain traceable to the underlying transaction.',
    stat: '+18.6%', statLabel: 'revenue growth in August',
    chart: [6.2, 7.1, 7.6, 8.9, 10.8, 14.4, 18.6],
    rows: [
      { label: 'Revenue performance', value: '+18.6%', meta: 'Improving' },
      { label: 'Collection rate', value: '91.4%', meta: 'On target' },
      { label: 'Inventory turnover', value: '4.8×', meta: 'Quarter' },
    ],
  },
] as const;

const heroMetrics = [
  { label: 'Cash in August', value: 'ETB 5.28M', note: '+14.6% vs July' },
  { label: 'Overdue', value: 'ETB 812,340', note: '16 invoices' },
  { label: 'Stock on hand', value: 'ETB 12.76M', note: '1,248 SKUs' },
];

const heroRows = [
  { label: 'Selam Supermarket', value: 'ETB 126,500', meta: 'Paid · Addis HQ' },
  { label: 'Yod Ent. Wholesale', value: 'ETB 89,760', meta: 'Partial · Adama' },
  { label: 'Abrelo Retail', value: 'ETB 45,600', meta: 'Overdue · Hawassa' },
];

const plans = [
  { feature: 'Sales & invoicing', starter: true, growth: true, business: true, enterprise: true },
  { feature: 'Inventory & stock control', starter: false, growth: true, business: true, enterprise: true },
  { feature: 'Purchases & supplier management', starter: false, growth: true, business: true, enterprise: true },
  { feature: 'Multi-branch operations', starter: '1 branch', growth: 'Up to 3', business: 'Unlimited', enterprise: 'Custom' },
  { feature: 'Advanced reporting & controls', starter: false, growth: false, business: true, enterprise: true },
] as const;

function PlanValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check aria-label="Included" />;
  if (value === false) return <span aria-label="Not included">—</span>;
  return <span>{value}</span>;
}

export function CampfireMarketingHome() {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const activeProduct = products[selectedProduct];
  const chartData = activeProduct.chart.map((value, index) => ({ period: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][index], value }));

  const moveProductFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keyTargets: Partial<Record<string, number>> = {
      ArrowRight: (index + 1) % products.length,
      ArrowDown: (index + 1) % products.length,
      ArrowLeft: (index - 1 + products.length) % products.length,
      ArrowUp: (index - 1 + products.length) % products.length,
      Home: 0,
      End: products.length - 1,
    };
    const nextIndex = keyTargets[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    setSelectedProduct(nextIndex);
    document.getElementById(`cf-product-tab-${products[nextIndex].id}`)?.focus();
  };

  return (
    <IconoirProvider iconProps={{ width: 20, height: 20, strokeWidth: 1.55, 'aria-hidden': true }}>
      <div className="cf-site cf-editorial-site">
        <section className="cf-hero">
          <div className="cf-hero-layout">
            <div className="cf-vertical-label" aria-hidden="true"><span>Business operating system for Ethiopia</span></div>
            <div className="cf-hero-copy">
              <span className="cf-eyebrow">Biloo ERP · Built for Ethiopian business</span>
              <h1>One operating record. Every team in control.</h1>
              <p>Biloo connects sales, inventory, finance and reporting so growing businesses run with clarity from day to day—and decide with confidence.</p>
              <div className="cf-hero-actions">
                <Link className="cf-primary" href="/auth/email-sign-up">Start free</Link>
                <Link className="cf-secondary" href="/request-demo?source=homepage-hero">Book a walkthrough</Link>
              </div>
              <div className="cf-trust-line">
                <span><ShieldCheck />Local compliance built in</span>
                <span><Building />Multi-branch ready</span>
                <span><Headset />Human support in your time</span>
              </div>
            </div>

            <div className="cf-hero-visual">
              <div className="cf-hero-photo"><Image src="/biloo-retail-operators.webp" alt="Ethiopian business operators reviewing Biloo records on a tablet" fill sizes="(max-width: 900px) 100vw, 36vw" priority /></div>
              <div className="cf-hero-preview"><InteractiveErpOffice moduleTitle="Sales invoices" moduleEyebrow="Sales / Invoices & collections" metrics={heroMetrics} rows={heroRows} compact /></div>
            </div>
          </div>
        </section>

        <section className="cf-record-system" aria-labelledby="record-system-title">
          <div className="cf-record-main">
            <div className="cf-section-intro left"><span>From daily work to decisions</span><h2 id="record-system-title">Decision-ready records, without the spreadsheet relay.</h2><p>Every module contributes to the same trusted record—across teams, branches and time.</p></div>
            <div className="cf-module-ledger">
              {products.map(({ id, label, Icon }, index) => <button type="button" className={selectedProduct === index ? 'active' : undefined} onClick={() => setSelectedProduct(index)} key={id}><Icon /><span><strong>{label}</strong><small>{['Quotes, invoices and collections', 'Stock, batches and transfers', 'Payments and reconciliations', 'Dashboards and controls'][index]}</small></span></button>)}
            </div>
            <div className="cf-record-flow" aria-label="Transaction to ledger workflow">
              {['Transaction', 'Validation', 'Posting', 'Ledger'].map((step, index) => <div key={step}><CheckCircle /><span>{step}</span>{index < 3 ? <ArrowRight /> : null}</div>)}
            </div>
          </div>

          <div className="cf-operator-proof">
            <Image src="/biloo-warehouse-leader.webp" alt="Ethiopian wholesale manager in a well-organized warehouse" fill sizes="(max-width: 900px) 100vw, 34vw" />
            <div><span>Built for operators</span><h3>Local context. International software discipline.</h3><p>ETB-first records, branch visibility, role-based controls and implementation support are part of the experience—not afterthoughts.</p></div>
          </div>
        </section>

        <section className="cf-product-section" id="cf-product">
          <div className="cf-section-intro left"><span>Interactive product evidence</span><h2>Inspect the work, not a decorative device.</h2><p>Switch between core workspaces to see the data density, hierarchy and controls your team will actually use.</p></div>
          <div className="cf-product-explorer">
            <div className="cf-product-tabs" role="tablist" aria-label="Product areas">
              {products.map((product, index) => <button id={`cf-product-tab-${product.id}`} key={product.id} type="button" role="tab" aria-controls={`cf-product-panel-${product.id}`} aria-selected={selectedProduct === index} className={selectedProduct === index ? 'active' : ''} tabIndex={selectedProduct === index ? 0 : -1} onClick={() => setSelectedProduct(index)} onKeyDown={(event) => moveProductFocus(event, index)}><product.Icon /><strong>{product.label}</strong></button>)}
            </div>
            <div id={`cf-product-panel-${activeProduct.id}`} className="cf-product-panel" role="tabpanel" aria-labelledby={`cf-product-tab-${activeProduct.id}`} tabIndex={0}>
              <div className="cf-product-copy">
                <span>{activeProduct.label}</span><h3>{activeProduct.title}</h3><p>{activeProduct.description}</p><strong>{activeProduct.stat}</strong><small>{activeProduct.statLabel}</small><Link href="/product-tour">Explore the complete product tour <ArrowRight /></Link>
              </div>
              <div className="cf-module-analysis">
                <header><div><span>Performance trend</span><strong>February—August 2026</strong></div><b>Live</b></header>
                <div className="cf-module-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><CartesianGrid stroke="#e7ebf0" vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 9 }} /><Tooltip contentStyle={{ border: '1px solid #dfe3ea', borderRadius: 6, fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#315efb" fill="#315efb" fillOpacity={0.07} strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                <div className="cf-module-rows">{activeProduct.rows.map((row) => <div key={row.label}><span><strong>{row.label}</strong><small>{row.meta}</small></span><b>{row.value}</b></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cf-control-section">
          <div className="cf-section-intro left"><span>Controls inside the workflow</span><h2>Accountability without unnecessary process.</h2><p>Roles, review points and audit evidence stay close to the transaction that needs attention.</p></div>
          <div className="cf-control-table-wrap"><table className="cf-control-table"><thead><tr><th>Control</th><th>Owner</th><th>Source record</th><th>Last update</th><th>Status</th></tr></thead><tbody><tr><td><ShieldCheck />Bank reconciliation</td><td>Finance lead</td><td>3 unmatched transactions</td><td>Today · 10:42</td><td><b className="attention">Review</b></td></tr><tr><td><CheckCircle />Supplier payment</td><td>General manager</td><td>PAY-26-0124</td><td>Today · 09:18</td><td><b>Approved</b></td></tr><tr><td><Clock />Inventory reorder</td><td>Warehouse lead</td><td>12 items below threshold</td><td>Yesterday</td><td><b className="attention">Open</b></td></tr></tbody></table></div>
        </section>

        <section className="cf-pricing-section">
          <div className="cf-pricing-heading"><span>Transparent product scope</span><h2>Choose the plan that scales with you.</h2><p>Start with dependable records, then expand into connected operations and advanced controls.</p><Link href="/pricing">View pricing in ETB <ArrowRight /></Link></div>
          <div className="cf-plan-table-wrap"><table className="cf-plan-table"><thead><tr><th>Features</th><th>Starter<small>Core records</small></th><th>Growth<small>Teams & stock</small></th><th>Business<small>Advanced control</small></th><th>Enterprise<small>Custom scale</small></th></tr></thead><tbody>{plans.map((row) => <tr key={row.feature}><th>{row.feature}</th><td><PlanValue value={row.starter} /></td><td><PlanValue value={row.growth} /></td><td><PlanValue value={row.business} /></td><td><PlanValue value={row.enterprise} /></td></tr>)}</tbody></table></div>
        </section>

        <section className="cf-local-section">
          <div className="cf-local-copy"><span>Built in Ethiopia</span><h2>Ready for the way Ethiopian businesses operate.</h2><p>Biloo pairs local implementation context with a secure, structured software standard.</p></div>
          <dl className="cf-local-facts"><div><dt>Currency</dt><dd>ETB-first records</dd></div><div><dt>Structure</dt><dd>Multi-branch visibility</dd></div><div><dt>Access</dt><dd>Role-based control</dd></div><div><dt>Support</dt><dd>Guided onboarding</dd></div></dl>
        </section>

        <section className="cf-final-cta"><div><span>See Biloo in your workflow</span><h2>Run the business from one dependable system.</h2><p>Walk through your current processes and see where Biloo can simplify the work while preserving the controls that matter.</p><div><Link className="cf-primary" href="/request-demo?source=homepage-final">Book a walkthrough</Link><Link className="cf-secondary" href="/auth/email-sign-up">Start free</Link></div></div></section>
      </div>
    </IconoirProvider>
  );
}
