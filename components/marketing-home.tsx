import Link from "next/link";
import { Icon, type IconName } from "./ui/icon";

const modules: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: "landmark", title: "Finance & accounting", description: "Manage ledgers, journals, cash flow, tax codes, expenses and financial controls in ETB." },
  { icon: "shopping-cart", title: "Sales & invoicing", description: "Create quotations, orders, invoices, receipts, returns and customer payment records." },
  { icon: "boxes", title: "Inventory & warehouses", description: "Track stock, transfers, counts, lots, serials, reorder levels and warehouse movement." },
  { icon: "receipt", title: "Purchasing & suppliers", description: "Control purchase requests, supplier quotations, orders, receipts, bills and returns." },
  { icon: "badge-dollar", title: "HR & payroll", description: "Organize employees, attendance, leave, salary structures and payroll runs." },
  { icon: "file-check", title: "Electronic invoicing", description: "Prepare compliant invoice workflows, review submission readiness and keep an audit trail." },
  { icon: "refresh-cw", title: "Payment reconciliation", description: "Match bank, telebirr and M-Pesa transactions to invoices, bills and ledger accounts." },
  { icon: "chart", title: "Reports & analytics", description: "See sales, expenses, profitability, receivables, payables and operational health at a glance." },
];

const steps = [
  { number: "01", title: "Create your workspace", description: "Register your business, set your currency, branches, warehouses, tax details and team roles." },
  { number: "02", title: "Connect daily operations", description: "Bring sales, purchases, inventory, payments, employees and approvals into one shared system." },
  { number: "03", title: "Run with clear information", description: "Use live dashboards, reconciliation and reports to make faster, evidence-based decisions." },
];

const integrations = [
  { mark: "S", name: "Supabase", detail: "Database and authentication", status: "Connected", tone: "connected" },
  { mark: "t", name: "telebirr", detail: "Payment reconciliation", status: "Integration-ready", tone: "ready" },
  { mark: "M", name: "M-Pesa", detail: "Daraja payment connectivity", status: "Integration-ready", tone: "ready" },
  { mark: "B", name: "Banks & CSV", detail: "Statement import and matching", status: "Available", tone: "available" },
  { mark: "E", name: "E-Invoice", detail: "Ethiopian compliance workflow", status: "Workflow-ready", tone: "ready" },
  { mark: "@", name: "Business email", detail: "Secure transactional email", status: "Connected", tone: "connected" },
  { mark: "V", name: "Vercel", detail: "Secure cloud delivery", status: "Connected", tone: "connected" },
  { mark: "A", name: "API & automation", detail: "Extensible integration layer", status: "Expandable", tone: "available" },
];

