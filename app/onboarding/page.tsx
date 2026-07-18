import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { LanguageSelector } from "../../components/language-provider";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { bootstrapGuidedOrganization, createOnboardingBranchAction, importCustomersAction, importProductsAction, importSuppliersAction, postOpeningBalanceAction, updateCompanyProfileAction } from "../../lib/actions/onboarding";
import { getCurrentUserContext } from "../../lib/data/context";
import { getOnboardingSnapshot } from "../../lib/data/setup";
import type { SetupStepKey } from "../../lib/data/setup-types";

export const metadata = { title: "Company Setup" };
export const dynamic = "force-dynamic";

const stepCopy: Record<SetupStepKey, { number: string; title: string; description: string }> = {
  company: { number: "01", title: "Company profile", description: "Legal identity, business model and regional settings." },
  branches: { number: "02", title: "Branches & warehouses", description: "Operating locations for transactions and inventory." },
  contacts: { number: "03", title: "Customers & suppliers", description: "Bring in opening contact master data." },
  products: { number: "04", title: "Products & opening stock", description: "Catalog, pricing, cost and initial quantities." },
  taxes: { number: "05", title: "Taxes & accounts", description: "Review the provisioned ledger and tax controls." },
  opening: { number: "06", title: "Opening balances", description: "Post the first balanced accounting journal." },
  invoice: { number: "07", title: "First invoice", description: "Validate the full quote-to-cash workflow." },
  security: { number: "08", title: "Administrator security", description: "Protect privileged users with authenticator MFA." },
};

