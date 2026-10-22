'use client';

import { useMemo, useState } from 'react';
import {
  Bank,
  Calendar,
  Cart,
  CheckCircle,
  Cube,
  Dashboard,
  Download,
  FilterList,
  IconoirProvider,
  Page,
  Plus,
  Reports,
  Settings,
  WarningCircle,
} from 'iconoir-react';
import { MarketingTrendChart } from './marketing-trend-chart';
type HeroMetric = { label: string; value: string; note?: string };
type HeroRow = { label: string; value: string; meta?: string };

type InteractiveErpOfficeProps = {
  moduleTitle: string;
  moduleEyebrow?: string;
  metrics: HeroMetric[];
  rows: HeroRow[];
  compact?: boolean;
  illustrative?: boolean;
  informational?: boolean;
};

type ViewId = 'records' | 'trend' | 'controls';

const navigation = [
  { label: 'Overview', Icon: Dashboard },
  { label: 'Sales', Icon: Cart },
  { label: 'Purchases', Icon: Page },
  { label: 'Inventory', Icon: Cube },
  { label: 'Finance', Icon: Bank },
  { label: 'Reports', Icon: Reports },
  { label: 'Settings', Icon: Settings },
];

const financeCashflowData = [
  { period: 'Mar', value: 64 },
  { period: 'Apr', value: 72 },
  { period: 'May', value: 68 },
  { period: 'Jun', value: 88 },
  { period: 'Jul', value: 83 },
  { period: 'Aug', value: 96 },
];

const salesRevenueData = [
  { period: 'Mon', value: 54.3 },
  { period: 'Tue', value: 67.8 },
  { period: 'Wed', value: 61.5 },
  { period: 'Thu', value: 72.2 },
  { period: 'Fri', value: 78.1 },
  { period: 'Sat', value: 84.6 },
];

const chartData = [
  { period: 'Mar', value: 2.9 },
  { period: 'Apr', value: 3.7 },
  { period: 'May', value: 3.35 },
  { period: 'Jun', value: 4.1 },
  { period: 'Jul', value: 3.82 },
  { period: 'Aug', value: 4.82 },
];

const statuses = ['Paid', 'Approved', 'Partial', 'Posted', 'Review'] as const;
const branches = ['Addis HQ', 'Adama', 'Hawassa', 'Addis HQ', 'Mekelle'] as const;

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'paid' || normalized === 'approved' || normalized === 'posted') return 'positive';
  if (normalized === 'partial' || normalized === 'review' || normalized.startsWith('due') || normalized === 'overdue') return 'attention';
  return 'neutral';
}

function toAmount(value: string, index: number) {
  if (/ETB|%|\d/.test(value)) return value;
  return ['ETB 126,500', 'ETB 89,760', 'ETB 45,600', 'ETB 73,200', 'ETB 18,975'][index] ?? value;
}

