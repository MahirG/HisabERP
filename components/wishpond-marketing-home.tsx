'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';

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
  | 'file'
  | 'bank'
  | 'branch'
  | 'phone'
  | 'search'
  | 'plus'
  | 'play'
  | 'chevron';

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
    case 'arrow': return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case 'menu': return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'close': return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case 'check': return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case 'spark': return <svg {...common}><path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" /></svg>;
    case 'chart': return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /></svg>;
    case 'box': return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>;
    case 'people': return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'shield': return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case 'layers': return <svg {...common}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>;
    case 'globe': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
    case 'clock': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'receipt': return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case 'wallet': return <svg {...common}><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M15 11h5v4h-5a2 2 0 0 1 0-4Z" /></svg>;
    case 'building': return <svg {...common}><path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" /></svg>;
    case 'lock': return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case 'zap': return <svg {...common}><path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" /></svg>;
    case 'message': return <svg {...common}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 9h8M8 13h5" /></svg>;
    case 'trend': return <svg {...common}><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></svg>;
    case 'file': return <svg {...common}><path d="M6 2h8l4 4v16H6V2Z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></svg>;
    case 'bank': return <svg {...common}><path d="m3 9 9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" /></svg>;
    case 'branch': return <svg {...common}><circle cx="6" cy="5" r="2" /><circle cx="18" cy="5" r="2" /><circle cx="12" cy="19" r="2" /><path d="M6 7v3c0 2 1.5 3 3.5 3h5c2 0 3.5-1 3.5-3V7M12 13v4" /></svg>;
    case 'phone': return <svg {...common}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>;
    case 'search': return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
    case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'play': return <svg {...common}><path d="m9 7 8 5-8 5V7Z" /></svg>;
    case 'chevron': return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>;
  }
}

const productViews = [
  {
    id: 'overview', label: 'Management overview', icon: 'chart' as IconName,
    eyebrow: 'Know where the business stands', title: 'A live operating picture, not a month-old report.',
    description: 'See sales, cash, receivables, expenses, stock pressure and branch performance together. Every number remains connected to its source transaction.',
    primary: 'ETB 4.82M', primaryLabel: 'Gross sales this month', change: '+18.6%', bars: [38,54,47,66,61,75,70,88,83,96],
    rows: [['Cash position','ETB 2.48M','+8.4%'],['Receivables','ETB 1.36M','+12.1%'],['Operating margin','42.8%','+2.4%']],
  },
  {
    id: 'sales', label: 'Sales & collection', icon: 'wallet' as IconName,
    eyebrow: 'Protect revenue from quote to cash', title: 'Every invoice, payment and overdue balance in one flow.',
    description: 'Create quotes and invoices, record collections and understand customer exposure without rebuilding the story in spreadsheets.',
    primary: '91.6%', primaryLabel: 'Collection visibility', change: '+6.2%', bars: [44,39,55,50,64,72,68,81,77,93],
    rows: [['Invoices issued','186','+24'],['Collected','ETB 3.11M','+16.8%'],['Overdue accounts','11','-4']],
  },
  {
    id: 'inventory', label: 'Inventory & buying', icon: 'box' as IconName,
    eyebrow: 'Keep stock and money synchronized', title: 'Know what is moving before stock becomes a problem.',
    description: 'Track purchasing, suppliers, warehouses, stock movement and reorder pressure with the financial impact visible immediately.',
    primary: '98.4%', primaryLabel: 'Stock visibility', change: '+4.1%', bars: [57,63,59,70,67,79,74,86,82,94],
    rows: [['Fast-moving items','148 SKUs','+14'],['Reorder required','12 SKUs','-6'],['Open purchases','24','+3']],
  },
  {
    id: 'finance', label: 'Finance & controls', icon: 'receipt' as IconName,
    eyebrow: 'Make the ledger explain itself', title: 'Close faster with approvals, evidence and history intact.',
    description: 'Keep journals, reconciliations, source documents and review checkpoints in one controlled workspace built for accountability.',
    primary: '100%', primaryLabel: 'Traceable entries', change: 'Live', bars: [35,49,45,58,64,60,76,72,87,91],
    rows: [['Entries reviewed','248','+31'],['Pending approvals','7','-9'],['Reconciled accounts','96%','+5%']],
  },
];

