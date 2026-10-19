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

const productPaths: Record<string, string> = {
  sales: '/product/sales-invoicing',
  inventory: '/product/inventory',
  finance: '/product/finance-cashflow',
  reports: '/product/reports-analytics',
};

const industryCards = [
  { slug: 'retail', title: 'Retail', Icon: Cart, description: 'Connect tills, sales, stock and customer balances.' },
  { slug: 'wholesale-distribution', title: 'Wholesale & distribution', Icon: Cube, description: 'Coordinate fulfillment, warehouse stock and collections.' },
  { slug: 'restaurants-hospitality', title: 'Hospitality', Icon: Building, description: 'Keep location-level purchasing, cost and daily performance visible.' },
  { slug: 'manufacturing', title: 'Manufacturing', Icon: Bank, description: 'Bring materials, supplier obligations and operations into focus.' },
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
      <div className="cf-site cf-editorial-site ah-home">
        <section className="cf-hero">
          <div className="cf-hero-shell">
            <div className="cf-hero-copy">
              <h1>One connected business. <em>Clarity at every step.</em></h1>
              <p>Bring sales, finance, inventory, purchasing and reporting together in one dependable business operating system. Built for how Ethiopian businesses work—and where they want to go.</p>
              <div className="cf-hero-actions">
                <Link prefetch={false} className="cf-primary" href="/auth/email-sign-up">Start free <ArrowRight /></Link>
                <Link className="cf-secondary" href="/request-demo?source=homepage-hero">Book a walkthrough <ArrowRight /></Link>
              </div>
              <div className="ah-hero-assurances" aria-label="Biloo ERP advantages">
                <span><CheckCircle /> ETB-first records</span>
                <span><CheckCircle /> Multi-branch visibility</span>
                <span><CheckCircle /> Role-based controls</span>
              </div>
              <div className="cf-hero-note">One operating record. Every team moving together.</div>
            </div>
            <div className="cf-hero-product ah-hero-board">
              <div className="cf-hero-product-top">
                <span><span className="ah-board-status" aria-hidden="true" /> Biloo workspace</span>
                <span className="ah-board-label">INTERACTIVE SAMPLE</span>
              </div>
              <InteractiveErpOffice moduleTitle="Sales invoices" moduleEyebrow="Sales / Invoices & collections" metrics={heroMetrics} rows={heroRows} compact illustrative />
              <div className="ah-board-footer"><span><ShieldCheck /> Structured, traceable records</span><span>Illustrative data · not a live account</span></div>
            </div>
          </div>
          <div className="cf-hero-capabilities" aria-label="Biloo capabilities">
            <div><Cart /><span><strong>Sales & invoicing</strong><small>Quote, invoice and collect</small></span></div>
            <div><Bank /><span><strong>Finance & accounting</strong><small>Cash, journals and controls</small></span></div>
            <div><Cube /><span><strong>Inventory & procurement</strong><small>Stock, purchasing and suppliers</small></span></div>
            <div><Reports /><span><strong>Reports & analytics</strong><small>Decision-ready visibility</small></span></div>
          </div>
        </section>
        <section className="ah-modules" aria-labelledby="ah-module-title">
          <div className="ah-section-heading">
            <div><span className="ah-eyebrow">THE CONNECTED WORKSPACE <b>01 / EXPLORE</b></span><h2 id="ah-module-title">Every part of your business. <em>One clear picture.</em></h2></div>
            <p>Each module is designed for the team doing the work—and connected to the records management needs to trust.</p>
          </div>
          <div className="ah-module-grid">
            {products.map(({ id, label, Icon, title }, index) => (
              <Link key={id} href={productPaths[id]} className="ah-module-card">
                <div className="ah-module-card-top"><span className="ah-module-icon"><Icon /></span><span className="ah-module-index">0{index + 1} / 04</span></div>
                <h3>{label === 'Sales' ? 'Sales & invoicing' : label === 'Finance' ? 'Finance & accounting' : label === 'Inventory' ? 'Inventory & procurement' : 'Reports & analytics'}</h3>
                <p>{title}</p>
                <span className="ah-module-link">Explore module <ArrowRight /></span>
                <span className="ah-module-line" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="cf-record-system" aria-labelledby="record-system-title">
          <div className="cf-record-main">
            <div className="cf-section-intro left"><span>From daily work to decisions</span><h2 id="record-system-title">Decision-ready records, without the spreadsheet relay.</h2><p>Every module contributes to the same trusted record—across teams, branches and time.</p></div>
            <div className="cf-module-ledger">
              {products.map(({ id, label, Icon }, index) => <button type="button" className={selectedProduct === index ? 'active' : undefined} onClick={() => setSelectedProduct(index)} key={id}><Icon /><span><strong>{label}</strong><small>{['Quotes, invoices and collections', 'Stock, batches and transfers', 'Payments and reconciliations', 'Dashboards and controls'][index]}</small></span></button>)}
            </div>
            <div className="cf-record-flow" aria-label="Transaction to ledger workflow">
              {['Transaction', 'Validation', 'Posting', 'Ledger', 'Decision'].map((step, index) => <div key={step}><span className="ah-flow-step">0{index + 1}</span><CheckCircle /><span>{step}</span>{index < 4 ? <ArrowRight /> : null}</div>)}
            </div>
          </div>

          <div className="cf-operator-proof">
            <Image src="/biloo-warehouse-leader.webp" alt="Ethiopian wholesale manager in a well-organized warehouse" fill sizes="(max-width: 900px) 100vw, 34vw" />
            <div><span>Built for operators</span><h3>Local context. International software discipline.</h3><p>ETB-first records, branch visibility, role-based controls and implementation support are part of the experience—not afterthoughts.</p></div>
          </div>
        </section>

        <section className="cf-product-section" id="cf-product">
          <div className="cf-section-intro left"><span>THE PRODUCT, UP CLOSE</span><h2>See how the work connects.</h2><p>Explore illustrative sales, stock, finance and reporting screens. Switch between modules to inspect records, trends and practical business context.</p></div>
          <div className="cf-product-explorer">
            <div className="cf-product-tabs" role="tablist" aria-label="Product areas">
              {products.map((product, index) => <button id={`cf-product-tab-${product.id}`} key={product.id} type="button" role="tab" aria-controls={`cf-product-panel-${product.id}`} aria-selected={selectedProduct === index} className={selectedProduct === index ? 'active' : ''} tabIndex={selectedProduct === index ? 0 : -1} onClick={() => setSelectedProduct(index)} onKeyDown={(event) => moveProductFocus(event, index)}><product.Icon /><strong>{product.label}</strong></button>)}
            </div>
            <div id={`cf-product-panel-${activeProduct.id}`} className="cf-product-panel" role="tabpanel" aria-labelledby={`cf-product-tab-${activeProduct.id}`} tabIndex={0}>
              <div className="cf-product-copy">
                <span>{activeProduct.label}</span><h3>{activeProduct.title}</h3><p>{activeProduct.description}</p><strong>{activeProduct.stat}</strong><small>Illustrative · {activeProduct.statLabel}</small><Link href="/product-tour">Explore the complete product tour <ArrowRight /></Link>
              </div>
              <div className="cf-module-analysis">
                <header><div><span>Illustrative {activeProduct.label.toLowerCase()} trend</span><strong>February—August 2026 · Sample data</strong></div><b>DEMO</b></header>
                <div className="cf-module-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><CartesianGrid stroke="#e7ebf0" vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 9 }} /><Tooltip contentStyle={{ border: '1px solid #dfe3ea', borderRadius: 6, fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#315efb" fill="#315efb" fillOpacity={0.07} strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                <div className="cf-module-rows">{activeProduct.rows.map((row) => <div key={row.label}><span><strong>{row.label}</strong><small>{row.meta}</small></span><b>{row.value}</b></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cf-control-section">
          <div className="cf-section-intro left"><span>CONTROLS AT EVERY STEP</span><h2>Trust what happens between the numbers.</h2><p>Roles, review points and audit evidence stay close to the transaction that needs attention.</p></div>
          <div className="cf-control-table-wrap"><p className="ah-table-caption">Illustrative approvals and activity · sample records, not live account data</p><table className="cf-control-table"><thead><tr><th>Control</th><th>Owner</th><th>Source record</th><th>Last update</th><th>Status</th></tr></thead><tbody><tr><td><ShieldCheck />Bank reconciliation</td><td>Finance lead</td><td>3 unmatched transactions</td><td>Today · 10:42</td><td><b className="attention">Review</b></td></tr><tr><td><CheckCircle />Supplier payment</td><td>General manager</td><td>PAY-26-0124</td><td>Today · 09:18</td><td><b>Approved</b></td></tr><tr><td><Clock />Inventory reorder</td><td>Warehouse lead</td><td>12 items below threshold</td><td>Yesterday</td><td><b className="attention">Open</b></td></tr></tbody></table></div>
        </section>

        <section className="ah-industries" aria-labelledby="ah-industry-title">
          <div className="ah-section-heading"><div><span className="ah-eyebrow">MADE FOR HOW YOU OPERATE <b>02 / YOUR INDUSTRY</b></span><h2 id="ah-industry-title">The right system for <em>your kind of work.</em></h2></div><p>Biloo connects the realities of Ethiopian business—from daily retail operations to multi-location distribution.</p></div>
          <div className="ah-industry-grid">
            {industryCards.map(({ slug, title, Icon, description }, index) => (
              <Link className="ah-industry-card" href={`/industries/${slug}`} key={slug}>
                <div className="ah-industry-card-top"><Icon /><small>0{index + 1}</small></div>
                <h3>{title}</h3><p>{description}</p><span>Explore industry <ArrowRight /></span>
              </Link>
            ))}
          </div>
          <Link className="ah-text-link" href="/industries">Browse all industries <ArrowRight /></Link>
        </section>

        <section className="cf-pricing-section">
          <div className="cf-pricing-heading"><span>Transparent product scope</span><h2>Choose the plan that scales with you.</h2><p>Start with dependable records, then expand into connected operations and advanced controls.</p><Link href="/pricing">View pricing in ETB <ArrowRight /></Link></div>
          <div className="cf-plan-table-wrap"><table className="cf-plan-table"><thead><tr><th>Features</th><th>Starter<small>Core records</small></th><th>Growth<small>Teams & stock</small></th><th>Business<small>Advanced control</small></th><th>Enterprise<small>Custom scale</small></th></tr></thead><tbody>{plans.map((row) => <tr key={row.feature}><th>{row.feature}</th><td><PlanValue value={row.starter} /></td><td><PlanValue value={row.growth} /></td><td><PlanValue value={row.business} /></td><td><PlanValue value={row.enterprise} /></td></tr>)}</tbody></table></div>
        </section>

        <section className="ah-trust" aria-labelledby="ah-trust-title">
          <div className="ah-trust-copy"><span className="ah-eyebrow">CONTROL BY DESIGN <b>03 / CONFIDENCE</b></span><h2 id="ah-trust-title">Clear records. Clear ownership. <em>Stronger decisions.</em></h2><p>Reliable operations need more than dashboards. Biloo helps teams work from source records, review what changed and understand who approved the next action.</p>
          <Link href="/trust">Explore our trust approach <ArrowRight /></Link></div>
          <div className="ah-trust-grid">
            <div><ShieldCheck /><strong>Role-based access</strong><p>Give each person access appropriate to their responsibilities.</p></div>
            <div><CheckCircle /><strong>Connected records</strong><p>Follow transactions from entry through validation and reporting.</p></div>
            <div><Clock /><strong>Reviewable workflows</strong><p>See what needs attention before approvals and reconciliations.</p></div>
            <div><Headset /><strong>Local onboarding support</strong><p>Get practical help configuring how your business operates.</p></div>
          </div>
        </section>

        <section className="cf-local-section">
          <div className="cf-local-copy"><span>Built in Ethiopia</span><h2>Ready for the way Ethiopian businesses operate.</h2><p>Biloo pairs local implementation context with a secure, structured software standard.</p></div>
          <dl className="cf-local-facts"><div><dt>Currency</dt><dd>ETB-first records</dd></div><div><dt>Structure</dt><dd>Multi-branch visibility</dd></div><div><dt>Access</dt><dd>Role-based control</dd></div><div><dt>Support</dt><dd>Guided onboarding</dd></div></dl>
        </section>

        <section className="cf-final-cta" aria-labelledby="ah-final-title"><div className="ah-final-inner"><span>YOUR NEXT CHAPTER STARTS WITH CLARITY</span><h2 id="ah-final-title">A better way to run your business starts here.</h2><p>See how connected sales, finance, inventory and reporting can bring your people, branches and decisions together—without losing the controls that matter.</p><div><Link className="cf-primary" href="/request-demo?source=homepage-final">Book a walkthrough <ArrowRight /></Link><Link prefetch={false} className="cf-secondary" href="/auth/email-sign-up">Start free <ArrowRight /></Link></div><small>Biloo by Hisab Technologies · Built for Ethiopian businesses.</small></div><span className="ah-cta-decoration" aria-hidden="true">B.</span></section>
      </div>
    </IconoirProvider>
  );
}
