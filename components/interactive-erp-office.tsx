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
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
type HeroMetric = { label: string; value: string; note?: string };
type HeroRow = { label: string; value: string; meta?: string };

type InteractiveErpOfficeProps = {
  moduleTitle: string;
  moduleEyebrow?: string;
  metrics: HeroMetric[];
  rows: HeroRow[];
  compact?: boolean;
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
  if (normalized === 'partial' || normalized === 'review') return 'attention';
  return 'neutral';
}

function toAmount(value: string, index: number) {
  if (/ETB|%|\d/.test(value)) return value;
  return ['ETB 126,500', 'ETB 89,760', 'ETB 45,600', 'ETB 73,200', 'ETB 18,975'][index] ?? value;
}

export function InteractiveErpOffice({ moduleTitle, moduleEyebrow = 'Connected operating workspace', metrics, rows, compact = false }: InteractiveErpOfficeProps) {
  const [view, setView] = useState<ViewId>('records');

  const records = useMemo(() => {
    const source = rows.length ? rows : [{ label: 'Selam Supermarket', value: 'ETB 126,500', meta: 'Current record' }];
    return Array.from({ length: 5 }, (_, index) => {
      const row = source[index % source.length];
      return {
        reference: `${moduleTitle.toLowerCase().includes('integration') ? 'INT' : 'INV'}-26-${String(891 - index).padStart(4, '0')}`,
        date: `${31 - index} Aug 2026`,
        record: row.label,
        branch: branches[index],
        amount: toAmount(row.value, index),
        status: statuses[index],
        meta: row.meta,
      };
    });
  }, [moduleTitle, rows]);

  return (
    <IconoirProvider iconProps={{ width: 17, height: 17, strokeWidth: 1.55, 'aria-hidden': true }}>
      <div className={`erp-evidence${compact ? ' erp-evidence-compact' : ''}`} aria-label={`${moduleTitle} live Biloo ERP interface preview`}>
        <header className="erp-evidence-topbar">
          <div className="erp-evidence-brand"><span>b.</span><strong>Biloo ERP</strong></div>
          <nav aria-label="Product breadcrumb"><span>Workspace</span><b>/</b><strong>{moduleTitle}</strong></nav>
          <div className="erp-evidence-toolbar">
            <button type="button"><Calendar />Aug 2026</button>
            <button type="button" aria-label="Filter records"><FilterList /></button>
            <button type="button" aria-label="Export records"><Download /></button>
          </div>
        </header>

        <div className="erp-evidence-layout">
          <aside className="erp-evidence-sidebar" aria-label="ERP navigation">
            {navigation.map(({ label, Icon }, index) => <button className={index === 1 ? 'active' : undefined} type="button" key={label}><Icon /><span>{label}</span></button>)}
          </aside>

          <section className="erp-evidence-content">
            <div className="erp-evidence-heading">
              <div><span>{moduleEyebrow}</span><h2>{moduleTitle}</h2></div>
              <button type="button" className="erp-evidence-create"><Plus />New record</button>
            </div>

            <div className="erp-evidence-tabs" role="tablist" aria-label={`${moduleTitle} preview views`}>
              {([
                ['records', 'Records'],
                ['trend', 'Performance'],
                ['controls', 'Controls'],
              ] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={view === id} className={view === id ? 'active' : undefined} onClick={() => setView(id)} key={id}>{label}</button>)}
            </div>

            <div className="erp-evidence-metrics">
              {metrics.slice(0, 3).map((metric, index) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small className={index === 1 ? 'attention' : undefined}>{metric.note || 'Updated now'}</small></article>)}
            </div>

            {view === 'records' ? (
              <div className="erp-evidence-table-wrap">
                <table className="erp-evidence-table">
                  <thead><tr><th>Reference</th><th>Date</th><th>Record</th><th>Branch</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>{records.map((record) => <tr key={record.reference}><td><strong>{record.reference}</strong></td><td>{record.date}</td><td><span>{record.record}</span><small>{record.meta}</small></td><td>{record.branch}</td><td>{record.amount}</td><td><b className={`erp-status ${statusClass(record.status)}`}>{record.status}</b></td></tr>)}</tbody>
                </table>
              </div>
            ) : null}

            {view === 'trend' ? (
              <div className="erp-evidence-analysis">
                <div><span>Revenue performance</span><strong>ETB 4.82M</strong><small>+18.6% compared with July</small></div>
                <div className="erp-evidence-chart" aria-label="Revenue performance from March to August 2026">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#e8ebf0" vertical={false} />
                      <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 10 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#788395', fontSize: 9 }} tickFormatter={(value) => `ETB ${value}M`} />
                      <Tooltip formatter={(value) => [`ETB ${value}M`, 'Revenue']} contentStyle={{ border: '1px solid #dfe3ea', borderRadius: 6, boxShadow: '0 10px 30px rgba(16,36,74,.1)', fontSize: 11 }} />
                      <Area type="monotone" dataKey="value" stroke="#315efb" fill="#315efb" fillOpacity={0.08} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {view === 'controls' ? (
              <div className="erp-evidence-controls">
                <article><CheckCircle /><div><strong>Payment controls</strong><span>All August receipts reconciled</span></div><b>Ready</b></article>
                <article><WarningCircle /><div><strong>Approval queue</strong><span>3 records require finance review</span></div><b>Review</b></article>
                <article><CheckCircle /><div><strong>Audit evidence</strong><span>Source documents attached</span></div><b>Complete</b></article>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </IconoirProvider>
  );
}
