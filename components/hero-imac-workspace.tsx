export function HeroImacWorkspace() {
  return (
    <div className="hero-imac-stage" aria-label="HisabERP dashboard displayed on a premium desktop computer">
      <div className="hero-imac-orbits" aria-hidden="true">
        <span className="hero-imac-orbit hero-imac-orbit-one" />
        <span className="hero-imac-orbit hero-imac-orbit-two" />
        <span className="hero-imac-orbit hero-imac-orbit-three" />
        <span className="hero-imac-orbit-node hero-imac-node-one">✦</span>
        <span className="hero-imac-orbit-node hero-imac-node-two">✦</span>
        <span className="hero-imac-orbit-node hero-imac-node-three">✦</span>
      </div>

      <div className="hero-imac-scene">
        <div className="hero-imac-shell">
          <span className="hero-imac-camera" aria-hidden="true" />
          <div className="hero-imac-screen">
            <div className="hero-workspace" aria-label="HisabERP business overview dashboard preview">
              <div className="hero-workspace-bar">
                <div><i /><i /><i /></div>
                <strong>HisabERP Financial Workspace</strong>
                <span>Live overview</span>
              </div>

              <div className="hero-workspace-layout">
                <aside>
                  <img src="/hisab-logo.svg" alt="" width="36" height="36" />
                  {[
                    "Overview",
                    "Sales",
                    "Purchases",
                    "Inventory",
                    "Finance",
                    "Customers",
                    "Reports",
                  ].map((item, index) => (
                    <span className={index === 0 ? "active" : undefined} key={item}>{item}</span>
                  ))}
                </aside>

                <section>
                  <div className="hero-workspace-heading">
                    <div><small>Good afternoon, Mahir</small><h2>Business overview</h2></div>
                    <button type="button">+ New transaction</button>
                  </div>

                  <div className="hero-kpis">
                    <article><small>Today’s revenue</small><strong>ETB 84,600</strong><span>+12.8% this week</span></article>
                    <article><small>Cash available</small><strong>ETB 318,400</strong><span>Current position</span></article>
                    <article><small>Receivables</small><strong>ETB 72,900</strong><span>11 open accounts</span></article>
                    <article><small>Net profit</small><strong>ETB 46,280</strong><span>+8.4% this month</span></article>
                  </div>

                  <div className="hero-workspace-main">
                    <article className="hero-performance-card">
                      <header><strong>Revenue performance</strong><small>Last six months</small></header>
                      <div className="hero-performance-bars">
                        {[42, 55, 49, 68, 76, 94, 82, 100].map((height, index) => (
                          <span style={{ height: `${height}%` }} key={index} />
                        ))}
                      </div>
                    </article>

                    <article className="hero-attention-card">
                      <header><strong>Needs attention</strong><small>Today</small></header>
                      <div>
                        <p><span>Low-stock products</span><b>3 urgent</b></p>
                        <p><span>Invoices due</span><b>4 accounts</b></p>
                        <p><span>Unmatched payments</span><b>2 records</b></p>
                        <p><span>Supplier bills</span><b>5 due</b></p>
                      </div>
                    </article>
                  </div>

                  <article className="hero-transactions-card">
                    <header><strong>Recent transactions</strong><small>Updated now</small></header>
                    <div className="hero-transaction-row hero-transaction-head"><span>Reference</span><span>Customer</span><span>Amount</span><span>Status</span></div>
                    <div className="hero-transaction-row"><span>INV-2048</span><span>Abebe Trading</span><span>ETB 28,500</span><b>Paid</b></div>
                    <div className="hero-transaction-row"><span>INV-2047</span><span>Blue Nile Foods</span><span>ETB 16,900</span><b>Pending</b></div>
                    <div className="hero-transaction-row"><span>EXP-0932</span><span>Office supplies</span><span>ETB 4,250</span><b>Recorded</b></div>
                  </article>
                </section>
              </div>
            </div>
          </div>
          <div className="hero-imac-chin"><span>HisabTech</span></div>
        </div>

        <div className="hero-imac-stand" aria-hidden="true">
          <span className="hero-imac-neck" />
          <span className="hero-imac-base" />
        </div>
        <span className="hero-imac-floor-shadow" aria-hidden="true" />
      </div>

      <div className="hero-imac-float hero-imac-float-revenue" aria-hidden="true">
        <small>Revenue</small>
        <span>July 2026</span>
        <svg viewBox="0 0 180 60" role="presentation">
          <path d="M2 52 L28 43 L49 47 L68 28 L91 34 L111 17 L134 24 L158 11 L178 5" />
        </svg>
        <strong>ETB 1.82M</strong>
        <b>↑ 12.8%</b>
      </div>

      <div className="hero-imac-float hero-imac-float-role" aria-hidden="true">
        <span className="hero-imac-avatar">MA</span>
        <strong>Mahir Aman</strong>
        <small>Owner · Administrator</small>
      </div>

      <div className="hero-imac-float hero-imac-float-approval" aria-hidden="true">
        <header><strong>Payment approval</strong><i /></header>
        <b>ETB 5,000.00</b>
        <span>Supplier invoice · INV-4621</span>
        <button type="button" tabIndex={-1}>Approve</button>
      </div>

      <div className="hero-imac-float hero-imac-float-insight" aria-hidden="true">
        <strong>Top products by sales</strong>
        <span>Live management insight</span>
        <div className="hero-imac-mini-bars">
          {[92, 78, 66, 54, 39].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}
        </div>
      </div>
    </div>
  );
}