function Brand() {
  return (
    <span className="marketing-brand-lockup">
      <span className="marketing-brand-mark" aria-hidden="true">H</span>
      <span><strong>HisabTech</strong><small>HisabERP</small></span>
    </span>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return <li><span aria-hidden="true">✓</span><span>{children}</span></li>;
}

export function MarketingHome() {
  return (
    <main className="marketing-site">
      <a className="marketing-skip-link" href="#marketing-main">Skip to content</a>

      <header className="marketing-header">
        <Link className="marketing-brand" href="/" aria-label="HisabTech HisabERP home"><Brand /></Link>
        <nav className="marketing-nav-links" aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Benefits</a>
          <a href="#integrations">Integrations</a>
        </nav>
        <div className="marketing-header-actions">
          <Link className="marketing-login-link" href="/auth/login">Sign in</Link>
          <Link className="marketing-button marketing-button-outline" href="/request-demo">Request a demo</Link>
          <Link className="marketing-button marketing-button-primary" href="/auth/email-sign-up">Get started</Link>
        </div>
        <details className="marketing-mobile-menu">
          <summary aria-label="Open website menu"><span/><span/><span/></summary>
          <div>
            <a href="#product">Product</a>
            <a href="#how-it-works">How it works</a>
            <a href="#benefits">Benefits</a>
            <a href="#integrations">Integrations</a>
            <Link href="/auth/login">Sign in</Link>
            <Link href="/request-demo">Request a demo</Link>
            <Link className="marketing-button marketing-button-primary" href="/auth/email-sign-up">Get started</Link>
          </div>
        </details>
      </header>

      <div id="marketing-main">
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <div className="marketing-eyebrow"><span/> Built for modern Ethiopian businesses</div>
            <h1>Run your entire business from one clear financial workspace.</h1>
            <p>HisabERP connects finance, sales, inventory, purchasing, payroll, invoicing and payments—so your team can work with accurate records instead of scattered notebooks and spreadsheets.</p>
            <div className="marketing-hero-actions">
              <Link className="marketing-button marketing-button-primary marketing-button-large" href="/auth/email-sign-up">Get started free <span aria-hidden="true">→</span></Link>
              <Link className="marketing-button marketing-button-secondary marketing-button-large" href="/request-demo"><Icon name="users" size={17}/> Request a demo</Link>
            </div>
            <ul className="marketing-trust-list" aria-label="Product highlights">
              <Check>ETB-native financial workflows</Check>
              <Check>English and Amharic experience</Check>
              <Check>Secure cloud access on desktop and mobile</Check>
            </ul>
          </div>

          <div className="marketing-hero-visual" aria-label="Illustrative HisabERP dashboard preview">
            <div className="marketing-browser-frame">
              <div className="marketing-browser-topbar">
                <span className="marketing-browser-dots"><i/><i/><i/></span>
                <span className="marketing-browser-address">app.hisabtech.com / overview</span>
                <span className="marketing-live-pill"><i/> Live</span>
              </div>
              <div className="marketing-app-preview">
                <aside className="marketing-preview-sidebar">
                  <div className="marketing-preview-brand"><b>H</b><span>HisabERP</span></div>
                  <nav aria-label="Preview navigation">
                    <span className="active"><Icon name="home" size={14}/> Overview</span>
                    <span><Icon name="landmark" size={14}/> Finance</span>
                    <span><Icon name="shopping-cart" size={14}/> Sales</span>
                    <span><Icon name="boxes" size={14}/> Inventory</span>
                    <span><Icon name="receipt" size={14}/> Purchasing</span>
                    <span><Icon name="chart" size={14}/> Reports</span>
                  </nav>
                  <div className="marketing-preview-workspace"><i>HA</i><span><b>Hisab Trading</b><small>Addis Ababa</small></span></div>
                </aside>
                <div className="marketing-preview-main">
                  <div className="marketing-preview-heading">
                    <div><small>Tuesday, 21 July</small><h2>Selam, Mahir</h2><p>Here is how your business is performing today.</p></div>
                    <button type="button" aria-label="Preview create action">+ Create</button>
                  </div>
                  <div className="marketing-preview-metrics">
                    <article><span>Revenue</span><strong>ETB 184,250</strong><small className="positive">↗ 12.4% this month</small></article>
                    <article><span>Cash position</span><strong>ETB 92,800</strong><small>Across cash and bank</small></article>
                    <article><span>Receivables</span><strong>ETB 46,120</strong><small>14 open invoices</small></article>
                  </div>
                  <div className="marketing-preview-grid">
                    <article className="marketing-preview-chart">
                      <div><span>Revenue overview</span><b>Last 7 months</b></div>
                      <svg viewBox="0 0 520 190" role="img" aria-label="Illustrative revenue trend rising across seven months">
                        <defs><linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".24"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
                        <g className="grid"><path d="M20 30H500M20 75H500M20 120H500M20 165H500"/></g>
                        <path className="area" d="M20 145 C65 132 84 137 120 111 S181 124 218 92 S281 105 322 69 S384 81 420 48 S468 51 500 25 V176 H20Z" fill="url(#heroArea)"/>
                        <path className="line" d="M20 145 C65 132 84 137 120 111 S181 124 218 92 S281 105 322 69 S384 81 420 48 S468 51 500 25"/>
                        <g className="points"><circle cx="20" cy="145" r="4"/><circle cx="120" cy="111" r="4"/><circle cx="218" cy="92" r="4"/><circle cx="322" cy="69" r="4"/><circle cx="420" cy="48" r="4"/><circle cx="500" cy="25" r="4"/></g>
                      </svg>
                      <div className="marketing-chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div>
                    </article>
                    <article className="marketing-preview-activity">
                      <div><span>Recent activity</span><b>View all</b></div>
                      <ul>
                        <li><i className="sale"><Icon name="shopping-cart" size={13}/></i><span><b>Invoice paid</b><small>Abebe Trading PLC</small></span><strong>+ ETB 24,500</strong></li>
                        <li><i className="stock"><Icon name="boxes" size={13}/></i><span><b>Stock received</b><small>Main warehouse</small></span><strong>48 items</strong></li>
                        <li><i className="expense"><Icon name="receipt" size={13}/></i><span><b>Supplier bill</b><small>Office materials</small></span><strong>ETB 8,240</strong></li>
                      </ul>
                    </article>
                  </div>
                </div>
              </div>
            </div>
            <span className="marketing-preview-caption">Illustrative product preview · No customer data shown</span>
          </div>
        </section>

        <section className="marketing-proof-strip" aria-label="HisabERP platform qualities">
          <span><Icon name="shield-check" size={19}/><b>Secure by design</b><small>Role-based access and audit trails</small></span>
          <span><Icon name="building" size={19}/><b>Built locally</b><small>Designed for Ethiopian operations</small></span>
          <span><Icon name="workflow" size={19}/><b>One connected system</b><small>From transaction to report</small></span>
          <span><Icon name="package-check" size={19}/><b>Ready to scale</b><small>Branches, teams and warehouses</small></span>
        </section>

        <section className="marketing-section marketing-product-section" id="product">
          <div className="marketing-section-heading">
            <span className="marketing-section-kicker">Complete business management</span>
            <h2>One platform for every core operation.</h2>
            <p>HisabERP replaces disconnected tools with coordinated workflows, shared data and reliable financial records.</p>
          </div>
          <div className="marketing-module-grid">
            {modules.map((module) => (
              <article className="marketing-module-card" key={module.title}>
                <span><Icon name={module.icon} size={20}/></span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <a href="#product-showcase">Explore capability <b aria-hidden="true">→</b></a>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-showcase" id="product-showcase">
          <div className="marketing-showcase-copy">
            <span className="marketing-section-kicker">Product in action</span>
            <h2>See the whole business, not isolated transactions.</h2>
            <p>Every sale, purchase, payment and stock movement updates the records your team needs—without repeating the same work in multiple places.</p>
            <ul>
              <Check>Real-time operational and financial dashboards</Check>
              <Check>Traceable approvals and business audit history</Check>
              <Check>Customer, supplier and cash positions in one view</Check>
              <Check>Responsive workflows for desktop and mobile teams</Check>
            </ul>
            <Link className="marketing-text-link" href="/request-demo">See HisabERP with your business workflow <span aria-hidden="true">→</span></Link>
          </div>
          <div className="marketing-showcase-screens">
            <article className="marketing-screen marketing-screen-invoice">
              <header><span><i/><i/><i/></span><b>Sales invoice</b><small>Draft</small></header>
              <div className="marketing-screen-body">
                <div className="marketing-invoice-head"><span><small>Customer</small><b>Blue Nile Retail PLC</b></span><span><small>Invoice no.</small><b>INV-2026-0184</b></span></div>
                <div className="marketing-invoice-table"><span><b>Item</b><b>Qty</b><b>Amount</b></span><span><i>Premium coffee</i><i>12</i><i>18,600</i></span><span><i>Delivery</i><i>1</i><i>1,200</i></span></div>
                <div className="marketing-invoice-total"><span>Total</span><strong>ETB 22,770</strong></div>
                <button type="button">Post invoice</button>
              </div>
            </article>
            <article className="marketing-screen marketing-screen-reconcile">
              <header><span><i/><i/><i/></span><b>Payment reconciliation</b><small>92% matched</small></header>
              <div className="marketing-screen-body">
                <div className="marketing-reconcile-row matched"><i>t</i><span><b>telebirr · TXN 80429</b><small>Today, 10:42 AM</small></span><strong>ETB 24,500</strong><em>Matched</em></div>
                <div className="marketing-reconcile-row"><i>B</i><span><b>Bank transfer · 1134</b><small>Today, 9:18 AM</small></span><strong>ETB 18,200</strong><em>Review</em></div>
                <div className="marketing-reconcile-row matched"><i>M</i><span><b>M-Pesa · MPX 7021</b><small>Yesterday, 4:51 PM</small></span><strong>ETB 9,850</strong><em>Matched</em></div>
              </div>
            </article>
          </div>
        </section>

        <section className="marketing-section marketing-how-section" id="how-it-works">
          <div className="marketing-section-heading">
            <span className="marketing-section-kicker">How it works</span>
            <h2>Start simply. Grow without rebuilding.</h2>
            <p>HisabERP guides your business from setup to daily operations and management reporting.</p>
          </div>
          <div className="marketing-step-grid">
            {steps.map((step, index) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && <i aria-hidden="true">→</i>}
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-benefits-section" id="benefits">
          <div className="marketing-benefits-visual">
            <div className="marketing-benefit-chart-card">
              <header><span><small>Business performance</small><strong>Monthly overview</strong></span><b>ETB</b></header>
              <div className="marketing-benefit-stats"><span><small>Revenue</small><b>1.84M</b></span><span><small>Gross profit</small><b>612K</b></span><span><small>Collected</small><b>92%</b></span></div>
              <div className="marketing-bars" aria-label="Illustrative monthly revenue and expense comparison">
                {[42, 55, 48, 69, 76, 84, 92].map((height, index) => <span key={height}><i style={{ height: `${height}%` }}/><b style={{ height: `${Math.max(22, height - 28)}%` }}/><small>{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][index]}</small></span>)}
              </div>
              <footer><span><i className="revenue"/>Revenue</span><span><i className="expense"/>Expenses</span><small>Illustrative data</small></footer>
            </div>
          </div>
          <div className="marketing-benefits-copy">
            <span className="marketing-section-kicker">Why HisabERP</span>
            <h2>Turn daily records into confident business decisions.</h2>
            <div className="marketing-benefit-list">
              <article><span>01</span><div><h3>Know your real position</h3><p>See revenue, expenses, cash, inventory, debts and obligations without waiting for manual consolidation.</p></div></article>
              <article><span>02</span><div><h3>Reduce costly mistakes</h3><p>Connected records, approvals and audit trails reduce duplicate entry, missed payments and unexplained stock movement.</p></div></article>
              <article><span>03</span><div><h3>Make teams accountable</h3><p>Give each employee the right role, workflow and visibility while protecting sensitive financial actions.</p></div></article>
              <article><span>04</span><div><h3>Prepare for growth</h3><p>Add branches, warehouses, employees, payment channels and reporting needs without replacing your operating system.</p></div></article>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-integrations-section" id="integrations">
          <div className="marketing-section-heading">
            <span className="marketing-section-kicker">Connected by design</span>
            <h2>Integrations that fit how business moves.</h2>
            <p>HisabERP combines live infrastructure with extensible payment, compliance and automation workflows.</p>
          </div>
          <div className="marketing-integration-grid">
            {integrations.map((integration) => (
              <article key={integration.name}>
                <span className="marketing-integration-mark">{integration.mark}</span>
                <div><h3>{integration.name}</h3><p>{integration.detail}</p></div>
                <small className={`marketing-integration-status ${integration.tone}`}><i/>{integration.status}</small>
              </article>
            ))}
          </div>
          <p className="marketing-integration-note"><Icon name="shield-check" size={16}/> Integration availability depends on provider approval, credentials and production onboarding. HisabERP never stores provider secrets in public interfaces.</p>
        </section>

        <section className="marketing-section marketing-security-section" id="security">
          <div>
            <span className="marketing-section-kicker">Security and local readiness</span>
            <h2>Built to protect financial work while remaining easy to use.</h2>
            <p>HisabERP combines secure authentication, role-based controls, audit events and organization-level data isolation with a product experience designed for Ethiopian teams.</p>
            <div className="marketing-security-actions"><Link className="marketing-button marketing-button-light" href="/request-demo">Discuss your requirements</Link><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a></div>
          </div>
          <ul>
            <Check>Supabase authentication and row-level data controls</Check>
            <Check>Multi-factor protection for privileged roles</Check>
            <Check>Organization, branch and role-based access</Check>
            <Check>English, Amharic and Ethiopia-first business settings</Check>
            <Check>Secure production delivery through Vercel</Check>
          </ul>
        </section>

        <section className="marketing-final-cta">
          <div><span>Ready to modernize your operations?</span><h2>Give your business one reliable place to work.</h2><p>Start your HisabERP workspace or book a guided product demonstration for your team.</p></div>
          <div><Link className="marketing-button marketing-button-primary marketing-button-large" href="/auth/email-sign-up">Get started <span aria-hidden="true">→</span></Link><Link className="marketing-button marketing-button-secondary marketing-button-large" href="/request-demo">Request a demo</Link></div>
        </section>
      </div>

      <footer className="marketing-footer">
        <div className="marketing-footer-top">
          <div className="marketing-footer-brand"><Brand/><p>A secure, multilingual ERP platform for Ethiopian businesses that want clear records, connected operations and confident growth.</p><span>Addis Ababa, Ethiopia</span></div>
          <div><h2>Product</h2><a href="#product">Features</a><a href="#how-it-works">How it works</a><a href="#integrations">Integrations</a><a href="#security">Security</a></div>
          <div><h2>Get started</h2><Link href="/auth/email-sign-up">Create account</Link><Link href="/auth/login">Sign in</Link><Link href="/request-demo">Request a demo</Link><a href="mailto:mahir@hisabtech.com">Contact sales</a></div>
          <div><h2>Contact</h2><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a><a href="tel:+251924093037">0924093037</a><span>Hisab Technologies</span><span>Addis Ababa, Ethiopia</span></div>
        </div>
        <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Hisab Technologies. All rights reserved.</span><span>Built in Ethiopia for businesses everywhere.</span></div>
      </footer>
    </main>
  );
}
