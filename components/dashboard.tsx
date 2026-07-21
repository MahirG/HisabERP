"use client";

import Link from "next/link";
import { erpModules } from "../lib/erp-modules";
import type { DashboardSnapshot, UserContext } from "../lib/data/types";
import { dashboardRoleProfiles } from "./dashboard-role-profiles";
import { getDashboardInterfaceCopy } from "./dashboard-interface-copy";
import { DemoNotice } from "./demo-notice";
import { LanguageSelector, useLanguage } from "./language-provider";
import { LocalGreeting } from "./local-greeting";
import { Icon, type IconName } from "./ui/icon";
import {
  ActionAlert,
  EmptyState,
  MetricTile,
  StatusBadge,
  WorkspacePageHeader,
  type WorkspaceTone,
} from "./ui/workspace-primitives";

function money(value: number, language: string) {
  return new Intl.NumberFormat(language === "am" ? "am-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

function routeIcon(href: string): IconName {
  if (href.includes("security")) return "shield-check";
  if (href.includes("invoice") || href.includes("journal")) return "file-check";
  if (href.includes("inventory")) return "boxes";
  if (href.includes("customer")) return "users";
  if (href.includes("report")) return "chart";
  if (href.includes("onboarding")) return "building";
  if (href.includes("purchasing")) return "receipt";
  if (href.includes("finance")) return "landmark";
  if (href.includes("sales")) return "shopping-cart";
  return "grid";
}

function healthTone(status: "strong" | "good" | "attention"): WorkspaceTone {
  if (status === "strong") return "success";
  if (status === "good") return "info";
  return "warning";
}

export function Dashboard({ snapshot, user }: { snapshot: DashboardSnapshot; user: UserContext }) {
  const { dictionary, language } = useLanguage();
  const d = dictionary.dashboard;
  const ui = getDashboardInterfaceCopy(language);
  const metrics = snapshot.metrics;
  const profile = dashboardRoleProfiles[user.role];
  const operatingResult = metrics.sales - metrics.expenses;
  const resultTone: WorkspaceTone = operatingResult >= 0 ? "success" : "danger";
  const receivableTone: WorkspaceTone = metrics.debt > metrics.cash ? "warning" : "neutral";
  const scoreTone: WorkspaceTone = snapshot.health.score >= 80 ? "success" : snapshot.health.score >= 60 ? "warning" : "danger";
  const roleModules = profile.moduleSlugs
    .map((slug) => erpModules.find((module) => module.slug === slug))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));
  const healthLabel = (status: "strong" | "good" | "attention") => status === "strong" ? d.strong : status === "good" ? d.good : d.needsAttention;

  return (
    <main className="dashboard-content financial-dashboard" data-dashboard-role={user.role}>
      <WorkspacePageHeader
        breadcrumb={<><Link href="/">{ui.home}</Link><Icon name="chevron-right" size={12} /><span>{ui.dashboard}</span></>}
        eyebrow={<><Icon name="activity" size={14} /><LocalGreeting language={language} firstName={snapshot.userName} /></>}
        title={ui.overview}
        description={profile.summary}
        meta={<><StatusBadge label={profile.title} tone="info" /><span>{ui.roleContext}</span></>}
        actions={<><span className="workspace-status"><i />{ui.liveWorkspace}</span><LanguageSelector /><Link className="secondary action-link" href="/api/reports/dashboard"><Icon name="download" size={16} /><span>{d.exportReport}</span></Link><Link className="primary action-link" href={profile.quickAction.href}><Icon name="plus" size={16} /><span>{profile.quickAction.label}</span></Link></>}
      />

      <DemoNotice mode={snapshot.mode} />

      <section className="workspace-section financial-snapshot-section" aria-labelledby="financial-snapshot-title">
        <div className="workspace-section-heading">
          <div><p className="workspace-eyebrow"><Icon name="circle-dollar" size={14} />{ui.financialSnapshot}</p><h2 id="financial-snapshot-title">{ui.financialSnapshot}</h2><p>{ui.financialSnapshotDescription}</p></div>
          <Link className="workspace-inline-action" href="/finance"><span>{ui.reviewFinance}</span><Icon name="arrow-right" size={14} /></Link>
        </div>
        <div className="financial-metric-grid">
          <MetricTile label={ui.sales} value={money(metrics.sales, language)} detail={d.metricItems.sales.change} icon="chart" tone="success" />
          <MetricTile label={ui.expenses} value={money(metrics.expenses, language)} detail={d.metricItems.expenses.change} icon="receipt" tone="warning" />
          <MetricTile label={ui.cash} value={money(metrics.cash, language)} detail={d.metricItems.cash.change} icon="wallet" tone="info" />
          <MetricTile label={ui.receivables} value={money(metrics.debt, language)} detail={d.metricItems.debt.change} icon="file-check" tone={receivableTone} />
          <MetricTile label={ui.operatingResult} value={money(operatingResult, language)} detail={operatingResult >= 0 ? ui.positiveResult : ui.negativeResult} icon={operatingResult >= 0 ? "trending-up" : "trending-down"} tone={resultTone} />
        </div>
      </section>

      <section className="workspace-section attention-section" aria-labelledby="attention-title">
        <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="alert-triangle" size={14} />{ui.attention}</p><h2 id="attention-title">{ui.attention}</h2><p>{ui.attentionDescription}</p></div></div>
        <div className="workspace-action-alert-list">
          <ActionAlert title={ui.collectReceivables} description={ui.collectReceivablesDescription} value={money(metrics.debt, language)} href="/customers" actionLabel={ui.reviewCustomers} icon="users" tone={receivableTone} />
          <ActionAlert title={ui.operatingMargin} description={ui.operatingMarginDescription} value={money(operatingResult, language)} href="/finance" actionLabel={ui.reviewFinance} icon={operatingResult >= 0 ? "trending-up" : "trending-down"} tone={resultTone} />
          <ActionAlert title={ui.reconciliation} description={ui.reconciliationDescription} href="/reconciliation" actionLabel={ui.reconcile} icon="refresh-cw" tone="info" />
          <ActionAlert title={ui.businessHealth} description={ui.businessHealthDescription} value={`${snapshot.health.score}/100`} href="/reports" actionLabel={ui.openReports} icon="activity" tone={scoreTone} />
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="recommended-workspaces-title">
        <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="grid" size={14} />{profile.heading}</p><h2 id="recommended-workspaces-title">{ui.recommendedWorkspaces}</h2><p>{ui.recommendedWorkspacesDescription}</p></div></div>
        <div className="role-priority-grid financial-priority-grid">
          {profile.workspace.map((item) => <Link href={item.href} key={item.label}><span className="workspace-link-icon"><Icon name={routeIcon(item.href)} size={17} /></span><div><strong>{item.label}</strong><p>{item.description}</p></div><Icon className="dashboard-arrow" name="arrow-right" size={15} /></Link>)}
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="priority-modules-title">
        <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="grid" size={14} />ERP</p><h2 id="priority-modules-title">{ui.priorityModules}</h2></div><Link className="workspace-inline-action" href="/modules"><span>{d.viewAllModules}</span><Icon name="arrow-right" size={14} /></Link></div>
        <div className="module-preview-grid financial-module-grid">
          {roleModules.map((module) => { const copy = dictionary.moduleItems[module.slug]; return <Link href={`/modules/${module.slug}`} key={module.slug}><span className="workspace-link-icon"><Icon name={routeIcon(`/modules/${module.slug}`)} size={17} /></span><small>{d.phase} {module.phase}</small><strong>{copy.shortTitle}</strong><p>{copy.description}</p><b>{ui.exploreModule}<Icon name="arrow-right" size={14} /></b></Link>; })}
        </div>
      </section>

      <section className="financial-analysis-grid">
        <article className="workspace-section performance-panel">
          <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="chart" size={14} />{ui.performance}</p><h2>{d.revenueOverview}</h2></div><StatusBadge label={d.last12Months} /></div>
          <div className="revenue-summary"><strong>{money(snapshot.monthlyRevenue.reduce((sum, value) => sum + value, 0), language)}</strong><span>+18.2% {d.fromLastYear}</span></div>
          <div className="chart" aria-label={d.revenueChart}>{snapshot.monthlyRevenue.map((value, index) => { const max = Math.max(...snapshot.monthlyRevenue, 1); return <div className="bar-wrap" key={`${index}-${value}`}><div className="bar" style={{ height: `${Math.max(8, (value / max) * 100)}%` }} /><small>{d.months[index] ?? index + 1}</small></div>; })}</div>
        </article>
        <article className="workspace-section health-panel">
          <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="activity" size={14} />{ui.businessHealth}</p><h2>{d.excellentCondition}</h2></div><StatusBadge label={`${snapshot.health.score}/100`} tone={scoreTone} /></div>
          <div className="health-summary-bar" aria-label={`${snapshot.health.score} out of 100`}><span style={{ width: `${snapshot.health.score}%` }} /></div>
          <ul className="health-status-list"><li><span>{d.cashFlow}</span><StatusBadge label={healthLabel(snapshot.health.cashFlow)} tone={healthTone(snapshot.health.cashFlow)} /></li><li><span>{d.expenseControl}</span><StatusBadge label={healthLabel(snapshot.health.expenseControl)} tone={healthTone(snapshot.health.expenseControl)} /></li><li><span>{d.debtCollection}</span><StatusBadge label={healthLabel(snapshot.health.debtCollection)} tone={healthTone(snapshot.health.debtCollection)} /></li></ul>
        </article>
      </section>

      <section className="workspace-section transactions-panel" aria-labelledby="recent-transactions-title">
        <div className="workspace-section-heading"><div><p className="workspace-eyebrow"><Icon name="activity" size={14} />{ui.recentActivity}</p><h2 id="recent-transactions-title">{d.recentTransactions}</h2><p>{ui.recentActivityDescription}</p></div><Link className="workspace-inline-action" href="/finance/journals"><span>{ui.viewAll}</span><Icon name="arrow-right" size={14} /></Link></div>
        {snapshot.recentTransactions.length ? <div className="workspace-table-frame"><table className="workspace-data-table"><thead><tr><th>{ui.transaction}</th><th>{ui.category}</th><th>{ui.date}</th><th className="numeric-cell">{ui.amount}</th></tr></thead><tbody>{snapshot.recentTransactions.map((transaction) => <tr key={transaction.id}><td><div className="transaction-identity"><span className={`transaction-mark ${transaction.type}`}><Icon name={transaction.type === "income" ? "trending-up" : "trending-down"} size={15} /></span><div><strong>{transaction.description}</strong><small>{transaction.id}</small></div></div></td><td>{transaction.category}</td><td><time>{new Intl.DateTimeFormat(language === "am" ? "am-ET" : "en-ET", { dateStyle: "medium" }).format(new Date(transaction.date))}</time></td><td className={`numeric-cell amount-${transaction.type}`}>{transaction.type === "income" ? "+" : "−"} {money(transaction.amount, language)}</td></tr>)}</tbody></table></div> : <EmptyState icon="receipt" title={ui.noTransactions} description={ui.noTransactionsDescription} action={<Link className="secondary action-link" href="/finance/journals">{ui.viewAll}</Link>} />}
      </section>
    </main>
  );
}
