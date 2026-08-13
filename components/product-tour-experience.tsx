'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, IconoirProvider } from 'iconoir-react';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { InteractiveErpOffice } from './interactive-erp-office';

const scenes = [
  {
    id: 'overview', label: 'Executive dashboard', shortLabel: 'Overview', eyebrow: 'Start with clarity',
    title: 'See the business position in one disciplined view.',
    description: 'Revenue, cash, receivables, payables, stock attention and recent activity are brought into one decision-ready workspace.',
    metrics: [{ label: 'Revenue', value: 'ETB 4.82M', note: '+18.6% in August' }, { label: 'Cash', value: 'ETB 2.48M', note: '+8.4% in August' }, { label: 'Stock alerts', value: '12', note: 'Needs attention' }],
    rows: [{ label: 'Sales & invoicing', value: 'ETB 126,500', meta: 'Connected workspace' }, { label: 'Inventory control', value: '98.4%', meta: 'Stock visibility' }, { label: 'Finance & reports', value: 'Ready', meta: 'Decision view' }],
    moduleHref: '/product/finance-cashflow',
  },
  {
    id: 'sales', label: 'Sales & invoicing', shortLabel: 'Sales', eyebrow: 'Revenue workflow',
    title: 'Move from sale to invoice to collection without losing the trail.',
    description: 'Record the transaction, issue the invoice, collect full or partial payment and keep the customer balance current.',
    metrics: [{ label: 'Sales today', value: '31', note: 'Updated now' }, { label: 'Invoiced', value: 'ETB 96,240', note: 'August 2026' }, { label: 'Outstanding', value: 'ETB 26,450', note: '4 invoices' }],
    rows: [{ label: 'Abeba Trading', value: 'ETB 18,900', meta: 'Paid' }, { label: 'Nuru Market', value: 'ETB 12,400', meta: 'Partial' }, { label: 'Selam Services', value: 'ETB 8,750', meta: 'Due Friday' }],
    moduleHref: '/product/sales-invoicing',
  },
  {
    id: 'inventory', label: 'Inventory control', shortLabel: 'Inventory', eyebrow: 'Stock visibility',
    title: 'Know what is available, what is moving and what needs action.',
    description: 'Sales, purchases and adjustments maintain a reliable quantity history while attention lists surface low-stock risk.',
    metrics: [{ label: 'Inventory value', value: 'ETB 684,200', note: '146 items' }, { label: 'Low stock', value: '9 items', note: '3 urgent' }, { label: 'Fastest mover', value: 'A-24', note: '86 units' }],
    rows: [{ label: 'Premium coffee 1kg', value: '48 units', meta: 'Healthy' }, { label: 'Cooking oil 5L', value: '7 units', meta: 'Reorder' }, { label: 'Packaging box M', value: '126 units', meta: 'Stable' }],
    moduleHref: '/product/inventory',
  },
  {
    id: 'finance', label: 'Finance & cash flow', shortLabel: 'Finance', eyebrow: 'Financial control',
    title: 'Understand cash and obligations before month-end.',
    description: 'Daily activity becomes a current view of income, expenses, collections, supplier obligations and operating margin.',
    metrics: [{ label: 'Net cash flow', value: 'ETB 96,240', note: 'Positive' }, { label: 'Operating margin', value: '31.8%', note: '+4.2 pts' }, { label: 'Payables', value: 'ETB 41,200', note: '6 bills' }],
    rows: [{ label: 'Collections received', value: 'ETB 148,600', meta: 'August 2026' }, { label: 'Operating expenses', value: 'ETB 126,800', meta: 'August 2026' }, { label: 'Supplier payments', value: 'ETB 52,400', meta: 'August 2026' }],
    moduleHref: '/product/finance-cashflow',
  },
  {
    id: 'reports', label: 'Reports & analytics', shortLabel: 'Reports', eyebrow: 'Management insight',
    title: 'Turn records into decisions without rebuilding spreadsheets.',
    description: 'Compare periods, balances and operational performance using the same connected data that runs the business.',
    metrics: [{ label: 'Revenue growth', value: '+24%', note: 'Prior period' }, { label: 'Collection rate', value: '91.4%', note: 'Current' }, { label: 'Inventory turnover', value: '4.8×', note: 'Quarter' }],
    rows: [{ label: 'Revenue performance', value: '+24%', meta: 'Improving' }, { label: 'Outstanding debt', value: 'ETB 72,900', meta: '11 accounts' }, { label: 'Expense ratio', value: '68.2%', meta: 'Improved' }],
    moduleHref: '/product/reports-analytics',
  },
] as const;

