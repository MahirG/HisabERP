'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type IconName =
  | 'arrow'
  | 'menu'
  | 'close'
  | 'check'
  | 'spark'
  | 'chart'
  | 'box'
  | 'people'
  | 'shield'
  | 'layers'
  | 'globe'
  | 'clock'
  | 'receipt'
  | 'wallet'
  | 'building'
  | 'lock'
  | 'zap'
  | 'message'
  | 'trend'
  | 'file';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'arrow':
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'close':
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case 'spark':
      return <svg {...common}><path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" /></svg>;
    case 'chart':
      return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /></svg>;
    case 'box':
      return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>;
    case 'people':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case 'layers':
      return <svg {...common}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>;
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'receipt':
      return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case 'wallet':
      return <svg {...common}><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M15 11h5v4h-5a2 2 0 0 1 0-4Z" /></svg>;
    case 'building':
      return <svg {...common}><path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" /></svg>;
    case 'lock':
      return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case 'zap':
      return <svg {...common}><path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" /></svg>;
    case 'message':
      return <svg {...common}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 9h8M8 13h5" /></svg>;
    case 'trend':
      return <svg {...common}><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></svg>;
    case 'file':
      return <svg {...common}><path d="M6 2h8l4 4v16H6V2Z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></svg>;
  }
}

