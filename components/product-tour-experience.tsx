"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const scenes = [
  {
    id: "overview",
    label: "Executive dashboard",
    eyebrow: "Start with clarity",
    title: "See the business position in one glance.",
    description: "Revenue, cash, receivables, payables, stock attention and recent activity are brought into one decision-ready view.",
    metrics: [["Today’s revenue", "ETB 84,600", "+12.8%"], ["Cash available", "ETB 318,400", "Current"], ["Receivables", "ETB 72,900", "11 accounts"]],
    rows: [["Sale · Abeba Trading", "ETB 18,900", "Paid"], ["Supplier bill · Meron Distribution", "ETB 34,500", "Due"], ["Stock alert · Cooking Oil 5L", "7 units", "Reorder"]],
    bars: [44, 58, 52, 70, 78, 92],
    moduleHref: "/product/finance-cashflow",
  },
  {
    id: "sales",
    label: "Sales & invoicing",
    eyebrow: "Revenue workflow",
    title: "Move from sale to invoice to collection without losing the trail.",
    description: "Record the transaction, issue the invoice, collect full or partial payment and keep the customer balance current.",
    metrics: [["Sales today", "31", "Live"], ["Invoiced", "ETB 96,240", "Today"], ["Outstanding", "ETB 26,450", "4 invoices"]],
    rows: [["INV-1048 · Abeba Trading", "ETB 18,900", "Paid"], ["INV-1047 · Nuru Market", "ETB 12,400", "Partial"], ["INV-1046 · Selam Services", "ETB 8,750", "Due Friday"]],
    bars: [38, 64, 49, 76, 67, 94],
    moduleHref: "/product/sales-invoicing",
  },
  {
    id: "inventory",
    label: "Inventory control",
    eyebrow: "Stock visibility",
    title: "Know what is available, what is moving and what needs action.",
    description: "Sales, purchases and adjustments maintain a reliable quantity history while attention lists surface low-stock risk.",
    metrics: [["Inventory value", "ETB 684,200", "146 items"], ["Low stock", "9 items", "3 urgent"], ["Fastest mover", "A-24", "86 units"]],
    rows: [["Premium Coffee 1kg", "48 units", "Healthy"], ["Cooking Oil 5L", "7 units", "Reorder"], ["Packaging Box M", "126 units", "Stable"]],
    bars: [71, 56, 83, 48, 66, 88],
    moduleHref: "/product/inventory",
  },
  {
    id: "finance",
    label: "Finance & cash flow",
    eyebrow: "Financial control",
    title: "Understand cash and obligations before month-end.",
    description: "Daily activity becomes a current view of income, expenses, collections, supplier obligations and operating margin.",
    metrics: [["Net cash flow", "ETB 96,240", "Positive"], ["Operating margin", "31.8%", "+4.2 pts"], ["Payables", "ETB 41,200", "6 bills"]],
    rows: [["Collections received", "ETB 148,600", "This month"], ["Operating expenses", "ETB 126,800", "This month"], ["Supplier payments", "ETB 52,400", "This month"]],
    bars: [42, 50, 61, 58, 79, 87],
    moduleHref: "/product/finance-cashflow",
  },
  {
    id: "reports",
    label: "Reports & analytics",
    eyebrow: "Management insight",
    title: "Turn records into decisions without rebuilding spreadsheets.",
    description: "Compare periods, balances and operational performance using the same connected data that runs the business.",
    metrics: [["Revenue growth", "+24%", "Prior period"], ["Collection rate", "91.4%", "Current"], ["Inventory turnover", "4.8×", "Quarter"]],
    rows: [["Revenue performance", "+24%", "Improving"], ["Outstanding debt", "ETB 72,900", "11 accounts"], ["Expense ratio", "68.2%", "Improved"]],
    bars: [36, 49, 57, 68, 80, 96],
    moduleHref: "/product/reports-analytics",
  },
] as const;

export function ProductTourExperience({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState<(typeof scenes)[number]["id"]>("overview");
  const scene = useMemo(() => scenes.find((item) => item.id === activeId) ?? scenes[0], [activeId]);

  return (
    <section className={compact ? "product-tour product-tour-compact" : "product-tour"} aria-label="Interactive HisabERP product tour">
      <div className="product-tour-tabs" role="tablist" aria-label="Product areas">
        {scenes.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={item.id === activeId}
            aria-controls="product-tour-panel"
            className={item.id === activeId ? "active" : undefined}
            onClick={() => setActiveId(item.id)}
            key={item.id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className="product-tour-stage" id="product-tour-panel" role="tabpanel">
        <div className="product-tour-copy">
          <span className="marketing-eyebrow">{scene.eyebrow}</span>
          <h2>{scene.title}</h2>
          <p>{scene.description}</p>
          <div className="product-tour-copy-actions">
            <Link href={scene.moduleHref} className="marketing-start">Explore this module</Link>
            {!compact && <Link href="/request-demo" className="marketing-demo">Request a guided demo</Link>}
          </div>
        </div>

        <div className="tour-app-window">
          <div className="tour-window-top">
            <div><i /><i /><i /></div>
            <strong>HisabERP · {scene.label}</strong>
            <span>Live workspace</span>
          </div>
          <div className="tour-window-layout">
            <aside>
              <img src="/hisab-logo.svg" alt="" width="34" height="34" />
              {scenes.map((item) => <span className={item.id === activeId ? "active" : undefined} key={item.id}>{item.label}</span>)}
            </aside>
            <div className="tour-window-content">
              <div className="tour-content-heading"><div><small>Good afternoon</small><h3>{scene.label}</h3></div><button type="button">+ New record</button></div>
              <div className="tour-metrics">
                {scene.metrics.map(([label, value, note]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>{note}</span></article>)}
              </div>
              <div className="tour-data-grid">
                <section className="tour-chart">
                  <header><strong>Performance trend</strong><small>Last six periods</small></header>
                  <div className="tour-bars">{scene.bars.map((height, index) => <span style={{ height: `${height}%` }} key={`${scene.id}-${index}`} />)}</div>
                </section>
                <section className="tour-activity">
                  <header><strong>Current activity</strong><small>Updated now</small></header>
                  <div>{scene.rows.map(([label, value, meta]) => <article key={label}><span><strong>{label}</strong><small>{meta}</small></span><b>{value}</b></article>)}</div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
