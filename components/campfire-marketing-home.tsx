'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type KeyboardEvent } from 'react';

const products = [
  {
    id: 'finance',
    label: 'Finance & accounting',
    title: 'Close the month with a ledger that explains itself.',
    description: 'Keep journals, reconciliations, approvals, customer balances, supplier obligations and financial statements connected in one controlled workspace.',
    stat: 'ETB 4.82M',
    statLabel: 'revenue this month',
    chart: [42, 55, 48, 68, 64, 79, 74, 88, 95],
    rows: [
      { label: 'Cash & bank', value: 'ETB 2.48M', change: '+8.4%' },
      { label: 'Receivables', value: 'ETB 1.36M', change: '+12.1%' },
      { label: 'Operating margin', value: '42.8%', change: '+2.4%' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales & receivables',
    title: 'Move from invoice to collection without losing the thread.',
    description: 'Create quotes and invoices, record payments, follow overdue balances and understand customer performance from the same business record.',
    stat: '91.6%',
    statLabel: 'collection visibility',
    chart: [36, 50, 45, 58, 67, 63, 82, 78, 92],
    rows: [
      { label: 'Invoices issued', value: '186', change: '+24' },
      { label: 'Collected', value: 'ETB 3.11M', change: '+16.8%' },
      { label: 'Overdue accounts', value: '11', change: '-4' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory & procurement',
    title: 'Know what is moving before stock becomes a problem.',
    description: 'Coordinate purchases, suppliers, stock movement, warehouse balances and reorder decisions with financial impact visible immediately.',
    stat: '98.4%',
    statLabel: 'stock visibility',
    chart: [64, 61, 71, 68, 79, 76, 87, 83, 93],
    rows: [
      { label: 'Fast-moving items', value: '148 SKUs', change: '+14' },
      { label: 'Reorder required', value: '12 SKUs', change: '-6' },
      { label: 'Open purchases', value: '24', change: '+3' },
    ],
  },
  {
    id: 'insight',
    label: 'Reporting & controls',
    title: 'Turn every transaction into a decision-ready answer.',
    description: 'Explore performance by branch, account, product, customer or period while preserving approvals, source documents and audit history.',
    stat: 'Live',
    statLabel: 'management position',
    chart: [33, 46, 43, 59, 56, 72, 70, 84, 96],
    rows: [
      { label: 'Gross sales', value: 'ETB 4.82M', change: '+18.6%' },
      { label: 'Expenses', value: 'ETB 784K', change: '-3.8%' },
      { label: 'Cash runway', value: '11.4 months', change: '+0.8' },
    ],
  },
];

const capabilities = [
  { number: '01', title: 'One operating truth', text: 'Sales, inventory, customers, suppliers and finance update the same connected business record.' },
  { number: '02', title: 'Controls inside the work', text: 'Roles, approvals, audit evidence and review checkpoints protect the processes that matter.' },
  { number: '03', title: 'Built for growing structure', text: 'Manage branches, teams, warehouses and reporting dimensions without creating duplicate systems.' },
  { number: '04', title: 'Answers with context', text: 'Move from a management metric to its underlying transaction and supporting record in a few steps.' },
];

const operations = [
  'General ledger', 'Sales & invoices', 'Cash management', 'Customer balances',
  'Inventory control', 'Procurement', 'Reconciliation', 'Management reports',
];

export function CampfireMarketingHome() {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const activeProduct = products[selectedProduct];

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
    <div className="cf-site">
      <section className="cf-hero">
        <div className="cf-hero-layout">
          <div className="cf-hero-copy">
            <span className="cf-eyebrow">Business operating system for Ethiopia</span>
            <h1>Finance, operations and decisions—connected.</h1>
            <p>Biloo ERP gives growing businesses one reliable system for sales, finance, inventory and management reporting.</p>
            <div className="cf-hero-actions">
              <Link className="cf-primary" href="/auth/email-sign-up">Start free</Link>
              <Link className="cf-secondary" href="/request-demo?source=homepage-hero">Book a product walkthrough</Link>
            </div>
            <div className="cf-trust-line">
              <span>ETB-first operations</span>
              <span>Multi-branch ready</span>
              <span>Guided onboarding</span>
            </div>
          </div>

          <div className="cf-product-stage" aria-label="Biloo ERP product preview">
            <div className="cf-dashboard-frame">
              <div className="cf-dashboard-topbar">
                <div className="cf-dashboard-brand"><Image src="/hisab-logo.svg" alt="" width={24} height={24} /><strong>Biloo ERP</strong></div>
                <div><span>Executive overview</span><b>MA</b></div>
              </div>
              <div className="cf-dashboard-body">
                <aside className="cf-dashboard-sidebar" aria-label="Product areas">
                  <strong>Workspace</strong>
                  <span className="active">Overview</span>
                  <span>Finance</span>
                  <span>Sales</span>
                  <span>Inventory</span>
                  <span>Reports</span>
                </aside>
                <div className="cf-dashboard-content">
                  <div className="cf-dashboard-heading">
                    <div><small>July 2026</small><strong>Business performance</strong></div>
                    <Link href="/product/reports-analytics">Generate report</Link>
                  </div>
                  <div className="cf-metrics">
                    <article><span>Net revenue</span><strong>ETB 4.82M</strong><em>+18.6%</em></article>
                    <article><span>Cash position</span><strong>ETB 2.48M</strong><em>+8.4%</em></article>
                    <article><span>Receivables</span><strong>ETB 1.36M</strong><em className="warning">11 overdue</em></article>
                  </div>
                  <div className="cf-analytics">
                    <article className="cf-chart-card">
                      <header><div><span>Revenue performance</span><strong>Monthly trend</strong></div><small>ETB</small></header>
                      <div className="cf-chart-area">
                        <svg viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Upward revenue trend">
                          <defs><linearGradient id="cfHeroChart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315EFB" stopOpacity=".18" /><stop offset="1" stopColor="#315EFB" stopOpacity="0" /></linearGradient></defs>
                          <path className="cf-chart-fill" d="M0,188 C65,174 78,150 134,160 C205,174 220,104 284,118 C348,132 365,72 424,88 C488,104 510,50 566,64 C604,73 620,38 640,28 L640,220 L0,220 Z" />
                          <path className="cf-chart-line" d="M0,188 C65,174 78,150 134,160 C205,174 220,104 284,118 C348,132 365,72 424,88 C488,104 510,50 566,64 C604,73 620,38 640,28" />
                        </svg>
                      </div>
                    </article>
                    <article className="cf-attention-card">
                      <header><div><span>Controls</span><strong>Needs attention</strong></div><small>3 items</small></header>
                      <ul>
                        <li><div><strong>Bank reconciliation</strong><small>3 unmatched transactions</small></div><b>Review</b></li>
                        <li><div><strong>Supplier payment</strong><small>Ready for approval</small></div><b>Approve</b></li>
                        <li><div><strong>Inventory reorder</strong><small>12 items below threshold</small></div><b>Open</b></li>
                      </ul>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cf-industries" aria-label="Industries">
        <p>Used across Ethiopian business sectors</p>
        <div>{['Retail', 'Wholesale', 'Services', 'Hospitality', 'Cooperatives', 'Multi-branch groups'].map((industry) => <span key={industry}>{industry}</span>)}</div>
      </section>

      <section className="cf-operations" aria-label="Platform capabilities">
        <div>{operations.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="cf-product-section" id="cf-product">
        <div className="cf-section-intro left">
          <span>Core product</span>
          <h2>One system for the work behind the numbers.</h2>
          <p>Every sale, payment, stock movement and approval updates the same business record.</p>
        </div>
        <div className="cf-product-explorer">
          <div className="cf-product-tabs" role="tablist" aria-label="Product areas">
            {products.map((product, index) => (
              <button
                id={`cf-product-tab-${product.id}`}
                key={product.id}
                type="button"
                role="tab"
                aria-controls={`cf-product-panel-${product.id}`}
                aria-selected={selectedProduct === index}
                className={selectedProduct === index ? 'active' : ''}
                tabIndex={selectedProduct === index ? 0 : -1}
                onClick={() => setSelectedProduct(index)}
                onKeyDown={(event) => moveProductFocus(event, index)}
              >
                <strong>{product.label}</strong>
              </button>
            ))}
          </div>
          <div id={`cf-product-panel-${activeProduct.id}`} className="cf-product-panel" role="tabpanel" aria-labelledby={`cf-product-tab-${activeProduct.id}`} tabIndex={0}>
            <div className="cf-product-copy">
              <span>{activeProduct.label}</span>
              <h3>{activeProduct.title}</h3>
              <p>{activeProduct.description}</p>
              <Link href="/product-tour">Explore the workflow</Link>
            </div>
            <div className="cf-mini-app">
              <header><div><strong>{activeProduct.stat}</strong><small>{activeProduct.statLabel}</small></div><span>Live</span></header>
              <div className="cf-mini-chart" aria-label={`${activeProduct.label} trend`}>{activeProduct.chart.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
              <div className="cf-mini-rows">{activeProduct.rows.map((row) => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong><em>{row.change}</em></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cf-platform-section">
        <div className="cf-platform-header"><div><span>Operational control</span><h2>Accountability without unnecessary process.</h2></div><p>Biloo connects operational speed with finance-grade controls, so teams can move while owners keep clear oversight.</p></div>
        <div className="cf-capability-grid">
          {capabilities.map((capability) => <article key={capability.number}><b>{capability.number}</b><div><h3>{capability.title}</h3><p>{capability.text}</p></div></article>)}
        </div>
      </section>

      <section className="cf-intelligence-section">
        <div className="cf-intelligence-copy">
          <span>Management reporting</span>
          <h2>Understand what changed and where to act.</h2>
          <p>Biloo turns daily transactions into current management context—without rebuilding the same spreadsheet every week.</p>
          <ul><li>Explain movement in revenue, cash and expenses</li><li>Trace answers back to source records</li><li>Preserve access controls and audit evidence</li></ul>
          <Link href="/product/reports-analytics">Explore reports and analytics</Link>
        </div>
        <div className="cf-intelligence-card">
          <header><div><strong>Operating expense variance</strong><small>July 2026 · compared with June</small></div><span>Permission aware</span></header>
          <div className="cf-intelligence-body">
            <p>Operating expenses increased by <strong>ETB 214,300</strong> this month.</p>
            <article><span>Logistics costs</span><strong>ETB 108,400</strong><small>51% of variance</small></article>
            <article><span>Temporary staffing</span><strong>ETB 72,800</strong><small>34% of variance</small></article>
            <Link href="/product/reports-analytics">View supporting transactions</Link>
          </div>
        </div>
      </section>

      <section className="cf-solutions-section">
        <div className="cf-section-intro left"><span>Built for growth</span><h2>Start with today’s workflow. Expand without rebuilding.</h2><p>Configure Biloo around your current operation, then add teams, branches and reporting dimensions as the business grows.</p></div>
        <div className="cf-solutions-grid">
          <article className="large"><span>Multi-branch operations</span><h3>See the whole organization without losing local detail.</h3><p>Standardize controls and reporting while preserving the visibility each branch and operating team needs.</p><div><strong>Biloo Group</strong><span>Addis HQ</span><span>Adama Branch</span><span>Hawassa Branch</span></div></article>
          <article><span>Localized by design</span><p>ETB-first records and Ethiopian operating context are built into the experience.</p></article>
          <article><span>Granular access</span><p>Give each role appropriate access across modules, branches and approvals.</p></article>
          <article><span>Guided implementation</span><p>Move legacy records with structured setup and reconciliation support.</p></article>
        </div>
      </section>

      <section className="cf-local-section">
        <div className="cf-local-copy"><span>Built in Ethiopia</span><h2>Local operating context. International software standard.</h2><p>Biloo is shaped around Ethiopian financial realities, team workflows and connectivity conditions from the start.</p></div>
        <dl className="cf-local-facts"><div><dt>Currency</dt><dd>ETB-first records</dd></div><div><dt>Support</dt><dd>Local onboarding</dd></div><div><dt>Access</dt><dd>Desktop to mobile</dd></div><div><dt>Control</dt><dd>Finance-grade auditability</dd></div></dl>
      </section>

      <section className="cf-outcomes">
        <article className="before"><span>Before Biloo ERP</span><h3>Disconnected records delay decisions.</h3><ul><li>Different teams maintain different versions</li><li>Operations and finance rely on manual handoffs</li><li>Reports require repeated preparation</li></ul></article>
        <article className="after"><span>With Biloo ERP</span><h3>Every team works from the same operating record.</h3><ul><li>Core functions share one system</li><li>Financial and operational visibility stays current</li><li>Controls are part of the workflow</li></ul></article>
      </section>

      <section className="cf-final-cta">
        <div><span>See Biloo in your workflow</span><h2>Run the business from one dependable system.</h2><p>Walk through your current processes with HisabTech and see where Biloo can simplify the work.</p><div><Link className="cf-primary" href="/request-demo?source=campfire-final">Book a walkthrough</Link><Link className="cf-secondary" href="/auth/email-sign-up">Start free</Link></div></div>
      </section>
    </div>
  );
}
