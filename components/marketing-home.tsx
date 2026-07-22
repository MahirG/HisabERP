import Link from "next/link";
import { marketingModules } from "../lib/marketing-modules";
import { MarketingPageShell } from "./marketing-site-chrome";
import { ProductTourExperience } from "./product-tour-experience";

const benefits = [
  { number: "01", title: "One source of truth", text: "Sales, expenses, inventory, receivables, payables, customers, suppliers and reports work from the same business records." },
  { number: "02", title: "Built for Ethiopia", text: "Use Ethiopian birr, multilingual access, mobile-ready workflows and a product designed around local operating realities." },
  { number: "03", title: "Faster decisions", text: "See cash, stock, overdue balances, performance and attention items without waiting for manually prepared spreadsheets." },
  { number: "04", title: "Controlled access", text: "Give owners, managers, cashiers and operational teams the access they require while protecting sensitive records." },
];

const steps = [
  { number: "01", title: "Configure the business", text: "Set up the organization, fiscal details, products, services, opening balances, customers, suppliers and user responsibilities." },
  { number: "02", title: "Run daily operations", text: "Record sales, invoices, payments, expenses, purchases, inventory movements and business relationships as work happens." },
  { number: "03", title: "Act on reliable information", text: "Use dashboards, reports, balances, trends and attention lists to manage cash flow, stock, profitability and growth." },
];

function HeroWorkspace() {
  return (
    <div className="hero-workspace" aria-label="HisabERP business overview preview">
      <div className="hero-workspace-bar"><div><i/><i/><i/></div><strong>HisabERP Financial Workspace</strong><span>Secure session</span></div>
      <div className="hero-workspace-layout">
        <aside>
          <img src="/hisab-logo.svg" alt="" width="36" height="36" />
          {['Overview','Sales','Inventory','Finance','Customers','Reports'].map((item,index)=><span className={index===0?'active':undefined} key={item}>{item}</span>)}
        </aside>
        <section>
          <div className="hero-workspace-heading"><div><small>Good afternoon, Mahir</small><h2>Business overview</h2></div><button type="button">+ New transaction</button></div>
          <div className="hero-kpis">
            <article><small>Today’s revenue</small><strong>ETB 84,600</strong><span>+12.8% this week</span></article>
            <article><small>Cash available</small><strong>ETB 318,400</strong><span>Current position</span></article>
            <article><small>Receivables</small><strong>ETB 72,900</strong><span>11 open accounts</span></article>
          </div>
          <div className="hero-workspace-main">
            <article className="hero-performance-card"><header><strong>Revenue performance</strong><small>Last six months</small></header><div className="hero-performance-bars">{[42,55,49,68,76,94].map((height,index)=><span style={{height:`${height}%`}} key={index}/>)}</div></article>
            <article className="hero-attention-card"><header><strong>Needs attention</strong><small>Today</small></header><div><p><span>Low-stock products</span><b>3 urgent</b></p><p><span>Invoices due</span><b>4 accounts</b></p><p><span>Unmatched payments</span><b>2 records</b></p></div></article>
          </div>
        </section>
      </div>
    </div>
  );
}

