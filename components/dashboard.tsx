"use client";

import Link from "next/link";
import { mustHaveModules } from "../lib/erp-modules";
import type { DashboardSnapshot } from "../lib/data/types";
import { LanguageSelector, useLanguage } from "./language-provider";
import { DemoNotice } from "./demo-notice";

const metricMeta = {
  sales: { tone: "positive", icon: "sales" },
  expenses: { tone: "warning", icon: "expense" },
  cash: { tone: "positive", icon: "cash" },
  debt: { tone: "neutral", icon: "debt" },
} as const;

function Icon({ name }: { name: "sales" | "expense" | "cash" | "debt" }) {
  const paths = {
    sales: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
    expense: <><path d="M12 3v18"/><path d="m17 8-5-5-5 5"/><path d="m7 16 5 5 5-5"/></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M17 14h.01"/><circle cx="12" cy="12" r="2"/></>,
    debt: <><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function money(value: number, language: string) {
  return new Intl.NumberFormat(language === "am" ? "am-ET" : language === "ti" ? "ti-ET" : "en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(value);
}

function dynamicDate(language: string) {
  return new Intl.DateTimeFormat(language === "am" ? "am-ET" : language === "ti" ? "ti-ET" : "en-ET", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

function greeting(language: string, firstName: string) {
  const hour = new Date().getHours();
  if (language === "am") return `${hour < 12 ? "እንደምን አደሩ" : hour < 18 ? "እንደምን ዋሉ" : "እንደምን አመሹ"}፣ ${firstName}`;
  if (language === "ti") return `${hour < 12 ? "ከመይ ሓዲርኩም" : hour < 18 ? "ከመይ ውዒልኩም" : "ከመይ ኣምሲኹም"}፣ ${firstName}`;
  return `${hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, ${firstName}`;
}

export function Dashboard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { dictionary, language } = useLanguage();
  const d = dictionary.dashboard;
  const metricValues = snapshot.metrics;
  const navItems = [
    { label: d.nav.overview, href: "/" },
    { label: d.nav.modules, href: "/modules" },
    { label: d.nav.finance, href: "/finance/journals" },
    { label: d.nav.sales, href: "/sales/invoices/new" },
    { label: d.nav.purchasing, href: "/modules/purchasing-expenses" },
    { label: d.nav.inventory, href: "/inventory" },
    { label: d.nav.reports, href: "/api/reports/dashboard" },
  ];

  return <div className="erp-shell">
    <aside className="sidebar">
      <div className="brand"><span>H</span><div><strong>Hisab</strong><small>{d.brandSubtitle}</small></div></div>
      <LanguageSelector compact />
      <nav>{navItems.map((item, index) => <Link className={index === 0 ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}</nav>
      <div className="sidebar-footer"><a href="/legacy">{d.openLegacy}</a><p>{snapshot.organizationName}<br/>Addis Ababa, Ethiopia</p></div>
    </aside>
    <main className="workspace">
      <DemoNotice mode={snapshot.mode} />
      <header className="topbar">
        <div><p className="eyebrow">{dynamicDate(language)}</p><h1>{greeting(language, snapshot.userName)}</h1><p>{d.summary}</p></div>
        <div className="top-actions"><LanguageSelector/><Link className="ghost action-link" href="/api/reports/dashboard">{d.exportReport}</Link><Link className="primary action-link" href="/sales/invoices/new">+ {d.newTransaction}</Link><div className="avatar">{snapshot.userName.slice(0, 2).toUpperCase()}</div></div>
      </header>
      <section className="metrics-grid">{(["sales", "expenses", "cash", "debt"] as const).map((key) => { const meta = metricMeta[key]; const copy = d.metricItems[key]; return <article className="metric-card" key={key}><div className={`metric-icon ${meta.tone}`}><Icon name={meta.icon}/></div><div><p>{copy.label}</p><strong>{money(metricValues[key], language)}</strong><span className={meta.tone}>{copy.change}</span></div></article>; })}</section>
      <section className="panel module-preview"><div className="panel-head"><div><p className="eyebrow">{d.erpFoundation}</p><h2>{d.coreModules}</h2></div><Link className="text-button" href="/modules">{d.viewAllModules} →</Link></div><div className="module-preview-grid">{mustHaveModules.slice(0, 4).map((module) => { const copy = dictionary.moduleItems[module.slug]; return <Link href={`/modules/${module.slug}`} key={module.slug}><span>{d.phase} {module.phase}</span><strong>{copy.shortTitle}</strong><p>{copy.description}</p></Link>; })}</div></section>
      <section className="content-grid">
        <article className="panel performance-panel"><div className="panel-head"><div><p className="eyebrow">{d.financialPerformance}</p><h2>{d.revenueOverview}</h2></div><span className="period-pill">{d.last12Months}</span></div><div className="revenue-summary"><strong>{money(snapshot.monthlyRevenue.reduce((sum, value) => sum + value, 0), language)}</strong><span>+18.2% {d.fromLastYear}</span></div><div className="chart" aria-label={d.revenueChart}>{snapshot.monthlyRevenue.map((value, index) => { const max = Math.max(...snapshot.monthlyRevenue, 1); return <div className="bar-wrap" key={`${index}-${value}`}><div className="bar" style={{height: `${Math.max(8, (value / max) * 100)}%`}}/><small>{d.months[index] ?? index + 1}</small></div>; })}</div></article>
        <article className="panel health-panel"><div className="panel-head"><div><p className="eyebrow">{d.businessHealth}</p><h2>{d.excellentCondition}</h2></div><span className="score">{snapshot.health.score}</span></div><div className="health-ring" style={{ background: `conic-gradient(var(--green) 0 ${snapshot.health.score}%,#e5e7eb ${snapshot.health.score}%)` }}><div><strong>{snapshot.health.score}</strong><span>/100</span></div></div><ul><li><span>{d.cashFlow}</span><strong>{d.strong}</strong></li><li><span>{d.expenseControl}</span><strong>{d.good}</strong></li><li><span>{d.debtCollection}</span><strong>{d.needsAttention}</strong></li></ul></article>
      </section>
      <section className="panel transactions-panel"><div className="panel-head"><div><p className="eyebrow">{d.latestActivity}</p><h2>{d.recentTransactions}</h2></div><Link className="text-button" href="/finance/journals">{d.viewAll} →</Link></div><div className="transaction-list">{snapshot.recentTransactions.map((transaction) => <div className="transaction" key={transaction.id}><div className={`transaction-mark ${transaction.type}`}>{transaction.type === "income" ? "↗" : "↙"}</div><div className="transaction-main"><strong>{transaction.description}</strong><span>{transaction.id} · {transaction.category}</span></div><time>{new Intl.DateTimeFormat(language === "am" ? "am-ET" : language === "ti" ? "ti-ET" : "en-ET", { dateStyle: "medium" }).format(new Date(transaction.date))}</time><strong className={transaction.type}>{transaction.type === "income" ? "+" : "−"} {money(transaction.amount, language)}</strong></div>)}</div></section>
    </main>
  </div>;
}