const operatingPillars = [
  { icon: 'wallet' as IconName, overline: 'Capture', title: 'Record the work once.', text: 'Sales, purchases, payments, expenses and stock movements enter one consistent operating record.', links: ['Invoices','Receipts','Payments','Purchases'] },
  { icon: 'layers' as IconName, overline: 'Connect', title: 'Let every function update the next.', text: 'Customer, supplier, inventory and financial records stay synchronized as the business moves.', links: ['Customers','Suppliers','Inventory','Ledger'] },
  { icon: 'shield' as IconName, overline: 'Control', title: 'Build accountability into the flow.', text: 'Roles, approvals, audit evidence and review checkpoints protect important decisions without slowing teams down.', links: ['Permissions','Approvals','Audit trail','Documents'] },
  { icon: 'trend' as IconName, overline: 'Understand', title: 'Turn activity into a clear answer.', text: 'Management sees performance by branch, account, customer, product and period—with context one click away.', links: ['Dashboards','Reports','Branches','Forecasting'] },
];

const journeySteps = [
  { number: '01', icon: 'receipt' as IconName, title: 'Run daily operations', text: 'Your team records real work through fast, role-specific workflows.' },
  { number: '02', icon: 'branch' as IconName, title: 'Keep everything connected', text: 'Each transaction updates the balances, stock and management position it affects.' },
  { number: '03', icon: 'shield' as IconName, title: 'Review with confidence', text: 'Approvals, history and source documents keep important activity explainable.' },
  { number: '04', icon: 'chart' as IconName, title: 'Decide from live context', text: 'Leaders move from a metric to the underlying record without waiting for a report cycle.' },
];

const audienceCards = [
  { icon: 'building' as IconName, title: 'Growing companies', text: 'Replace disconnected tools with a system that can support more people, branches and complexity.' },
  { icon: 'branch' as IconName, title: 'Multi-branch operations', text: 'See local activity and consolidated performance without creating duplicate records.' },
  { icon: 'people' as IconName, title: 'Finance-led teams', text: 'Give operations speed while preserving the controls, evidence and structure finance needs.' },
];

const faqs = [
  ['What does Biloo ERP bring together?', 'Biloo ERP connects core finance, sales, receivables, inventory, procurement, supplier activity, branch visibility and management reporting in one operating environment.'],
  ['Is it designed for Ethiopian businesses?', 'Yes. The product is positioned around ETB-first workflows, Ethiopian operating realities and organizations that need modern control without importing unnecessary complexity.'],
  ['Can we start with one team or branch?', 'Yes. The system is designed to support a focused starting point and expand as your processes, users, branches and reporting needs grow.'],
  ['How do we see the product before deciding?', 'Use the product tour for a self-guided overview or request a walkthrough for a guided discussion around your current workflows.'],
];