export function MarketingHome() {
  return (
    <MarketingPageShell>
      <section className="marketing-hero marketing-hero-v2">
        <div className="marketing-hero-copy">
          <span className="marketing-eyebrow">The business operating system for Ethiopia</span>
          <h1>Run your entire business from one intelligent workspace.</h1>
          <p>HisabERP connects sales, expenses, inventory, invoicing, customers, suppliers, cash flow and reporting—so every important decision starts with reliable information.</p>
          <div className="marketing-hero-actions">
            <Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start free</Link>
            <Link href="/request-demo" className="marketing-demo marketing-large">Request a demo</Link>
            <Link href="/product-tour" className="marketing-text-action">Explore the product <span aria-hidden="true">→</span></Link>
          </div>
          <div className="marketing-trust"><span>Transparent setup</span><span>English and Amharic</span><span>Mobile ready</span><span>Role-controlled access</span></div>
        </div>
        <HeroWorkspace />
      </section>

      <section className="marketing-proof marketing-proof-v2">
        <p>Designed for ambitious businesses moving beyond notebooks and disconnected spreadsheets</p>
        <div><span>Retail</span><span>Wholesale</span><span>Services</span><span>Hospitality</span><span>Cooperatives</span><span>Multi-branch teams</span></div>
      </section>

      <section className="marketing-section marketing-intro-section" id="modules">
        <div className="marketing-section-heading marketing-section-heading-wide">
          <span>Connected product modules</span>
          <h2>Every operational area contributes to the same reliable business picture.</h2>
          <p>HisabERP is not a collection of isolated screens. Sales affect inventory and customer balances. Purchases affect stock and supplier obligations. Payments affect cash flow and financial reporting.</p>
        </div>
        <div className="marketing-module-grid marketing-module-grid-v2">
          {marketingModules.map((module) => (
            <article key={module.slug}>
              <span>{module.number}</span>
              <h3>{module.shortTitle}</h3>
              <p>{module.summary}</p>
              <Link href={`/product/${module.slug}`}>Explore {module.shortTitle.toLowerCase()} <b aria-hidden="true">→</b></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-tour-section">
        <div className="marketing-section-heading marketing-section-heading-centered">
          <span>Interactive product tour</span>
          <h2>See how daily activity becomes management insight.</h2>
          <p>Move through the main product areas and inspect the kind of information each workspace brings together.</p>
        </div>
        <ProductTourExperience compact />
        <div className="marketing-centered-action"><Link href="/product-tour" className="marketing-demo marketing-large">Open the complete product tour</Link></div>
      </section>

      <section className="marketing-dark-section marketing-dark-section-v2">
        <div className="marketing-dark-copy">
          <span>From activity to action</span>
          <h2>Understand what changed, why it changed and what requires attention next.</h2>
          <p>HisabERP converts daily operational records into a live view of business health without requiring teams to rebuild the numbers manually.</p>
          <ul><li>Daily and monthly revenue performance</li><li>Cash, receivables, payables and overdue exposure</li><li>Inventory movement and low-stock risk</li><li>Profitability, expenses and management indicators</li></ul>
          <Link href="/product/reports-analytics" className="marketing-dark-link">Explore reports and analytics →</Link>
        </div>
        <div className="marketing-insight-panel">
          <header><span>Management summary</span><b>Updated now</b></header>
          <div className="marketing-insight-kpis"><article><small>Gross sales</small><strong>ETB 1.82M</strong><span>+24% versus prior period</span></article><article><small>Operating margin</small><strong>31.8%</strong><span>Improved 4.2 points</span></article></div>
          <div className="marketing-insight-list"><p><span>Collections requiring follow-up</span><b>11 accounts</b></p><p><span>Products below reorder level</span><b>9 items</b></p><p><span>Supplier bills due this week</span><b>6 bills</b></p></div>
        </div>
      </section>

      <section className="marketing-section" id="benefits">
        <div className="marketing-section-heading"><span>Why businesses choose HisabERP</span><h2>Less manual work. More control. Better growth decisions.</h2></div>
        <div className="marketing-benefit-grid">{benefits.map((benefit)=><article key={benefit.number}><b>{benefit.number}</b><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div>
      </section>

      <section className="marketing-how" id="how">
        <div className="marketing-section-heading"><span>Implementation journey</span><h2>Launch a professional workspace in three clear stages.</h2><p>HisabERP is designed to move a business from setup to daily use and management reporting without unnecessary complexity.</p></div>
        <div className="marketing-step-grid">{steps.map((step)=><article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        <div className="marketing-centered-action"><Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start setting up your business</Link></div>
      </section>

      <section className="marketing-cta marketing-cta-v2">
        <div><span>Ready to see HisabERP in your business?</span><h2>Start with a workspace or request a guided demonstration.</h2><p>Explore the product at your own pace, then speak with HisabTech when your team is ready to evaluate implementation.</p></div>
        <div><Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start free</Link><Link href="/request-demo" className="marketing-demo marketing-large">Request a demo</Link></div>
      </section>
    </MarketingPageShell>
  );
}
