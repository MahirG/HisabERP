const kpis = [
  { label: "Gross sales", value: "ETB 1.82M", change: "+24.6%", tone: "positive" },
  { label: "Cash & bank", value: "ETB 2.84M", change: "+12.8%", tone: "positive" },
  { label: "Receivables", value: "ETB 486K", change: "8 overdue", tone: "warning" },
  { label: "Net income", value: "ETB 712K", change: "31.8% margin", tone: "positive" },
];

const chartBars = [42, 55, 48, 67, 61, 78, 72, 88, 81, 94, 87, 100];

const transactions = [
  { reference: "INV-1098", customer: "Abay Trading", status: "Paid", amount: "ETB 48,500" },
  { reference: "INV-1097", customer: "Biftu Retail", status: "Pending", amount: "ETB 31,240" },
  { reference: "PAY-0872", customer: "Nile Supplies", status: "Posted", amount: "ETB 16,800" },
];

const navigation = ["Overview", "Sales", "Inventory", "Finance", "Customers", "Reports"];

export function HomeImacDashboardShowcase() {
  return (
    <section className="home-imac-showcase" aria-labelledby="home-imac-title">
      <div className="home-imac-heading">
        <span>One live operating picture</span>
        <h2 id="home-imac-title">Your complete ERP dashboard, presented with clarity.</h2>
        <p>See revenue, cash, receivables, stock risk and recent activity together in a workspace designed for confident daily decisions.</p>
      </div>

      <div className="home-imac-stage">
        <div className="home-imac-ambient" aria-hidden="true" />
        <div className="home-imac-computer">
          <div className="home-imac-frame">
            <span className="home-imac-camera" aria-hidden="true" />
            <div className="home-imac-display">
              <div className="home-imac-dashboard" aria-label="Biloo ERP executive dashboard preview">
                <aside className="home-imac-sidebar">
                  <div className="home-imac-brand"><strong>Biloo</strong><small>ERP</small></div>
                  <nav aria-label="Dashboard preview navigation">
                    {navigation.map((item, index) => (
                      <span className={index === 0 ? "active" : undefined} key={item}>
                        <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>{item}
                      </span>
                    ))}
                  </nav>
                  <div className="home-imac-company"><b>BA</b><span><strong>Bilo Addis</strong><small>Main workspace</small></span></div>
                </aside>

                <main className="home-imac-workspace">
                  <header className="home-imac-topbar">
                    <div><span>Executive dashboard</span><small>Thursday, 30 July 2026</small></div>
                    <div className="home-imac-top-actions"><span className="synced"><i />Live data</span><b>MA</b></div>
                  </header>

                  <div className="home-imac-title-row">
                    <div><small>Good afternoon, Mahir</small><h3>Business overview</h3><p>Here is what requires attention across the organization today.</p></div>
                    <button type="button" tabIndex={-1}>Create invoice <span aria-hidden="true">＋</span></button>
                  </div>

                  <div className="home-imac-kpis">
                    {kpis.map((kpi) => (
                      <article key={kpi.label}>
                        <span>{kpi.label}</span>
                        <strong>{kpi.value}</strong>
                        <small className={kpi.tone}>{kpi.change}</small>
                      </article>
                    ))}
                  </div>

                  <div className="home-imac-dashboard-grid">
                    <section className="home-imac-chart-card">
                      <header><div><strong>Revenue performance</strong><small>Monthly sales · ETB</small></div><span>Last 12 months</span></header>
                      <div className="home-imac-chart">
                        <div className="home-imac-chart-grid" aria-hidden="true"><i /><i /><i /><i /></div>
                        <div className="home-imac-bars" aria-label="Revenue increased across the last twelve months">
                          {chartBars.map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%` }} />)}
                        </div>
                      </div>
                      <footer><span>Aug</span><span>Oct</span><span>Dec</span><span>Feb</span><span>Apr</span><span>Jul</span></footer>
                    </section>

                    <aside className="home-imac-attention-card">
                      <header><strong>Needs attention</strong><span>4 items</span></header>
                      <div><i className="warning" /><span><strong>8 overdue invoices</strong><small>ETB 146,200 outstanding</small></span><b>›</b></div>
                      <div><i className="danger" /><span><strong>9 low-stock items</strong><small>3 products are critical</small></span><b>›</b></div>
                      <div><i className="info" /><span><strong>6 bills due</strong><small>Due within seven days</small></span><b>›</b></div>
                    </aside>
                  </div>

                  <section className="home-imac-transactions">
                    <header><div><strong>Recent transactions</strong><small>Latest verified activity</small></div><span>View all</span></header>
                    <div className="home-imac-table-head"><span>Reference</span><span>Customer / supplier</span><span>Status</span><span>Amount</span></div>
                    {transactions.map((transaction) => (
                      <div className="home-imac-table-row" key={transaction.reference}>
                        <strong>{transaction.reference}</strong><span>{transaction.customer}</span><i className={transaction.status.toLowerCase()}>{transaction.status}</i><b>{transaction.amount}</b>
                      </div>
                    ))}
                  </section>
                </main>
              </div>
            </div>
            <div className="home-imac-chin"><span>Biloo ERP</span></div>
          </div>
          <div className="home-imac-stand" aria-hidden="true"><span className="home-imac-neck" /><span className="home-imac-base" /></div>
        </div>
        <div className="home-imac-shadow" aria-hidden="true" />
      </div>

      <div className="home-imac-value-strip">
        <article><span>01</span><div><strong>Real-time visibility</strong><small>Every operational area contributes to the same reliable picture.</small></div></article>
        <article><span>02</span><div><strong>Action-focused</strong><small>Attention items appear beside the metrics that explain them.</small></div></article>
        <article><span>03</span><div><strong>Built for ETB</strong><small>Financial performance is presented naturally for Ethiopian teams.</small></div></article>
      </div>
    </section>
  );
}
