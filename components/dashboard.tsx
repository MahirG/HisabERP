"use client";

import Link from "next/link";
import { metrics, monthlyPerformance, transactions, type Metric } from "../lib/dashboard-data";
import { mustHaveModules } from "../lib/erp-modules";
import { LanguageSelector, useLanguage } from "./language-provider";

function Icon({ name }: { name: Metric["icon"] }) {
  const paths = {
    sales: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
    expense: <><path d="M12 3v18"/><path d="m17 8-5-5-5 5"/><path d="m7 16 5 5 5-5"/></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M17 14h.01"/><circle cx="12" cy="12" r="2"/></>,
    debt: <><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function MetricCard({ metric, label, change }: { metric: Metric; label: string; change: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${metric.tone}`}><Icon name={metric.icon}/></div>
      <div><p>{label}</p><strong>{metric.value}</strong><span className={metric.tone}>{change}</span></div>
    </article>
  );
}

export function Dashboard() {
  const { dictionary } = useLanguage();
  const d = dictionary.dashboard;
  const navItems = [
    { label: d.nav.overview, href: "/" },
    { label: d.nav.modules, href: "/modules" },
    { label: d.nav.finance, href: "/modules/finance-accounting" },
    { label: d.nav.sales, href: "/modules/sales-invoicing" },
    { label: d.nav.purchasing, href: "/modules/purchasing-expenses" },
    { label: d.nav.inventory, href: "/modules/inventory-warehouse" },
    { label: d.nav.reports, href: "/modules/reports-analytics" },
  ];
  const locationLines = d.companyLocation.split("\n");

  return (
    <div className="erp-shell">
      <aside className="sidebar">
        <div className="brand"><span>H</span><div><strong>Hisab</strong><small>{d.brandSubtitle}</small></div></div>
        <LanguageSelector compact />
        <nav>{navItems.map((item, index) => <Link className={index === 0 ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}</nav>
        <div className="sidebar-footer">
          <a href="/legacy">{d.openLegacy}</a>
          <p>{locationLines[0]}<br/>{locationLines[1]}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">{d.date}</p><h1>{d.greeting}</h1><p>{d.summary}</p></div>
          <div className="top-actions"><LanguageSelector/><button className="ghost">{d.exportReport}</button><button className="primary">+ {d.newTransaction}</button><div className="avatar">MA</div></div>
        </header>

        <section className="metrics-grid">
          {metrics.map((metric) => {
            const copy = d.metricItems[metric.key];
            return <MetricCard metric={metric} label={copy.label} change={copy.change} key={metric.key}/>;
          })}
        </section>

        <section className="panel module-preview">
          <div className="panel-head"><div><p className="eyebrow">{d.erpFoundation}</p><h2>{d.coreModules}</h2></div><Link className="text-button" href="/modules">{d.viewAllModules} →</Link></div>
          <div className="module-preview-grid">
            {mustHaveModules.slice(0, 4).map((module) => {
              const copy = dictionary.moduleItems[module.slug];
              return <Link href={`/modules/${module.slug}`} key={module.slug}><span>{d.phase} {module.phase}</span><strong>{copy.shortTitle}</strong><p>{copy.description}</p></Link>;
            })}
          </div>
        </section>

        <section className="content-grid">
          <article className="panel performance-panel">
            <div className="panel-head"><div><p className="eyebrow">{d.financialPerformance}</p><h2>{d.revenueOverview}</h2></div><select aria-label={d.period}><option>{d.last12Months}</option></select></div>
            <div className="revenue-summary"><strong>ETB 1,284,500</strong><span>+18.2% {d.fromLastYear}</span></div>
            <div className="chart" aria-label={d.revenueChart}>{monthlyPerformance.map((height, index) => <div className="bar-wrap" key={d.months[index]}><div className="bar" style={{height: `${Math.min(height, 100)}%`}}/><small>{d.months[index]}</small></div>)}</div>
          </article>

          <article className="panel health-panel">
            <div className="panel-head"><div><p className="eyebrow">{d.businessHealth}</p><h2>{d.excellentCondition}</h2></div><span className="score">86</span></div>
            <div className="health-ring"><div><strong>86</strong><span>/100</span></div></div>
            <ul><li><span>{d.cashFlow}</span><strong>{d.strong}</strong></li><li><span>{d.expenseControl}</span><strong>{d.good}</strong></li><li><span>{d.debtCollection}</span><strong>{d.needsAttention}</strong></li></ul>
          </article>
        </section>

        <section className="panel transactions-panel">
          <div className="panel-head"><div><p className="eyebrow">{d.latestActivity}</p><h2>{d.recentTransactions}</h2></div><button className="text-button">{d.viewAll} →</button></div>
          <div className="transaction-list">
            {transactions.map((transaction) => {
              const copy = d.transactionItems[transaction.key];
              return <div className="transaction" key={transaction.id}><div className={`transaction-mark ${transaction.type}`}>{transaction.type === "income" ? "↗" : "↙"}</div><div className="transaction-main"><strong>{copy.description}</strong><span>{transaction.id} · {copy.category}</span></div><time>{copy.date}</time><strong className={transaction.type}>{transaction.amount}</strong></div>;
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