const orderedSteps = Object.keys(stepCopy) as SetupStepKey[];

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function SetupTask({ stepKey, complete, current, children }: { stepKey: SetupStepKey; complete: boolean; current: boolean; children: ReactNode }) {
  const copy = stepCopy[stepKey];
  return (
    <details id={`setup-${stepKey}`} className={`launch-task ${complete ? "complete" : ""} ${current ? "current" : ""}`} open={current}>
      <summary>
        <span className="launch-task-index">{complete ? "✓" : copy.number}</span>
        <span className="launch-task-copy"><strong>{copy.title}</strong><small>{copy.description}</small></span>
        <span className={`launch-task-status ${complete ? "complete" : current ? "current" : "pending"}`}>{complete ? "Complete" : current ? "Next step" : "Pending"}</span>
        <span className="launch-task-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="launch-task-body">{children}</div>
    </details>
  );
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [context, query] = await Promise.all([getCurrentUserContext(), searchParams]);

  if (!context) {
    return (
      <main className="guided-setup-page launch-center launch-create-company">
        <header className="launch-topbar">
          <Link href="/" className="launch-brand"><span>H</span><strong>HisabTech</strong></Link>
          <LanguageSelector />
        </header>
        <section className="launch-create-shell">
          <aside className="launch-create-intro">
            <span className="launch-kicker">ERP FOUNDATION</span>
            <h1>Start with clean books and an operating structure that can scale.</h1>
            <p>HisabTech provisions the branch, warehouse, chart of accounts, VAT codes, accounting periods and owner controls before your first transaction.</p>
            <div className="launch-create-benefits">
              <span><b>01</b> Finance-ready structure</span>
              <span><b>02</b> Localized company controls</span>
              <span><b>03</b> Secure administrator access</span>
            </div>
          </aside>
          <section className="launch-create-card">
            <div className="launch-create-heading"><span>Step 1 of 8</span><h2>Create your workspace</h2><p>Use the legal company details that should appear on reports and invoices.</p></div>
            {query.error ? <p className="setup-flash error">{query.error}</p> : null}
            <form action={bootstrapGuidedOrganization} className="setup-form launch-form two-column">
              <label>Owner full name<input name="fullName" autoComplete="name" required maxLength={120} /></label>
              <label>Company name<input name="organizationName" autoComplete="organization" required maxLength={160} /></label>
              <label>Business type<select name="businessType" defaultValue="Retail & distribution"><option>Retail & distribution</option><option>Wholesale</option><option>Manufacturing</option><option>Professional services</option><option>Construction</option><option>Hospitality</option><option>Nonprofit</option><option>Other</option></select></label>
              <label>Primary branch<input name="branchName" defaultValue="Main Branch" required maxLength={160} /></label>
              <label>Country<select name="countryCode" defaultValue="ET"><option value="ET">Ethiopia</option><option value="KE">Kenya</option><option value="AE">United Arab Emirates</option><option value="US">United States</option><option value="GB">United Kingdom</option></select></label>
              <label>Base currency<select name="currency" defaultValue="ETB"><option value="ETB">ETB — Ethiopian Birr</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="AED">AED — UAE Dirham</option><option value="KES">KES — Kenyan Shilling</option></select></label>
              <label>Timezone<select name="timezone" defaultValue="Africa/Addis_Ababa"><option>Africa/Addis_Ababa</option><option>Africa/Nairobi</option><option>Asia/Dubai</option><option>Europe/London</option><option>America/New_York</option></select></label>
              <label>TIN <span>Optional</span><input name="tin" maxLength={30} /></label>
              <label className="full">Business phone <span>Optional</span><input name="phone" autoComplete="tel" maxLength={40} /></label>
              <button type="submit" className="primary full">Create company workspace</button>
            </form>
          </section>
        </section>
      </main>
    );
  }

  const snapshot = await getOnboardingSnapshot();
  if (!snapshot) return null;
  const strongAdmin = context.mfaRequired && context.aal === "aal2";
  const completeMap = new Map(snapshot.progress.steps.map((step) => [step.key, step.complete]));
  const nextStep = orderedSteps.find((key) => !completeMap.get(key)) ?? "security";
  const remaining = snapshot.progress.total - snapshot.progress.completed;
  const progressStyle = { "--launch-progress": `${snapshot.progress.percent}%` } as CSSProperties;

  return (
    <main className="guided-setup-page launch-center">
      <header className="launch-topbar">
        <Link href="/" className="launch-brand"><span>H</span><strong>HisabTech</strong></Link>
        <div className="launch-top-actions"><LanguageSelector /><Link href="/" className="launch-dashboard-link">Open dashboard <span>↗</span></Link></div>
      </header>

      <section className="launch-overview">
        <div className="launch-overview-copy">
          <span className="launch-kicker">COMPANY LAUNCH CENTER</span>
          <div className="launch-title-row"><h1>{snapshot.organization.name}</h1><span className={remaining === 0 ? "ready" : "in-progress"}>{remaining === 0 ? "Launch ready" : "Setup in progress"}</span></div>
          <p>Configure the essentials once, then move into daily operations with a clean ERP foundation.</p>
        </div>
        <div className="launch-overview-progress" style={progressStyle}>
          <div><strong>{formatPercent(snapshot.progress.percent)}</strong><span>{snapshot.progress.completed}/{snapshot.progress.total} complete</span></div>
          <div className="launch-progress-track" aria-label={`${formatPercent(snapshot.progress.percent)} complete`}><span /></div>
        </div>
      </section>

      {query.success ? <p className="setup-flash success">{query.success}</p> : null}
      {query.error ? <p className="setup-flash error">{query.error}</p> : null}

      <section className="launch-layout">
        <aside className="launch-rail">
          <div className="launch-rail-card">
            <span className="launch-rail-label">Launch roadmap</span>
            <nav aria-label="Company setup progress">
              {orderedSteps.map((key) => {
                const complete = Boolean(completeMap.get(key));
                const current = key === nextStep;
                return (
                  <a href={`#setup-${key}`} className={`${complete ? "complete" : ""} ${current ? "current" : ""}`} key={key}>
                    <span>{complete ? "✓" : stepCopy[key].number}</span>
                    <div><strong>{stepCopy[key].title}</strong><small>{complete ? "Completed" : current ? "Recommended next" : "Not started"}</small></div>
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="launch-rail-note">
            <span>Recommended next</span>
            <strong>{stepCopy[nextStep].title}</strong>
            <p>{stepCopy[nextStep].description}</p>
            <a href={`#setup-${nextStep}`}>Continue setup →</a>
          </div>
        </aside>

        <section className="launch-main" aria-label="Company setup tasks">
          {!strongAdmin ? <div className="launch-security-gate"><MfaSecurityPanel organizationId={context.organizationId} required={context.mfaRequired} initialAal={context.aal} /></div> : null}

          <div className="launch-main-heading">
            <div><span>Setup tasks</span><h2>Complete only what your company needs now.</h2></div>
            <p>Completed sections stay compact. Open any section to review or edit it.</p>
          </div>

          <div className="launch-task-list">
            <SetupTask stepKey="company" complete={Boolean(completeMap.get("company"))} current={nextStep === "company"}>
              <form action={updateCompanyProfileAction} className="setup-form launch-form two-column">
                <label>Company name<input name="organizationName" defaultValue={snapshot.organization.name} required /></label>
                <label>Business type<input name="businessType" defaultValue={snapshot.organization.industry || ""} required /></label>
                <label>Country code<input name="countryCode" defaultValue={snapshot.organization.country_code} required maxLength={2} /></label>
                <label>Currency<input name="currency" defaultValue={snapshot.organization.base_currency} required maxLength={3} /></label>
                <label>Timezone<input name="timezone" defaultValue={snapshot.organization.timezone} required /></label>
                <label>TIN<input name="tin" defaultValue={snapshot.organization.tin || ""} /></label>
                <label>VAT number<input name="vatNumber" defaultValue={snapshot.organization.vat_number || ""} /></label>
                <label>Phone<input name="phone" defaultValue={snapshot.organization.phone || ""} /></label>
                <button className="primary full" type="submit" disabled={!strongAdmin}>Save company profile</button>
              </form>
            </SetupTask>

            <SetupTask stepKey="branches" complete={Boolean(completeMap.get("branches"))} current={nextStep === "branches"}>
              <div className="launch-inline-stats"><span><strong>{snapshot.branches.length}</strong> active branches</span><span><strong>{snapshot.warehouses.length}</strong> warehouses</span></div>
              {snapshot.branches.length ? <div className="launch-record-list">{snapshot.branches.map((branch) => <span key={branch.id}><strong>{branch.name}</strong><small>{branch.code}</small></span>)}</div> : null}
              <form action={createOnboardingBranchAction} className="setup-form launch-form two-column">
                <label>Branch name<input name="name" required placeholder="Bole Branch" /></label>
                <label>Code<input name="code" required placeholder="BOLE" /></label>
                <label className="full">Address<input name="address" placeholder="City, sub-city and street" /></label>
                <label className="setup-checkbox full"><input type="checkbox" name="createWarehouse" defaultChecked /><span>Create a linked warehouse automatically</span></label>
                <button className="secondary full" type="submit" disabled={!strongAdmin}>Add branch</button>
              </form>
            </SetupTask>

            <SetupTask stepKey="contacts" complete={Boolean(completeMap.get("contacts"))} current={nextStep === "contacts"}>
              <div className="launch-inline-stats"><span><strong>{snapshot.counts.customers}</strong> customers</span><span><strong>{snapshot.counts.suppliers}</strong> suppliers</span></div>
              <div className="launch-import-grid">
                <form action={importCustomersAction} className="launch-import-card"><div><span>CSV import</span><h3>Customers</h3><p>Required column: <code>name</code></p></div><input type="file" name="file" accept=".csv,text/csv" required /><button type="submit" disabled={!strongAdmin}>Import customers</button></form>
                <form action={importSuppliersAction} className="launch-import-card"><div><span>CSV import</span><h3>Suppliers</h3><p>Required column: <code>name</code></p></div><input type="file" name="file" accept=".csv,text/csv" required /><button type="submit" disabled={!strongAdmin}>Import suppliers</button></form>
              </div>
            </SetupTask>

            <SetupTask stepKey="products" complete={Boolean(completeMap.get("products"))} current={nextStep === "products"}>
              <div className="launch-inline-stats"><span><strong>{snapshot.counts.products}</strong> products</span><span><strong>{snapshot.counts.openingStock}</strong> stocked SKUs</span></div>
              <form action={importProductsAction} className="launch-import-card launch-import-wide">
                <div><span>CSV import</span><h3>Products and opening stock</h3><p><code>sku</code> and <code>name</code> are required. Opening quantity is optional.</p></div>
                <label>Opening warehouse<select name="warehouseId" required>{snapshot.warehouses.map((warehouse) => <option value={warehouse.id} key={warehouse.id}>{warehouse.name} · {warehouse.code}</option>)}</select></label>
                <input type="file" name="file" accept=".csv,text/csv" required />
                <button type="submit" disabled={!strongAdmin}>Import products and stock</button>
              </form>
            </SetupTask>

            <SetupTask stepKey="taxes" complete={Boolean(completeMap.get("taxes"))} current={nextStep === "taxes"}>
              <div className="launch-review-card"><div className="launch-review-icon">✓</div><div><span>Provisioned automatically</span><h3>{snapshot.accounts.length} ledger accounts · {snapshot.counts.taxCodes} tax codes</h3><p>Review account naming, manual-posting permissions, VAT rates and statutory treatment before filing.</p></div><Link href="/finance?tab=accounts" className="launch-secondary-action">Review finance setup</Link></div>
            </SetupTask>

            <SetupTask stepKey="opening" complete={Boolean(completeMap.get("opening"))} current={nextStep === "opening"}>
              <form action={postOpeningBalanceAction} className="setup-form launch-form two-column">
                <label>Branch<select name="branchId" required>{snapshot.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>
                <label>Entry date<input name="entryDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
                <label>Debit account<select name="debitAccountId" required>{snapshot.accounts.map((account) => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select></label>
                <label>Credit account<select name="creditAccountId" required>{snapshot.accounts.map((account) => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select></label>
                <label>Amount<input type="number" min="0.01" step="0.01" name="amount" required /></label>
                <label>Notes<input name="notes" placeholder="Opening cash, capital, inventory, payable…" /></label>
                <button type="submit" className="primary full" disabled={!strongAdmin}>Post opening journal</button>
              </form>
            </SetupTask>

            <SetupTask stepKey="invoice" complete={Boolean(completeMap.get("invoice"))} current={nextStep === "invoice"}>
              <div className="launch-review-card"><div className="launch-review-icon invoice">↗</div><div><span>Workflow validation</span><h3>{snapshot.counts.invoices ? `${snapshot.counts.invoices} invoice${snapshot.counts.invoices === 1 ? "" : "s"} posted` : "Create the first live invoice"}</h3><p>The invoice workflow posts receivable, revenue, VAT, inventory and cost of goods sold atomically.</p></div><Link href="/sales/invoices/new" className="launch-primary-action">Create invoice</Link></div>
            </SetupTask>

            <SetupTask stepKey="security" complete={Boolean(completeMap.get("security"))} current={nextStep === "security"}>
              <div className="launch-review-card"><div className="launch-review-icon security">◉</div><div><span>Privileged access</span><h3>{completeMap.get("security") ? "Administrator protection is active" : "Authenticator enrollment is required"}</h3><p>MFA-gated permissions protect finance, inventory, payroll, user management and production controls.</p></div><Link href="/account" className="launch-primary-action">Open account security</Link></div>
            </SetupTask>
          </div>

          <footer className="launch-finish">
            <div><span>{snapshot.progress.completed === 8 ? "Launch complete" : `${remaining} task${remaining === 1 ? "" : "s"} remaining`}</span><strong>{snapshot.progress.completed === 8 ? "Your operating foundation is ready." : "Finish the critical controls, then move into daily operations."}</strong></div>
            <Link href="/security">Review production controls <span>→</span></Link>
          </footer>
        </section>
      </section>
    </main>
  );
}