export function WishpondMarketingHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const activeView = productViews[selectedView];

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="wp-site">
      <a className="wp-skip" href="#wp-main">Skip to content</a>
      <div className="wp-announcement"><span className="wp-announcement-pulse" /><span>Biloo ERP brings the operating core of your business into one clear system.</span><Link href="/product-tour">Explore Biloo <Icon name="arrow" size={14} /></Link></div>

      <header className="wp-header">
        <div className="wp-nav-shell">
          <Link className="wp-brand" href="/" aria-label="HisabTech home"><span className="wp-brand-mark"><Image src="/hisab-logo.svg" alt="" width={42} height={42} priority /></span><span className="wp-brand-copy"><strong>HisabTech</strong><small>Biloo ERP</small></span></Link>
          <nav className="wp-desktop-nav" aria-label="Primary navigation"><a href="#platform">Platform</a><a href="#solutions">Solutions</a><Link href="/industries">Industries</Link><Link href="/pricing">Pricing</Link><Link href="/trust">Trust</Link><Link href="/about">Company</Link></nav>
          <div className="wp-nav-actions"><Link className="wp-login" href="/auth/login">Log in</Link><Link className="wp-nav-cta" href="/request-demo?source=wishpond-redesign">Request a demo <Icon name="arrow" size={15} /></Link><button className="wp-menu" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((value) => !value)}><Icon name={menuOpen ? 'close' : 'menu'} size={21} /></button></div>
        </div>
        {menuOpen && <nav className="wp-mobile-nav" aria-label="Mobile navigation"><a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a><a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a><Link href="/industries">Industries</Link><Link href="/pricing">Pricing</Link><Link href="/trust">Trust</Link><Link href="/about">Company</Link><Link href="/auth/login">Log in</Link><Link className="wp-mobile-cta" href="/request-demo?source=wishpond-mobile">Request a demo</Link></nav>}
      </header>

      <main id="wp-main">
        <section className="wp-hero">
          <div className="wp-hero-orb wp-hero-orb-one" aria-hidden="true" /><div className="wp-hero-orb wp-hero-orb-two" aria-hidden="true" /><div className="wp-hero-grid" aria-hidden="true" />
          <div className="wp-container wp-hero-layout">
            <div className="wp-hero-copy" data-reveal>
              <span className="wp-kicker"><Icon name="spark" size={15} /> The connected operating system for Ethiopian business</span>
              <h1>Run every part of your business with <em>clarity built in.</em></h1>
              <p>Biloo ERP connects sales, finance, inventory, customers, suppliers and reporting—so your team can move quickly while management stays informed and in control.</p>
              <div className="wp-hero-actions"><Link className="wp-button wp-button-primary" href="/auth/email-sign-up">Start free <Icon name="arrow" /></Link><Link className="wp-button wp-button-secondary" href="/request-demo?source=wishpond-hero"><span className="wp-play"><Icon name="play" size={14} /></span> See how it works</Link></div>
              <div className="wp-hero-assurance"><span><Icon name="check" size={15} /> ETB-first workflows</span><span><Icon name="check" size={15} /> Multi-branch ready</span><span><Icon name="check" size={15} /> Role-based control</span></div>
            </div>

            <div className="wp-hero-visual" data-reveal>
              <div className="wp-float-card wp-float-card-sales"><span className="wp-float-icon"><Icon name="trend" size={16} /></span><span><small>Sales this month</small><strong>ETB 4.82M</strong></span><b>+18.6%</b></div>
              <div className="wp-float-card wp-float-card-stock"><span className="wp-float-icon"><Icon name="box" size={16} /></span><span><small>Stock attention</small><strong>12 items</strong></span></div>
              <div className="wp-app-window">
                <div className="wp-app-topbar"><div className="wp-window-dots"><span /><span /><span /></div><strong>Management overview</strong><div className="wp-app-user"><span>July 2026</span><b>MA</b></div></div>
                <div className="wp-app-body">
                  <aside className="wp-app-sidebar" aria-hidden="true"><span className="wp-sidebar-logo"><Image src="/hisab-logo.svg" alt="" width={28} height={28} /></span><span className="active"><Icon name="chart" size={17} /></span><span><Icon name="wallet" size={17} /></span><span><Icon name="receipt" size={17} /></span><span><Icon name="box" size={17} /></span><span><Icon name="people" size={17} /></span></aside>
                  <div className="wp-app-content">
                    <div className="wp-app-heading"><div><small>Good evening, Mahir</small><strong>Here is how the business is moving.</strong></div><button type="button"><Icon name="plus" size={13} /> New transaction</button></div>
                    <div className="wp-app-metrics"><article><span>Gross sales</span><strong>ETB 4.82M</strong><em>↑ 18.6%</em></article><article><span>Cash position</span><strong>ETB 2.48M</strong><em>↑ 8.4%</em></article><article><span>Receivables</span><strong>ETB 1.36M</strong><em className="warning">11 overdue</em></article></div>
                    <div className="wp-app-analytics">
                      <article className="wp-app-chart-card"><div className="wp-card-heading"><span><small>Revenue movement</small><strong>Last 10 periods</strong></span><b>Live</b></div><div className="wp-mini-chart" aria-hidden="true">{[36,47,42,58,54,69,65,77,73,89,84,96].map((height,index) => <span key={index} style={{ height: `${height}%` }} />)}</div></article>
                      <article className="wp-app-attention"><div className="wp-card-heading"><span><small>Needs attention</small><strong>Today</strong></span><b>4</b></div><ul><li><span className="amber"><Icon name="receipt" size={14} /></span><div><strong>7 approvals pending</strong><small>Finance review</small></div></li><li><span><Icon name="box" size={14} /></span><div><strong>12 items to reorder</strong><small>Inventory</small></div></li><li><span><Icon name="wallet" size={14} /></span><div><strong>11 overdue accounts</strong><small>Receivables</small></div></li></ul></article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="wp-proof-strip" aria-label="Platform highlights"><div className="wp-container wp-proof-grid"><div><strong>One</strong><span>connected business record</span></div><div><strong>Live</strong><span>management visibility</span></div><div><strong>Built-in</strong><span>approvals and audit history</span></div><div><strong>Ready</strong><span>for branches, teams and growth</span></div></div></section>

        <section className="wp-section wp-intro" id="platform"><div className="wp-container"><div className="wp-section-heading wp-heading-centered" data-reveal><span className="wp-kicker"><Icon name="layers" size={15} /> One platform, four connected outcomes</span><h2>Your business should not have to choose between speed and control.</h2><p>Biloo gives operating teams simple workflows and gives leaders the structure, visibility and evidence needed to manage with confidence.</p></div><div className="wp-pillar-grid">{operatingPillars.map((pillar,index) => <article className="wp-pillar-card" data-reveal key={pillar.title} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="wp-pillar-top"><span className="wp-pillar-icon"><Icon name={pillar.icon} size={22} /></span><b>{pillar.overline}</b></div><h3>{pillar.title}</h3><p>{pillar.text}</p><div className="wp-pillar-links">{pillar.links.map((link) => <span key={link}><Icon name="check" size={13} /> {link}</span>)}</div></article>)}</div></div></section>

        <section className="wp-section wp-product-explorer" id="solutions"><div className="wp-container"><div className="wp-section-heading wp-heading-split" data-reveal><div><span className="wp-kicker wp-kicker-light"><Icon name="spark" size={15} /> See the system through the work</span><h2>From daily activity to management insight.</h2></div><p>Explore how the same connected record supports different teams without fragmenting the business into separate versions of the truth.</p></div><div className="wp-explorer" data-reveal>
          <div className="wp-explorer-tabs" role="tablist" aria-label="Biloo ERP workspaces">{productViews.map((view,index) => <button key={view.id} type="button" role="tab" aria-selected={selectedView === index} className={selectedView === index ? 'active' : ''} onClick={() => setSelectedView(index)}><span><Icon name={view.icon} size={18} /></span>{view.label}<Icon name="chevron" size={15} /></button>)}</div>
          <div className="wp-explorer-copy"><span>{activeView.eyebrow}</span><h3>{activeView.title}</h3><p>{activeView.description}</p><Link href="/product-tour">Explore the full product <Icon name="arrow" size={16} /></Link></div>
          <div className="wp-explorer-preview"><div className="wp-preview-head"><span><small>{activeView.primaryLabel}</small><strong>{activeView.primary}</strong></span><b>{activeView.change}</b></div><div className="wp-preview-chart" aria-hidden="true">{activeView.bars.map((height,index) => <span key={`${activeView.id}-${index}`} style={{ height: `${height}%` }} />)}</div><div className="wp-preview-rows">{activeView.rows.map(([label,value,change]) => <div key={label}><span>{label}</span><strong>{value}</strong><b>{change}</b></div>)}</div></div>
        </div></div></section>

        <section className="wp-section wp-story-section"><div className="wp-container wp-story-layout">
          <div className="wp-story-copy" data-reveal><span className="wp-kicker"><Icon name="zap" size={15} /> The difference is connection</span><h2>Stop managing the gaps between your tools.</h2><p>When sales, stock, suppliers, cash and finance live apart, teams spend time reconciling systems instead of improving the business. Biloo keeps the operational story intact from the first transaction to the final report.</p><ul><li><span><Icon name="check" size={15} /></span><div><strong>Less repeated entry</strong><small>Record activity once and let connected balances update.</small></div></li><li><span><Icon name="check" size={15} /></span><div><strong>Fewer reporting surprises</strong><small>See movement while it happens instead of after month-end.</small></div></li><li><span><Icon name="check" size={15} /></span><div><strong>Clearer accountability</strong><small>Keep decisions, approvals and source records attached to the work.</small></div></li></ul><Link className="wp-text-link" href="/request-demo?source=connection-story">Discuss your workflow <Icon name="arrow" size={16} /></Link></div>
          <div className="wp-connection-map" data-reveal><div className="wp-map-glow" aria-hidden="true" /><div className="wp-map-center"><span><Image src="/hisab-logo.svg" alt="" width={52} height={52} /></span><strong>Biloo ERP</strong><small>One operating truth</small></div><div className="wp-map-node node-sales"><span><Icon name="wallet" size={18} /></span><strong>Sales</strong><small>Invoices & collections</small></div><div className="wp-map-node node-stock"><span><Icon name="box" size={18} /></span><strong>Inventory</strong><small>Stock & purchasing</small></div><div className="wp-map-node node-finance"><span><Icon name="bank" size={18} /></span><strong>Finance</strong><small>Ledger & controls</small></div><div className="wp-map-node node-people"><span><Icon name="people" size={18} /></span><strong>Relationships</strong><small>Customers & suppliers</small></div><svg className="wp-map-lines" viewBox="0 0 600 520" aria-hidden="true"><path d="M300 260C235 205 180 174 118 145" /><path d="M300 260C365 205 420 174 482 145" /><path d="M300 260C235 315 180 346 118 375" /><path d="M300 260C365 315 420 346 482 375" /></svg></div>
        </div></section>

        <section className="wp-section wp-journey-section"><div className="wp-container"><div className="wp-section-heading wp-heading-centered" data-reveal><span className="wp-kicker"><Icon name="clock" size={15} /> A better operating rhythm</span><h2>Simple for the team. Explainable for management.</h2><p>Biloo is designed around the full operating loop—not just data entry and not just reporting.</p></div><div className="wp-journey-grid">{journeySteps.map((step,index) => <article key={step.number} data-reveal style={{ '--delay': `${index * 90}ms` } as CSSProperties}><span className="wp-step-number">{step.number}</span><span className="wp-step-icon"><Icon name={step.icon} size={21} /></span><h3>{step.title}</h3><p>{step.text}</p>{index < journeySteps.length - 1 && <span className="wp-step-line" aria-hidden="true" />}</article>)}</div></div></section>

        <section className="wp-section wp-audience-section"><div className="wp-container"><div className="wp-audience-panel"><div className="wp-audience-heading" data-reveal><span className="wp-kicker wp-kicker-light"><Icon name="building" size={15} /> Built for organizations that are becoming more serious</span><h2>Structure your growth before complexity starts running the business.</h2><p>Biloo supports the point where spreadsheets and disconnected apps stop being flexible and start becoming operational risk.</p></div><div className="wp-audience-grid">{audienceCards.map((card,index) => <article key={card.title} data-reveal style={{ '--delay': `${index * 90}ms` } as CSSProperties}><span><Icon name={card.icon} size={22} /></span><h3>{card.title}</h3><p>{card.text}</p></article>)}</div><div className="wp-local-row" data-reveal><div><Icon name="globe" size={20} /><span><strong>Built around local reality</strong><small>ETB-first operations and Ethiopian business context.</small></span></div><div><Icon name="phone" size={20} /><span><strong>Designed across devices</strong><small>Clear workflows from desktop to mobile.</small></span></div><div><Icon name="lock" size={20} /><span><strong>Control that scales</strong><small>Roles, approvals and traceability as teams grow.</small></span></div></div></div></div></section>

        <section className="wp-section wp-security-section"><div className="wp-container wp-security-layout">
          <div className="wp-security-visual" data-reveal><div className="wp-security-ring ring-one" /><div className="wp-security-ring ring-two" /><div className="wp-security-ring ring-three" /><div className="wp-security-center"><span><Icon name="shield" size={34} /></span><strong>Controlled by design</strong><small>Roles · Approvals · Audit history</small></div><div className="wp-security-badge badge-one"><Icon name="lock" size={16} /> Role-based access</div><div className="wp-security-badge badge-two"><Icon name="file" size={16} /> Source evidence</div><div className="wp-security-badge badge-three"><Icon name="clock" size={16} /> Activity history</div></div>
          <div className="wp-security-copy" data-reveal><span className="wp-kicker"><Icon name="shield" size={15} /> Confidence inside the product</span><h2>Growth needs controls that people can actually use.</h2><p>Security and accountability are not separate from the workflow. Biloo places permissions, approvals, review history and source context where the work happens.</p><div className="wp-security-list"><div><span><Icon name="people" size={17} /></span><div><strong>Role-based workspaces</strong><small>Give each person the access and tools relevant to their responsibility.</small></div></div><div><span><Icon name="check" size={17} /></span><div><strong>Approval checkpoints</strong><small>Protect important transactions with clear review paths.</small></div></div><div><span><Icon name="search" size={17} /></span><div><strong>Traceable context</strong><small>Move from a management number to the record and evidence behind it.</small></div></div></div><Link className="wp-text-link" href="/trust">Explore trust and controls <Icon name="arrow" size={16} /></Link></div>
        </div></section>

        <section className="wp-section wp-faq-section"><div className="wp-container wp-faq-layout"><div className="wp-faq-heading" data-reveal><span className="wp-kicker"><Icon name="message" size={15} /> Common questions</span><h2>Understand the platform before you commit.</h2><p>Biloo is meant to make the business clearer. The buying process should feel the same way.</p><Link className="wp-button wp-button-secondary" href="/request-demo?source=faq">Talk to HisabTech</Link></div><div className="wp-faq-list" data-reveal>{faqs.map(([question,answer],index) => <article className={openFaq === index ? 'open' : ''} key={question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>{question}</span><b><Icon name={openFaq === index ? 'close' : 'plus'} size={18} /></b></button><div className="wp-faq-answer"><p>{answer}</p></div></article>)}</div></div></section>

        <section className="wp-final-cta"><div className="wp-final-orb" aria-hidden="true" /><div className="wp-container wp-final-inner" data-reveal><span className="wp-kicker wp-kicker-light"><Icon name="spark" size={15} /> A clearer business starts with one connected system</span><h2>See what Biloo ERP can replace, connect and reveal for your team.</h2><p>Start exploring on your own or request a guided walkthrough built around the way your organization operates today.</p><div className="wp-final-actions"><Link className="wp-button wp-button-gold" href="/auth/email-sign-up">Start free <Icon name="arrow" /></Link><Link className="wp-button wp-button-dark-ghost" href="/request-demo?source=final-cta">Request a demo</Link></div><div className="wp-final-note"><span><Icon name="check" size={14} /> No fragmented setup story</span><span><Icon name="check" size={14} /> Clear next steps</span><span><Icon name="check" size={14} /> Built for Ethiopian operations</span></div></div></section>
      </main>

      <footer className="wp-footer"><div className="wp-container"><div className="wp-footer-main"><div className="wp-footer-brand"><Link className="wp-brand wp-brand-footer" href="/"><span className="wp-brand-mark"><Image src="/hisab-logo.svg" alt="" width={42} height={42} /></span><span className="wp-brand-copy"><strong>HisabTech</strong><small>Biloo ERP</small></span></Link><p>A connected business operating system for ambitious Ethiopian organizations.</p><Link className="wp-footer-cta" href="/request-demo?source=footer">See Biloo in action <Icon name="arrow" size={15} /></Link></div><div className="wp-footer-links"><div><strong>Platform</strong><a href="#platform">Overview</a><Link href="/product-tour">Product tour</Link><Link href="/pricing">Pricing</Link><Link href="/trust">Trust</Link></div><div><strong>Solutions</strong><a href="#solutions">Finance</a><a href="#solutions">Sales</a><a href="#solutions">Inventory</a><Link href="/industries">Industries</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/resources">Resources</Link><Link href="/support">Support</Link><Link href="/request-demo">Contact</Link></div></div></div><div className="wp-footer-bottom"><span>© 2026 HisabTech. Biloo ERP is a HisabTech product.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>Made for Ethiopian business</span></div></div></div></footer>
    </div>
  );
}