const products = [
  {
    id: 'finance',
    label: 'Finance & accounting',
    title: 'Close the month with a ledger that explains itself.',
    description: 'Keep journals, reconciliations, approvals, customer balances, supplier obligations and financial statements connected in one controlled workspace.',
    icon: 'receipt' as IconName,
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
    icon: 'wallet' as IconName,
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
    icon: 'box' as IconName,
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
    icon: 'chart' as IconName,
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
  { number: '01', icon: 'layers' as IconName, title: 'One operating truth', text: 'Sales, inventory, customers, suppliers and finance update the same connected business record.' },
  { number: '02', icon: 'shield' as IconName, title: 'Controls inside the work', text: 'Roles, approvals, audit evidence and review checkpoints protect the processes that matter.' },
  { number: '03', icon: 'building' as IconName, title: 'Built for growing structure', text: 'Manage branches, teams, warehouses and reporting dimensions without creating duplicate systems.' },
  { number: '04', icon: 'chart' as IconName, title: 'Answers with context', text: 'Move from a management metric to its underlying transaction and supporting record in a few steps.' },
];

const operations = [
  'General ledger', 'Sales & invoices', 'Cash management', 'Customer balances', 'Inventory control', 'Procurement',
  'Supplier obligations', 'Reconciliation', 'Management reports', 'Audit trails', 'Multi-branch visibility', 'ETB-first workflows',
];

export function CampfireMarketingHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const activeProduct = products[selectedProduct];

  return (
    <div className="cf-site">
      <a className="cf-skip" href="#cf-main">Skip to content</a>

      <div className="cf-announcement">
        <span className="cf-announcement-dot" />
        <span>Biloo ERP is the business operating system by HisabTech.</span>
        <Link href="/product-tour">Explore the product <Icon name="arrow" size={14} /></Link>
      </div>

      <header className="cf-header">
        <div className="cf-navbar">
          <Link className="cf-brand" href="/" aria-label="HisabTech home">
            <span className="cf-logo"><Image src="/hisab-logo.svg" alt="" width={42} height={42} priority /></span>
            <span><strong>HisabTech</strong><small>Biloo ERP</small></span>
          </Link>

          <nav className="cf-desktop-nav" aria-label="Primary navigation">
            <a href="#cf-product">Product</a>
            <Link href="/industries">Industries</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/trust">Trust</Link>
            <Link href="/about">Company</Link>
          </nav>

          <div className="cf-nav-actions">
            <Link className="cf-login" href="/auth/login">Log in</Link>
            <Link className="cf-button-small" href="/request-demo?source=campfire-redesign">Request a demo <Icon name="arrow" size={15} /></Link>
            <button className="cf-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={21} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="cf-mobile-nav" aria-label="Mobile navigation">
            <a href="#cf-product" onClick={() => setMenuOpen(false)}>Product</a>
            <Link href="/industries">Industries</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/trust">Trust</Link>
            <Link href="/about">Company</Link>
            <Link href="/auth/login">Log in</Link>
            <Link className="cf-mobile-cta" href="/request-demo?source=mobile-navigation">Request a demo</Link>
          </nav>
        )}
      </header>

      <main id="cf-main">
        <section className="cf-hero">
          <div className="cf-hero-glow" aria-hidden="true" />
          <div className="cf-hero-grid" aria-hidden="true" />
          <div className="cf-hero-copy">
            <span className="cf-eyebrow"><Icon name="spark" size={15} /> Intelligent ERP for modern Ethiopian businesses</span>
            <h1>Your entire business, finally working from <em>one clear system.</em></h1>
            <p>Biloo ERP by HisabTech connects sales, finance, inventory, customers, suppliers and management reporting—so your team moves faster without losing control.</p>
            <div className="cf-hero-actions">
              <Link className="cf-primary" href="/auth/email-sign-up">Start free <Icon name="arrow" /></Link>
              <Link className="cf-secondary" href="/request-demo?source=homepage-hero">Book a product walkthrough</Link>
            </div>
            <div className="cf-trust-line">
              <span><Icon name="check" size={15} /> ETB-first operations</span>
              <span><Icon name="check" size={15} /> Multi-branch ready</span>
              <span><Icon name="check" size={15} /> Mobile-responsive</span>
            </div>
          </div>

          <div className="cf-product-stage" aria-label="Biloo ERP product preview">
            <div className="cf-dashboard-frame">
              <div className="cf-dashboard-topbar">
                <div className="cf-window-dots"><span /><span /><span /></div>
                <strong>Executive overview</strong>
                <div><span>July 2026</span><b>MA</b></div>
              </div>
              <div className="cf-dashboard-body">
                <aside className="cf-dashboard-sidebar" aria-hidden="true">
                  <span className="cf-sidebar-logo"><Image src="/hisab-logo.svg" alt="" width={27} height={27} /></span>
                  {(['chart', 'receipt', 'wallet', 'box', 'people'] as IconName[]).map((icon, index) => <span className={index === 0 ? 'active' : ''} key={icon}><Icon name={icon} size={17} /></span>)}
                </aside>
                <div className="cf-dashboard-content">
                  <div className="cf-dashboard-heading">
                    <div><small>Good morning, Mahir</small><strong>Here is how the business is performing.</strong></div>
                    <button type="button">Generate report</button>
                  </div>
                  <div className="cf-metrics">
                    <article><span>Net revenue</span><strong>ETB 4.82M</strong><em><Icon name="trend" size={12} /> 18.6%</em></article>
                    <article><span>Cash position</span><strong>ETB 2.48M</strong><em><Icon name="trend" size={12} /> 8.4%</em></article>
                    <article><span>Receivables</span><strong>ETB 1.36M</strong><em className="warning">11 overdue</em></article>
                    <article><span>Gross margin</span><strong>42.8%</strong><em><Icon name="trend" size={12} /> 2.4%</em></article>
                  </div>
                  <div className="cf-analytics">
                    <article className="cf-chart-card">
                      <header><div><span>Revenue performance</span><strong>Monthly trend</strong></div><small>ETB</small></header>
                      <div className="cf-chart-area">
                        <svg viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Upward revenue trend">
                          <defs><linearGradient id="cfHeroChart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCA311" stopOpacity=".34" /><stop offset="1" stopColor="#FCA311" stopOpacity="0" /></linearGradient></defs>
                          <path className="cf-chart-fill" d="M0,188 C65,174 78,150 134,160 C205,174 220,104 284,118 C348,132 365,72 424,88 C488,104 510,50 566,64 C604,73 620,38 640,28 L640,220 L0,220 Z" />
                          <path className="cf-chart-line" d="M0,188 C65,174 78,150 134,160 C205,174 220,104 284,118 C348,132 365,72 424,88 C488,104 510,50 566,64 C604,73 620,38 640,28" />
                        </svg>
                      </div>
                    </article>
                    <article className="cf-attention-card">
                      <header><div><span>Live controls</span><strong>Needs attention</strong></div><small>4</small></header>
                      <ul>
                        <li><i><Icon name="file" size={15} /></i><div><strong>Bank reconciliation</strong><small>3 unmatched transactions</small></div><b>Review</b></li>
                        <li><i><Icon name="clock" size={15} /></i><div><strong>Supplier payment</strong><small>Ready for approval</small></div><b>Approve</b></li>
                        <li><i><Icon name="box" size={15} /></i><div><strong>Inventory reorder</strong><small>12 items below threshold</small></div><b>Open</b></li>
                      </ul>
                    </article>
                  </div>
                </div>
              </div>
            </div>
            <div className="cf-float cf-float-left"><i><Icon name="check" size={15} /></i><div><strong>Payment approved</strong><small>ETB 184,500 · just now</small></div></div>
            <div className="cf-float cf-float-right"><i><Icon name="spark" size={15} /></i><div><strong>Variance detected</strong><small>Expenses are 14% above plan</small></div></div>
          </div>
        </section>

        <section className="cf-industries" aria-label="Industries">
          <p>Designed for teams across</p>
          <div>{['Retail', 'Wholesale', 'Services', 'Hospitality', 'Cooperatives', 'Multi-branch groups'].map((industry) => <span key={industry}>{industry}</span>)}</div>
        </section>

        <section className="cf-marquee" aria-label="Platform capabilities">
          <div>{[...operations, ...operations].map((item, index) => <span key={`${item}-${index}`}><i />{item}</span>)}</div>
        </section>

        <section className="cf-product-section" id="cf-product">
          <div className="cf-section-intro">
            <span>Explore Biloo ERP</span>
            <h2>One connected platform for the work that runs your business.</h2>
            <p>Replace disconnected notebooks and spreadsheets with a system where every operational event becomes reliable financial context.</p>
          </div>
          <div className="cf-product-explorer">
            <div className="cf-product-tabs" role="tablist" aria-label="Product areas">
              {products.map((product, index) => (
                <button key={product.id} type="button" role="tab" aria-selected={selectedProduct === index} className={selectedProduct === index ? 'active' : ''} onClick={() => setSelectedProduct(index)}>
                  <i><Icon name={product.icon} size={18} /></i><span><strong>{product.label}</strong><small>{product.title}</small></span><Icon name="arrow" size={16} />
                </button>
              ))}
            </div>
            <div className="cf-product-panel" role="tabpanel">
              <div className="cf-product-copy">
                <i><Icon name={activeProduct.icon} size={22} /></i>
                <span>{activeProduct.label}</span>
                <h3>{activeProduct.title}</h3>
                <p>{activeProduct.description}</p>
                <Link href="/product-tour">Explore the workflow <Icon name="arrow" size={15} /></Link>
              </div>
              <div className="cf-mini-app">
                <header><div><strong>{activeProduct.stat}</strong><small>{activeProduct.statLabel}</small></div><span><i />Live</span></header>
                <div className="cf-mini-chart">{activeProduct.chart.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
                <div className="cf-mini-rows">{activeProduct.rows.map((row) => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong><em>{row.change}</em></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cf-platform-section">
          <div className="cf-platform-header"><div><span>Built as a system</span><h2>Control without slowing the business down.</h2></div><p>Biloo ERP combines operational speed with finance-grade accountability, allowing teams to move quickly while owners maintain oversight.</p></div>
          <div className="cf-capability-grid">
            {capabilities.map((capability, index) => <article className={index === 0 ? 'featured' : ''} key={capability.number}><b>{capability.number}</b><i><Icon name={capability.icon} size={21} /></i><h3>{capability.title}</h3><p>{capability.text}</p>{index === 0 && <div className="cf-flow" aria-hidden="true"><span>Sales</span><i /><span>Inventory</span><i /><span>Finance</span><i /><span>Insight</span></div>}</article>)}
          </div>
        </section>

        <section className="cf-intelligence-section">
          <div className="cf-intelligence-copy">
            <span><Icon name="spark" size={15} /> Decision intelligence</span>
            <h2>See what changed, why it matters and where to act next.</h2>
            <p>Biloo ERP turns daily transactions into a management conversation—highlighting trends, overdue exposure, stock risk and operational exceptions without rebuilding the same spreadsheet.</p>
            <ul><li><Icon name="check" size={17} /> Explain movement in revenue, cash and expenses</li><li><Icon name="check" size={17} /> Trace every answer back to source records</li><li><Icon name="check" size={17} /> Preserve access controls and audit evidence</li></ul>
            <Link href="/product/reports-analytics">Explore reports and analytics <Icon name="arrow" size={15} /></Link>
          </div>
          <div className="cf-intelligence-card">
            <header><div><i><Icon name="spark" size={16} /></i><span><strong>Management insight</strong><small>Grounded in live records</small></span></div><span><Icon name="lock" size={13} /> Permission aware</span></header>
            <div className="cf-intelligence-body">
              <div className="cf-question">Why did operating expenses increase this month?</div>
              <div className="cf-answer"><i><Icon name="spark" size={13} /></i><div><p>Operating expenses increased by <strong>ETB 214,300 (14.2%)</strong> compared with June.</p><article><b>1</b><span><strong>Logistics costs</strong><small>ETB 108,400 increase · 51% of variance</small></span></article><article><b>2</b><span><strong>Temporary staffing</strong><small>ETB 72,800 increase · 34% of variance</small></span></article><button type="button">View supporting transactions <Icon name="arrow" size={13} /></button></div></div>
            </div>
          </div>
        </section>

        <section className="cf-solutions-section">
          <div className="cf-section-intro left"><span>Built for complexity</span><h2>Ready for the business you are becoming.</h2><p>Start with the workflows needed today, then expand across branches, teams and reporting requirements as the organization grows.</p></div>
          <div className="cf-solutions-grid">
            <article className="large"><div><span><Icon name="building" size={18} /> Multi-branch operations</span><h3>See the whole organization without losing local detail.</h3><p>Standardize controls and reporting while preserving the visibility each branch and operating team needs.</p></div><div className="cf-entity-map"><strong>Biloo Group</strong><i /><div><span>Addis HQ</span><span>Adama Branch</span><span>Hawassa Branch</span></div></div></article>
            <article><i><Icon name="globe" size={20} /></i><h3>Localized by design</h3><p>ETB-first records, Ethiopian operating context and responsive access are built into the experience.</p></article>
            <article><i><Icon name="lock" size={20} /></i><h3>Granular access</h3><p>Give every role the access it needs across modules, branches, workflows and approvals.</p></article>
            <article><i><Icon name="zap" size={20} /></i><h3>Guided implementation</h3><p>Move from legacy records using structured setup, migration templates and clear reconciliation.</p></article>
            <article><i><Icon name="chart" size={20} /></i><h3>Decision-ready finance</h3><p>Bring actuals, balances, operating drivers and management signals into one business picture.</p></article>
          </div>
        </section>

        <section className="cf-local-section">
          <div className="cf-local-visual"><div className="cf-ring one" /><div className="cf-ring two" /><div className="cf-local-core"><Image src="/hisab-logo.svg" alt="HisabTech" width={88} height={88} /><span>Built in Ethiopia</span><strong>World-class by design</strong></div><b className="tag one">ETB</b><b className="tag two">ERP</b><b className="tag three">ADDIS</b></div>
          <div className="cf-local-copy"><span>Local context. Global standard.</span><h2>Software that understands how Ethiopian businesses actually operate.</h2><p>Biloo ERP is shaped around local financial realities, team workflows, connectivity conditions and growth ambitions—not retrofitted after the fact.</p><div>{['Ethiopian birr-first workflows', 'Business structures for local teams', 'Desktop, tablet and mobile access', 'Low-bandwidth conscious design', 'Local onboarding and support', 'Finance-grade controls and auditability'].map((item) => <span key={item}><Icon name="check" size={15} />{item}</span>)}</div></div>
        </section>

        <section className="cf-outcomes">
          <article className="before"><span>Before Biloo ERP</span><h3>Disconnected work creates expensive uncertainty.</h3><ul><li><Icon name="close" size={15} /> Multiple records telling different stories</li><li><Icon name="close" size={15} /> Manual handoffs between operations and finance</li><li><Icon name="close" size={15} /> Decisions delayed by report preparation</li><li><Icon name="close" size={15} /> Limited auditability and control</li></ul></article>
          <i className="cf-outcome-arrow"><Icon name="arrow" size={21} /></i>
          <article className="after"><span>With Biloo ERP</span><h3>Every team works from the same operational truth.</h3><ul><li><Icon name="check" size={15} /> One system across core business functions</li><li><Icon name="check" size={15} /> Real-time financial and operational visibility</li><li><Icon name="check" size={15} /> Controls embedded directly into workflows</li><li><Icon name="check" size={15} /> Faster answers with complete context</li></ul></article>
        </section>

        <section className="cf-final-cta">
          <div><span><Icon name="message" size={15} /> A better operating system starts here</span><h2>See what your team can do with Biloo ERP.</h2><p>Walk through the current processes with HisabTech and see how one connected system can simplify, control and strengthen the work behind the business.</p><div><Link className="cf-primary gold" href="/request-demo?source=campfire-final">Book a walkthrough <Icon name="arrow" /></Link><Link className="cf-secondary dark" href="/auth/email-sign-up">Start free</Link></div></div>
        </section>
      </main>

      <footer className="cf-footer">
        <div className="cf-footer-top">
          <div><Link className="cf-brand footer" href="/"><span className="cf-logo"><Image src="/hisab-logo.svg" alt="" width={42} height={42} /></span><span><strong>HisabTech</strong><small>Biloo ERP</small></span></Link><p>The connected business operating system for ambitious Ethiopian organizations.</p></div>
          <div className="cf-footer-links"><div><strong>Product</strong><Link href="/product-tour">Product tour</Link><Link href="/pricing">Pricing</Link><Link href="/integrations">Integrations</Link><Link href="/migration">Migration</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/customer-stories">Customer proof</Link><Link href="/trust">Trust Center</Link><Link href="/resources">Resources</Link></div><div><strong>Get started</strong><Link href="/request-demo">Request a demo</Link><Link href="/auth/email-sign-up">Start free</Link><Link href="/auth/login">Log in</Link><Link href="/help-center">Help Center</Link></div></div>
        </div>
        <div className="cf-footer-bottom"><span>© {new Date().getFullYear()} HisabTech. Addis Ababa, Ethiopia.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
      </footer>
    </div>
  );
}
