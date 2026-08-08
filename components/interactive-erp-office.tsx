'use client';

import { useMemo, useState, type CSSProperties, type PointerEvent } from 'react';
import './interactive-erp-office.css';

type HeroMetric = { label: string; value: string; note?: string };
type HeroRow = { label: string; value: string; meta?: string };

type InteractiveErpOfficeProps = {
  moduleTitle: string;
  moduleEyebrow?: string;
  metrics: HeroMetric[];
  rows: HeroRow[];
  compact?: boolean;
};

type ViewId = 'overview' | 'activity' | 'insights';

const views: Array<{ id: ViewId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'insights', label: 'Insights' },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function InteractiveErpOffice({ moduleTitle, moduleEyebrow = 'Live workspace', metrics, rows, compact = false }: InteractiveErpOfficeProps) {
  const [view, setView] = useState<ViewId>('overview');
  const [hovered, setHovered] = useState(false);

  const bars = useMemo(() => {
    const seed = moduleTitle.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 10 }, (_, index) => 34 + ((seed + index * 17) % 58));
  }, [moduleTitle]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--office-rx', `${clamp(-y * 1.7, -2.2, 2.2)}deg`);
    event.currentTarget.style.setProperty('--office-ry', `${clamp(x * 2.2, -2.8, 2.8)}deg`);
  }

  function resetTilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--office-rx', '0deg');
    event.currentTarget.style.setProperty('--office-ry', '0deg');
    setHovered(false);
  }

  const visibleRows = view === 'activity' ? [...rows].reverse() : rows;

  return (
    <div className={`erp-office ${compact ? 'erp-office-compact' : ''} ${hovered ? 'is-interacting' : ''}`} onPointerMove={handlePointerMove} onPointerEnter={() => setHovered(true)} onPointerLeave={resetTilt} style={{ '--office-rx': '0deg', '--office-ry': '0deg' } as CSSProperties} aria-label={`${moduleTitle} shown on an interactive ERP workstation in a modern office`}>
      <div className="erp-office-ambient erp-office-ambient-a" aria-hidden="true" />
      <div className="erp-office-ambient erp-office-ambient-b" aria-hidden="true" />
      <div className="erp-office-window" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="erp-office-shelf" aria-hidden="true"><i /><i /><i /></div>
      <div className="erp-office-plant" aria-hidden="true"><span /><span /><span /><b /></div>

      <div className="erp-workstation">
        <div className="erp-monitor">
          <div className="erp-monitor-camera" aria-hidden="true" />
          <div className="erp-screen">
            <header className="erp-screen-topbar">
              <div className="erp-screen-brand"><span className="erp-screen-logo">H</span><span><small>HisabERP</small><strong>{moduleTitle}</strong></span></div>
              <div className="erp-screen-status"><span /> Live</div>
            </header>

            <div className="erp-screen-layout">
              <aside className="erp-screen-sidebar" aria-label="ERP screen navigation"><span className="active" /><span /><span /><span /><span /></aside>
              <div className="erp-screen-content">
                <div className="erp-screen-heading"><div><small>{moduleEyebrow}</small><strong>{moduleTitle}</strong></div><span>Today</span></div>
                <div className="erp-screen-tabs" role="tablist" aria-label={`${moduleTitle} preview views`}>
                  {views.map((item) => <button type="button" role="tab" aria-selected={view === item.id} className={view === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}>{item.label}</button>)}
                </div>

                {view === 'insights' ? (
                  <div className="erp-insights-view">
                    <div className="erp-insight-copy"><small>AI-ready business signal</small><strong>{metrics[0]?.label || 'Performance'} is the strongest live indicator.</strong><p>{metrics[0]?.note || 'Operational records are synchronized across the current workspace.'}</p></div>
                    <div className="erp-insight-score"><span>Business health</span><strong>92</strong><small>/100</small></div>
                  </div>
                ) : (
                  <>
                    <div className="erp-screen-metrics">
                      {metrics.slice(0, 3).map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.note || 'Live'}</span></article>)}
                    </div>
                    <div className="erp-screen-lower">
                      <section className="erp-screen-chart" aria-label="ERP performance chart">
                        <header><strong>{view === 'activity' ? 'Operational flow' : 'Performance trend'}</strong><span>Live</span></header>
                        <div className="erp-chart-bars" aria-hidden="true">{bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
                        <div className="erp-chart-axis" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
                      </section>
                      <section className="erp-screen-table">
                        <header><strong>{view === 'activity' ? 'Latest activity' : 'Current records'}</strong><span>Updated now</span></header>
                        {visibleRows.slice(0, 3).map((row) => <p key={`${row.label}-${row.value}`}><span><strong>{row.label}</strong><small>{row.meta || 'Current'}</small></span><b>{row.value}</b></p>)}
                      </section>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="erp-monitor-neck" aria-hidden="true" />
        <div className="erp-monitor-base" aria-hidden="true" />
        <div className="erp-office-desk" aria-hidden="true"><div className="erp-keyboard" /><div className="erp-mouse" /><div className="erp-desk-cup" /></div>
      </div>
      <div className="erp-office-hint" aria-hidden="true"><span className="erp-office-hint-dot" /> Move your pointer · click the ERP tabs</div>
    </div>
  );
}
