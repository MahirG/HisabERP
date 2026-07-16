import Link from "next/link";
import { metrics, monthlyPerformance, transactions, type Metric } from "../lib/dashboard-data";
import { mustHaveModules } from "../lib/erp-modules";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "ERP modules", href: "/modules" },
  { label: "Finance", href: "/modules/finance-accounting" },
  { label: "Sales", href: "/modules/sales-invoicing" },
  { label: "Purchasing", href: "/modules/purchasing-expenses" },
  { label: "Inventory", href: "/modules/inventory-warehouse" },
  { label: "Reports", href: "/modules/reports-analytics" },
];

function Icon({ name }: { name: Metric["icon"] }) {
  const paths = {
    sales: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
    expense: <><path d="M12 3v18"/><path d="m17 8-5-5-5 5"/><path d="m7 16 5 5 5-5"/></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M17 14h.01"/><circle cx="12" cy="12" r="2"/></>,
    debt: <><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function MetricCard({ metric }: { metric: Metric }) {
  return <article className="metric-card"><div className={`metric-icon ${metric.tone}`}><Icon name={metric.icon}/></div><div><p>{metric.label}</p><strong>{metric.value}</strong><span className={metric.tone}>{metric.change}</span></div></article>;
}

export function Dashboard() {
  return <div className="erp-shell">
    <aside className="sidebar"><div className="brand"><span>H</span><div><strong>Hisab</strong><small>ERP Enterprise</small></div></div><nav>{navItems.map((item, index) => <Link className={index === 0 ? "active" : ""} href={item.href} key={item.label}>{item.label}</Link>)}</nav><div className="sidebar-footer"><a href="/legacy">Open legacy app</a><p>Hisab Technologies<br/>Addis Ababa, Ethiopia</p></div></aside>
    <main className="workspace">
      <header className="topbar"><div><p className="eyebrow">Thursday, 16 July</p><h1>Good evening, Mahir</h1><p>Here is how your business is performing today.</p></div><div className="top-actions"><button className="ghost">Export report</button><button className="primary">+ New transaction</button><div className="avatar">MA</div></div></header>
      <section className="metrics-grid">{metrics.map(metric => <MetricCard metric={metric} key={metric.label}/>)}</section>

      <section className="panel module-preview">
        <div className="panel-head"><div><p className="eyebrow">ERP foundation</p><h2>Core modules every company needs</h2></div><Link className="text-button" href="/modules">View all modules →</Link></div>
        <div className="module-preview-grid">{mustHaveModules.slice(0, 4).map(module => <Link href={`/modules/${module.slug}`} key={module.slug}><span>Phase {module.phase}</span><strong>{module.shortTitle}</strong><p>{module.description}</p></Link>)}</div>
      </section>

      <section className="content-grid">
        <article className="panel performance-panel"><div className="panel-head"><div><p className="eyebrow">Financial performance</p><h2>Revenue overview</h2></div><select aria-label="Period"><option>Last 12 months</option></select></div><div className="revenue-summary"><strong>ETB 1,284,500</strong><span>+18.2% from last year</span></div><div className="chart" aria-label="Monthly revenue chart">{monthlyPerformance.map((height, i) => <div className="bar-wrap" key={i}><div className="bar" style={{height: `${Math.min(height, 100)}%`}}/><small>{["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"][i]}</small></div>)}</div></article>
        <article className="panel health-panel"><div className="panel-head"><div><p className="eyebrow">Business health</p><h2>Excellent condition</h2></div><span className="score">86</span></div><div className="health-ring"><div><strong>86</strong><span>/100</span></div></div><ul><li><span>Cash flow</span><strong>Strong</strong></li><li><span>Expense control</span><strong>Good</strong></li><li><span>Debt collection</span><strong>Needs attention</strong></li></ul></article>
      </section>
      <section className="panel transactions-panel"><div className="panel-head"><div><p className="eyebrow">Latest activity</p><h2>Recent transactions</h2></div><button className="text-button">View all →</button></div><div className="transaction-list">{transactions.map(tx => <div className="transaction" key={tx.id}><div className={`transaction-mark ${tx.type}`}>{tx.type === "income" ? "↗" : "↙"}</div><div className="transaction-main"><strong>{tx.description}</strong><span>{tx.id} · {tx.category}</span></div><time>{tx.date}</time><strong className={tx.type}>{tx.amount}</strong></div>)}</div></section>
    </main>
  </div>;
}
