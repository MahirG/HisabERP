const kpis = [
  { label: "Gross sales", value: "ETB 1.82M", change: "+24.6%", tone: "positive" },
  { label: "Cash & bank", value: "ETB 2.84M", change: "+12.8%", tone: "positive" },
  { label: "Receivables", value: "ETB 486K", change: "8 overdue", tone: "warning" },
  { label: "Inventory value", value: "ETB 3.26M", change: "9 low stock", tone: "warning" },
];

const navigation = ["Dashboard", "Sales", "Inventory", "Finance", "Customers", "Reports"];

const categoryBars = [
  { label: "Retail sales", value: 92 },
  { label: "Wholesale", value: 78 },
  { label: "Services", value: 62 },
  { label: "Hospitality", value: 48 },
];

const transactions = [
  { name: "Abay Trading", type: "Customer receipt", amount: "ETB 48,500", status: "Paid" },
  { name: "Biftu Retail", type: "Sales invoice", amount: "ETB 31,240", status: "Pending" },
  { name: "Nile Supplies", type: "Supplier payment", amount: "ETB 16,800", status: "Posted" },
];

export function HomeImacDashboardShowcase() {
  return (
    <section className="home-zylo-device-showcase" aria-label="Biloo ERP dashboard displayed on a desktop monitor">
      <div className="home-zylo-device-glow" aria-hidden="true" />

      <div className="home-zylo-monitor">
        <div className="home-zylo-monitor-frame">
          <span className="home-zylo-monitor-camera" aria-hidden="true" />

          <div className="home-zylo-monitor-screen">
            <div className="home-zylo-app" aria-label="Biloo ERP executive dashboard preview">
              <header className="home-zylo-appbar">
                <div className="home-zylo-brand"><strong>Biloo</strong><i aria-hidden="true" /></div>
                <nav aria-label="Dashboard preview navigation">
                  {navigation.map((item, index) => (
                    <span className={index === 0 ? "active" : undefined} key={item}>{item}</span>
                  ))}
                </nav>
                <div className="home-zylo-app-actions">
                  <span className="home-zylo-search">Search</span>
                  <b>BA</b>
                </div>
              </header>

              <div className="home-zylo-dashboard">
                <div className="home-zylo-dashboard-title">
                  <div>
                    <small>Executive workspace</small>
                    <h2>Business overview</h2>
                    <p>Financial and operational performance across the organization.</p>
                  </div>
                  <span className="home-zylo-period">This month⌄</span>
                </div>

                <div className="home-zylo-kpis">
                  {kpis.map((kpi) => (
                    <article key={kpi.label}>
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                      <small className={kpi.tone}>{kpi.change}</small>
                    </article>
                  ))}
                </div>

                <div className="home-zylo-grid">
                  <section className="home-zylo-revenue-card">
                    <header>
                      <div><strong>Revenue performance</strong><small>Sales and collections · ETB</small></div>
                      <span>Last 12 months</span>
                    </header>
                    <div className="home-zylo-line-chart" aria-label="Revenue and collections increased over the last twelve months">
                      <span className="home-zylo-axis-label top">2.0M</span>
                      <span className="home-zylo-axis-label middle">1.0M</span>
                      <span className="home-zylo-axis-label bottom">0</span>
                      <svg viewBox="0 0 620 190" preserveAspectRatio="none" role="img" aria-hidden="true">
                        <defs>
                          <linearGradient id="bilooRevenueArea" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#da7757" stopOpacity="0.24" />
                            <stop offset="100%" stopColor="#da7757" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path className="area" d="M0 166 C45 154 72 140 110 144 C151 149 180 113 222 120 C269 128 300 86 344 96 C390 106 418 62 458 72 C506 83 545 34 620 42 L620 190 L0 190 Z" />
                        <path className="primary-line" d="M0 166 C45 154 72 140 110 144 C151 149 180 113 222 120 C269 128 300 86 344 96 C390 106 418 62 458 72 C506 83 545 34 620 42" />
                        <path className="secondary-line" d="M0 174 C55 162 79 166 118 154 C166 139 196 149 238 133 C280 116 322 126 366 107 C410 88 446 100 488 78 C535 54 574 63 620 52" />
                      </svg>
                      <div className="home-zylo-chart-months"><span>Aug</span><span>Oct</span><span>Dec</span><span>Feb</span><span>Apr</span><span>Jul</span></div>
                    </div>
                  </section>

                  <section className="home-zylo-categories-card">
                    <header><div><strong>Revenue by operation</strong><small>Current period</small></div><span>ETB</span></header>
                    <div className="home-zylo-category-bars">
                      {categoryBars.map((item) => (
                        <div key={item.label}>
                          <span>{item.label}</span>
                          <i><b style={{ width: `${item.value}%` }} /></i>
                          <strong>{item.value}%</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="home-zylo-lower-grid">
                  <section className="home-zylo-transactions-card">
                    <header><div><strong>Recent activity</strong><small>Latest verified transactions</small></div><span>View all</span></header>
                    {transactions.map((transaction) => (
                      <div className="home-zylo-transaction" key={`${transaction.name}-${transaction.type}`}>
                        <i aria-hidden="true">{transaction.name.slice(0, 1)}</i>
                        <span><strong>{transaction.name}</strong><small>{transaction.type}</small></span>
                        <b>{transaction.amount}</b>
                        <em className={transaction.status.toLowerCase()}>{transaction.status}</em>
                      </div>
                    ))}
                  </section>

                  <section className="home-zylo-attention-card">
                    <header><strong>Needs attention</strong><span>Today</span></header>
                    <div><i className="warning" /><span><strong>8 overdue invoices</strong><small>ETB 146,200 outstanding</small></span></div>
                    <div><i className="danger" /><span><strong>9 low-stock products</strong><small>3 products are critical</small></span></div>
                    <div><i className="info" /><span><strong>6 supplier bills due</strong><small>Due within seven days</small></span></div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="home-zylo-monitor-stand" aria-hidden="true">
          <span className="home-zylo-monitor-neck" />
          <span className="home-zylo-monitor-base" />
        </div>
      </div>

      <div className="home-zylo-floor-shadow" aria-hidden="true" />
    </section>
  );
}
