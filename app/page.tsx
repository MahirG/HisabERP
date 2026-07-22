import Link from "next/link";
import { Dashboard } from "../components/dashboard";
import { getCurrentUserContext } from "../lib/data/context";
import { getDashboardSnapshot } from "../lib/data/erp";

export const dynamic = "force-dynamic";

const benefits = [
  ["One source of truth", "Bring sales, expenses, inventory, receivables, payables, customers, suppliers, and reporting into one connected workspace."],
  ["Built for Ethiopia", "Work with local business realities, Ethiopian currency, multilingual access, mobile-first workflows, and digital-payment readiness."],
  ["Faster decisions", "See live performance, cash position, overdue balances, inventory movement, and business-health indicators without waiting for spreadsheets."],
  ["Secure by design", "Use role-based access, protected authentication, audit-ready records, cloud backups, and controlled team permissions."],
];

const steps = [
  ["01", "Create your workspace", "Set up the business, fiscal details, branches, team roles, products, services, customers, and suppliers."],
  ["02", "Connect daily operations", "Record sales, purchases, expenses, payments, inventory movements, invoices, and debts in real time."],
  ["03", "Understand performance", "Use dashboards, reports, alerts, and trends to manage cash flow, profitability, stock, and outstanding balances."],
];

const integrations = ["telebirr", "Supabase", "Google", "Apple", "Email", "Webhooks", "REST API", "CSV Import"];