export function InteractiveErpOffice({ moduleTitle, moduleEyebrow = 'Connected operating workspace', metrics, rows, compact = false, illustrative = false, informational = false }: InteractiveErpOfficeProps) {
  const [view, setView] = useState<ViewId>('records');
  const financePreview = illustrative && moduleTitle.toLowerCase().includes('finance');
  const inventoryPreview = illustrative && moduleTitle.toLowerCase().includes('inventory');
  const salesPreview = illustrative && moduleTitle.toLowerCase().includes('sales');
  const selectedPreviewNav = moduleTitle.toLowerCase().includes('finance') ? 'Finance'
    : moduleTitle.toLowerCase().includes('sales') ? 'Sales'
    : moduleTitle.toLowerCase().includes('inventory') ? 'Inventory'
    : moduleTitle.toLowerCase().includes('report') ? 'Reports' : 'Overview';

  const records = useMemo(() => {
    const source = rows.length ? rows : [{ label: 'Selam Supermarket', value: 'ETB 126,500', meta: 'Current record' }];
    return Array.from({ length: salesPreview ? source.length : 5 }, (_, index) => {
      const row = source[index % source.length];
      return {
        reference: salesPreview
          ? (row.label.match(/^(INV-[A-Za-z0-9-]+)/)?.[1] ?? `INV-SAMPLE-${index + 1}`)
          : `${moduleTitle.toLowerCase().includes('finance') ? 'FIN' : moduleTitle.toLowerCase().includes('integration') ? 'INT' : 'INV'}-26-${String(891 - index).padStart(4, '0')}`,
        date: `${31 - index} Aug 2026`,
        record: salesPreview ? row.label.replace(/^INV-[A-Za-z0-9-]+\s*[·–-]\s*/, '') : row.label,
        branch: branches[index],
        amount: illustrative ? row.value : toAmount(row.value, index),
        status: salesPreview ? (row.meta || 'Unspecified') : statuses[index],
        meta: row.meta,
      };
    });
  }, [moduleTitle, rows, illustrative, salesPreview]);

  return (
    <IconoirProvider iconProps={{ width: 17, height: 17, strokeWidth: 1.55, 'aria-hidden': true }}>
      <div className={`erp-evidence${compact ? ' erp-evidence-compact' : ''}`} aria-label={`${moduleTitle} ${illustrative ? 'illustrative sample interface' : 'Biloo ERP interface preview'}`}>
        <header className="erp-evidence-topbar">
          <div className="erp-evidence-brand"><span>b.</span><strong>Biloo ERP</strong></div>
          <nav aria-label="Product breadcrumb"><span>Workspace</span><b>/</b><strong>{moduleTitle}</strong></nav>
          {illustrative ? <span className="erp-evidence-sample-indicator">Sample data</span> : (
            <div className="erp-evidence-toolbar">
              <button type="button"><Calendar />Aug 2026</button>
              <button type="button" aria-label="Filter records"><FilterList /></button>
              <button type="button" aria-label="Export records"><Download /></button>
            </div>
          )}
        </header>

        <div className="erp-evidence-layout">
          <aside className="erp-evidence-sidebar" aria-label="ERP navigation">
            {navigation.map(({ label, Icon }, index) => illustrative
              ? <span className={label === selectedPreviewNav ? 'active' : undefined} key={label}><Icon /><span>{label}</span></span>
              : <button className={index === 1 ? 'active' : undefined} type="button" key={label}><Icon /><span>{label}</span></button>)}
          </aside>

          <section className="erp-evidence-content">
            <div className="erp-evidence-heading">
              <div><span>{moduleEyebrow}</span><h2>{moduleTitle}</h2></div>
              {illustrative ? <span className="erp-evidence-preview-label">Illustrative preview</span> : <button type="button" className="erp-evidence-create"><Plus />New record</button>}
            </div>

            <div className="erp-evidence-tabs" role="tablist" aria-label={`${moduleTitle} preview views`}>
              {([
                ['records', informational ? 'Summary' : financePreview ? 'Transactions' : inventoryPreview ? 'Stock items' : salesPreview ? 'Invoices' : 'Records'],
                ['trend', informational ? 'Highlights' : financePreview ? 'Cash trends' : inventoryPreview ? 'Movement' : salesPreview ? 'Sales trends' : 'Performance'],
                ['controls', informational ? 'Context' : salesPreview ? 'Collections' : 'Controls'],
              ] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={view === id} className={view === id ? 'active' : undefined} onClick={() => setView(id)} key={id}>{label}</button>)}
            </div>

            <div className="erp-evidence-metrics">
              {metrics.slice(0, 3).map((metric, index) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small className={index === 1 ? 'attention' : undefined}>{metric.note || 'Updated now'}</small></article>)}
            </div>

            {view === 'records' && informational ? (
              <div className="erp-evidence-information" role="tabpanel" aria-label={`${moduleTitle} summary`}>
                {rows.slice(0, 4).map((row, index) => (
                  <article key={`${index}-${row.label}`}>
                    <div><span>{String(index + 1).padStart(2, '0')}</span><strong>{row.label}</strong></div>
                    <p>{row.meta || moduleEyebrow}</p>
                    <b>{row.value}</b>
                  </article>
                ))}
              </div>
            ) : null}

            {view === 'records' && !informational ? (
              <div className="erp-evidence-table-wrap">
                <table className="erp-evidence-table">
                  <thead><tr><th>{salesPreview ? 'Invoice' : 'Reference'}</th><th>Date</th><th>{salesPreview ? 'Customer' : 'Record'}</th><th>Branch</th><th>{inventoryPreview ? 'Quantity' : 'Amount'}</th><th>Status</th></tr></thead>
                  <tbody>{records.map((record) => <tr key={record.reference}><td><strong>{record.reference}</strong></td><td>{record.date}</td><td><span>{record.record}</span><small>{salesPreview ? record.reference : record.meta}</small></td><td>{record.branch}</td><td>{record.amount}</td><td><b className={`erp-status ${statusClass(record.status)}`}>{record.status}</b></td></tr>)}</tbody>
                </table>
              </div>
            ) : null}

            {view === 'trend' && informational ? (
              <div className="erp-evidence-information" role="tabpanel" aria-label={`${moduleTitle} highlights`}>
                {metrics.slice(0, 3).map((metric, index) => (
                  <article key={metric.label}>
                    <div><span>{String(index + 1).padStart(2, '0')}</span><strong>{metric.label}</strong></div>
                    <p>{metric.note || 'Public information'}</p>
                    <b>{metric.value}</b>
                  </article>
                ))}
              </div>
            ) : null}

            {view === 'trend' && !informational ? (
              <div className="erp-evidence-analysis">
                <div><span>{financePreview ? 'Sample net cash flow' : inventoryPreview ? 'Illustrative stock movement' : salesPreview ? 'Illustrative sales revenue' : 'Revenue performance'}</span><strong>{financePreview ? (metrics[1]?.value ?? 'ETB 96,240') : inventoryPreview ? (metrics[0]?.value ?? 'Sample inventory') : salesPreview ? (metrics[0]?.value ?? 'ETB 84,600') : 'ETB 4.82M'}</strong><small>{financePreview ? 'Illustrative trend, March–August 2026' : inventoryPreview ? 'Sample movement trend, March–August 2026' : salesPreview ? 'Sample week, Monday–Saturday' : '+18.6% compared with July'}</small></div>
                <div className="erp-evidence-chart" aria-label={financePreview ? "Sample net cash flow from March to August 2026" : inventoryPreview ? "Illustrative stock movement, March to August 2026" : salesPreview ? "Illustrative daily sales, Monday through Saturday" : "Revenue performance from March to August 2026"}>
                  <MarketingTrendChart
                    data={financePreview ? financeCashflowData : salesPreview ? salesRevenueData : chartData}
                    label={financePreview ? 'Sample net cash flow' : inventoryPreview ? 'Illustrative stock movement' : salesPreview ? 'Illustrative sales revenue' : 'Revenue performance'}
                    color={financePreview || salesPreview ? '#b57b19' : '#315efb'}
                    formatValue={(value) => financePreview || salesPreview ? `ETB ${value}k` : inventoryPreview ? String(value) : `ETB ${value}M`}
                  />
                </div>
              </div>
            ) : null}

            {view === 'controls' && informational ? (
              <div className="erp-evidence-info-context" role="tabpanel" aria-label={`${moduleTitle} context`}>
                <strong>Explore the details below</strong>
                <p>This informational preview summarizes the public page. It is not connected to a customer account, and the figures shown are not live financial records.</p>
                <span>Review the page sections for current scope, qualifications and next steps.</span>
              </div>
            ) : null}

            {view === 'controls' && !informational ? (
              <div className="erp-evidence-controls">
                <article><CheckCircle /><div><strong>{salesPreview ? 'Invoice tracking' : 'Payment controls'}</strong><span>{salesPreview ? 'Sample paid and partial invoices' : 'All August receipts reconciled'}</span></div><b>Ready</b></article>
                <article><WarningCircle /><div><strong>{salesPreview ? 'Collection follow-up' : 'Approval queue'}</strong><span>{salesPreview ? 'Outstanding sample invoices to review' : '3 records require finance review'}</span></div><b>Review</b></article>
                <article><CheckCircle /><div><strong>{salesPreview ? 'Sales audit trail' : 'Audit evidence'}</strong><span>{salesPreview ? 'Illustrative invoice records retained' : 'Source documents attached'}</span></div><b>Complete</b></article>
              </div>
            ) : null}
          </section>
        </div>
        {illustrative ? <p className="erp-evidence-disclaimer">{informational ? 'Public information preview only. No customer data is shown.' : 'Illustrative figures and sample records only. Not connected to an account.'}</p> : null}
      </div>
    </IconoirProvider>
  );
}
