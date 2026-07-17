import Link from "next/link";
import { DemoNotice } from "../../components/demo-notice";
import { SectionShell } from "../../components/section-shell";
import { getDashboardSnapshot } from "../../lib/data/erp";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ReportsPage() {
  const snapshot = await getDashboardSnapshot();
  const metrics = [
    ["Sales", snapshot.metrics.sales],
    ["Expenses", snapshot.metrics.expenses],
    ["Cash", snapshot.metrics.cash],
    ["Outstanding debt", snapshot.metrics.debt],
  ] as const;

  return (
    <SectionShell
      title="Reports"
      description="Review the latest business totals and export the dashboard report without leaving the ERP workspace."
      actions={<Link className="primary action-link" href="/api/reports/dashboard">Export CSV</Link>}
    >
      <DemoNotice mode={snapshot.mode} />

      <section className="metrics-grid" aria-label="Report summary">
        {metrics.map(([label, value]) => (
          <article className="metric-card" key={label}>
            <div>
              <p>{label}</p>
              <strong>{money(value)}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="data-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Dashboard report</p>
            <h2>Ready to export</h2>
          </div>
          <span className="status-badge">{snapshot.mode}</span>
        </div>
        <p>The CSV export includes the organization, current metrics, and recent transactions.</p>
      </section>
    </SectionShell>
  );
}