type SceneId = (typeof scenes)[number]['id'];

export function ProductTourExperience({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState<SceneId>('overview');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = scenes.findIndex((item) => item.id === activeId);
  const scene = useMemo(() => scenes[activeIndex] ?? scenes[0], [activeIndex]);

  const activateIndex = (index: number, moveFocus = false) => {
    const normalized = (index + scenes.length) % scenes.length;
    setActiveId(scenes[normalized].id);
    if (moveFocus) window.requestAnimationFrame(() => tabRefs.current[normalized]?.focus());
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); activateIndex(index + 1, true); }
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); activateIndex(index - 1, true); }
    else if (event.key === 'Home') { event.preventDefault(); activateIndex(0, true); }
    else if (event.key === 'End') { event.preventDefault(); activateIndex(scenes.length - 1, true); }
  };

  return (
    <IconoirProvider iconProps={{ width: 17, height: 17, strokeWidth: 1.55, 'aria-hidden': true }}>
      <section className={compact ? 'product-tour product-tour-compact' : 'product-tour'} aria-label="Interactive Biloo ERP product tour" data-active-scene={scene.id}>
        <div className="product-tour-toolbar">
          <div><span>Interactive workspace</span><strong>{String(activeIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}</strong></div>
          <p>Direct product evidence · August 2026</p>
          <span className="product-tour-live">Live preview</span>
        </div>

        <div className="product-tour-tabs" role="tablist" aria-label="Product areas">
          {scenes.map((item, index) => <button ref={(node) => { tabRefs.current[index] = node; }} id={`product-tour-tab-${item.id}`} type="button" role="tab" tabIndex={item.id === activeId ? 0 : -1} aria-selected={item.id === activeId} aria-controls="product-tour-panel" className={item.id === activeId ? 'active' : undefined} onClick={() => setActiveId(item.id)} onKeyDown={(event) => handleTabKeyDown(event, index)} key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong></button>)}
        </div>

        <div className="product-tour-stage" id="product-tour-panel" role="tabpanel" aria-labelledby={`product-tour-tab-${scene.id}`} tabIndex={0}>
          <div className="product-tour-copy" aria-live="polite">
            <span className="marketing-eyebrow">{scene.eyebrow}</span><h2>{scene.title}</h2><p>{scene.description}</p>
            <div className="product-tour-copy-actions"><Link href={scene.moduleHref} className="marketing-start">Explore this module <ArrowRight /></Link>{!compact && <Link href="/request-demo" className="marketing-demo">Request a guided demo</Link>}</div>
            <div className="product-tour-scene-nav"><button type="button" onClick={() => activateIndex(activeIndex - 1)} aria-label="Show previous product area"><ArrowLeft />Previous</button><span>{scene.shortLabel}</span><button type="button" onClick={() => activateIndex(activeIndex + 1)} aria-label="Show next product area">Next<ArrowRight /></button></div>
          </div>
          <InteractiveErpOffice moduleTitle={scene.label} moduleEyebrow={`${scene.shortLabel} / August 2026`} metrics={[...scene.metrics]} rows={[...scene.rows]} compact />
        </div>
      </section>
    </IconoirProvider>
  );
}