function ProductPreview() {
  return (
    <div className="marketing-product-window" aria-label="HisabERP dashboard preview">
      <div className="marketing-window-bar"><span/><span/><span/><b>HisabERP Financial Workspace</b></div>
      <div className="marketing-window-body">
        <aside><img src="/hisab-logo.svg" alt="HisabERP" width="36" height="36" className="hisab-logo"/><span>Overview</span><span>Sales</span><span>Expenses</span><span>Inventory</span><span>Customers</span><span>Reports</span></aside>
        <section>
          <div className="marketing-preview-top"><div><small>Good morning, Mahir</small><h3>Business overview</h3></div><button type="button">+ New transaction</button></div>
          <div className="marketing-kpis"><article><small>Revenue</small><b>ETB 284,600</b><em>+18.4%</em></article><article><small>Net cash flow</small><b>ETB 96,240</b><em>Healthy</em></article><article><small>Receivables</small><b>ETB 42,850</b><em>6 due soon</em></article></div>
          <div className="marketing-chart-card"><div><strong>Revenue performance</strong><small>Last 6 months</small></div><svg viewBox="0 0 600 180" role="img" aria-label="Illustrative upward revenue trend"><defs><linearGradient id="mkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path d="M20 145 C90 130,120 120,170 126 S250 85,305 96 S390 58,445 72 S520 32,580 40 L580 170 L20 170 Z" fill="url(#mkFill)"/><path d="M20 145 C90 130,120 120,170 126 S250 85,305 96 S390 58,445 72 S520 32,580 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></div>
        </section>
      </div>
    </div>
  );
}

function MarketingHome() {
  return (
    <main className="marketing-site">
      <header className="marketing-nav">
        <Link href="/" className="marketing-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42" className="hisab-logo"/><strong>HisabTech</strong></Link>
        <nav aria-label="Main navigation"><a href="#product">Product</a><a href="#benefits">Benefits</a><a href="#how">How it works</a><a href="#integrations">Integrations</a></nav>
        <div className="marketing-nav-actions"><Link href="/auth/login" className="marketing-signin">Sign in</Link><Link href="/request-demo" className="marketing-demo">Request a demo</Link><Link href="/auth/email-sign-up" className="marketing-start">Get started</Link></div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-copy"><span className="marketing-eyebrow">Modern ERP for growing Ethiopian businesses</span><h1>Run your entire business from one clear financial workspace.</h1><p>HisabERP connects sales, expenses, inventory, invoicing, customers, suppliers, cash flow, debts, digital payments, and reporting—so every decision starts with reliable information.</p><div className="marketing-hero-actions"><Link href="/auth/email-sign-up" className="marketing-start marketing-large">Get started free</Link><Link href="/request-demo" className="marketing-demo marketing-large">Request a demo</Link></div><div className="marketing-trust"><span>✓ No credit card required</span><span>✓ English and Amharic</span><span>✓ Mobile ready</span></div></div>
        <ProductPreview/>
      </section>

      <section className="marketing-proof"><p>One connected platform for every important business operation</p><div><span>Retail</span><span>Wholesale</span><span>Services</span><span>Hospitality</span><span>Cooperatives</span><span>Multi-branch teams</span></div></section>

      <section className="marketing-section" id="product"><div className="marketing-section-heading"><span>Everything works together</span><h2>A complete operating system—not another isolated accounting tool.</h2><p>HisabERP gives owners, finance teams, cashiers, inventory staff, and managers the same accurate view of the business.</p></div><div className="marketing-module-grid">{[["Sales & invoicing","Create transactions, issue invoices, track collections, and understand revenue."],["Expenses & purchases","Control spending, supplier obligations, and operational costs."],["Inventory","Track stock levels, movement, low-stock risks, and product performance."],["Customers & suppliers","Keep complete relationships, balances, histories, and follow-ups."],["Cash flow & reconciliation","Match cash and digital transactions and identify discrepancies quickly."],["Reports & analytics","Turn activity into understandable trends, KPIs, and decision-ready summaries."]].map(([title,text],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p><a href="#preview">Explore capability →</a></article>)}</div></section>

      <section className="marketing-dark-section" id="preview"><div className="marketing-dark-copy"><span>See the business clearly</span><h2>From daily transactions to executive insight.</h2><p>HisabERP converts operational activity into a live picture of performance. Understand what changed, why it changed, and what requires attention next.</p><ul><li>Daily and monthly revenue performance</li><li>Cash, receivables, payables, and overdue exposure</li><li>Inventory velocity and low-stock alerts</li><li>Profitability, expenses, and business-health indicators</li></ul></div><div className="marketing-analytics"><div className="marketing-analytics-head"><span>Performance overview</span><b>Live</b></div><div className="marketing-analytics-kpis"><article><small>Gross sales</small><strong>ETB 1.82M</strong><em>+24%</em></article><article><small>Operating margin</small><strong>31.8%</strong><em>+4.2 pts</em></article></div><div className="marketing-bars" aria-label="Illustrative monthly sales comparison">{[["Jan",46],["Feb",58],["Mar",51],["Apr",72],["May",82],["Jun",94]].map(([m,v])=><div key={m}><span style={{height:`${v}%`}}/><small>{m}</small></div>)}</div></div></section>

      <section className="marketing-section" id="benefits"><div className="marketing-section-heading"><span>Why businesses choose HisabERP</span><h2>Less manual work. More control. Better growth.</h2></div><div className="marketing-benefit-grid">{benefits.map(([title,text],index)=><article key={title}><b>0{index+1}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="marketing-how" id="how"><div className="marketing-section-heading"><span>How to use HisabERP</span><h2>Launch a professional business workspace in three steps.</h2></div><div className="marketing-step-grid">{steps.map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div><Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start setting up your business</Link></section>

      <section className="marketing-integrations" id="integrations"><div><span>Connected by design</span><h2>Integrate payments, identity, data, and business workflows.</h2><p>HisabERP is built on a modern cloud foundation and prepared for secure payment, authentication, import/export, API, and workflow integrations.</p><Link href="/request-demo" className="marketing-demo marketing-large">Discuss an integration</Link></div><div className="marketing-integration-grid">{integrations.map((item,index)=><article key={item}><span>{index<2?"●":"◇"}</span><strong>{item}</strong><small>{index===0?"Digital payments":index===1?"Secure cloud data":index<4?"Trusted identity":"Business connectivity"}</small></article>)}</div></section>

      <section className="marketing-quote"><blockquote>“HisabERP is designed to help Ethiopian businesses move from notebooks and disconnected spreadsheets to reliable, decision-ready operations.”</blockquote><p>Built locally for ambitious businesses.</p></section>

      <section className="marketing-cta"><div><span>Ready to modernize your business?</span><h2>Start with HisabERP today.</h2><p>Create your workspace or speak with our team for a guided product demonstration.</p></div><div><Link href="/auth/email-sign-up" className="marketing-start marketing-large">Get started</Link><Link href="/request-demo" className="marketing-demo marketing-large">Request a demo</Link></div></section>

      <footer className="marketing-footer"><div className="marketing-footer-top"><div><Link href="/" className="marketing-brand marketing-footer-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42" className="hisab-logo hisab-logo-on-dark"/><strong>HisabTech</strong></Link><p>Secure, multilingual ERP software for Ethiopian businesses.</p><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a><a href="tel:+251924093037">+251 924 093 037</a></div><div><strong>Product</strong><a href="#product">Features</a><a href="#how">How it works</a><a href="#integrations">Integrations</a><Link href="/auth/email-sign-up">Get started</Link></div><div><strong>Company</strong><a href="#benefits">Why HisabERP</a><Link href="/request-demo">Request a demo</Link><a href="mailto:mahir@hisabtech.com">Contact</a></div><div><strong>Access</strong><Link href="/auth/login">Sign in</Link><Link href="/auth/email-sign-up">Create account</Link><Link href="/auth/forgot-password">Reset password</Link></div></div><div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Hisab Technologies. All rights reserved.</span><span>Addis Ababa, Ethiopia</span></div></footer>
    </main>
  );
}

export default async function HomePage() {
  const user = await getCurrentUserContext();
  if (!user) return <MarketingHome/>;
  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} user={user}/>;
}
