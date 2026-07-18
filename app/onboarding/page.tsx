import Link from "next/link";
import { LanguageSelector } from "../../components/language-provider";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { bootstrapGuidedOrganization, createOnboardingBranchAction, importCustomersAction, importProductsAction, importSuppliersAction, postOpeningBalanceAction, updateCompanyProfileAction } from "../../lib/actions/onboarding";
import { getCurrentUserContext } from "../../lib/data/context";
import { getOnboardingSnapshot } from "../../lib/data/setup";
import type { SetupStepKey } from "../../lib/data/setup-types";

export const metadata = { title: "Company Setup" };
export const dynamic = "force-dynamic";

const stepCopy: Record<SetupStepKey, { number: string; title: string; description: string }> = {
  company: { number: "01", title: "Company profile", description: "Business type, country, currency, tax identity and timezone." },
  branches: { number: "02", title: "Branches & warehouses", description: "Create the operating locations that own transactions and stock." },
  contacts: { number: "03", title: "Customers & suppliers", description: "Import opening master data from structured CSV files." },
  products: { number: "04", title: "Products & opening stock", description: "Import catalog, pricing, cost and warehouse quantities." },
  taxes: { number: "05", title: "Taxes & accounts", description: "Review the automatically provisioned ledger and VAT controls." },
  opening: { number: "06", title: "Opening balances", description: "Post a balanced, immutable opening journal." },
  invoice: { number: "07", title: "First invoice", description: "Create the first real customer invoice and validate the workflow." },
  security: { number: "08", title: "Secure administrators", description: "Enroll every owner and administrator in authenticator MFA." },
};

function formatPercent(value: number) { return `${Math.round(value)}%`; }

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [context, query] = await Promise.all([getCurrentUserContext(), searchParams]);

  if (!context) {
    return (
      <main className="guided-setup-page new-company">
        <header className="guided-setup-top"><Link href="/" className="setup-brand"><span>H</span><strong>HisabTech</strong></Link><LanguageSelector /></header>
        <section className="new-company-shell">
          <aside><p className="eyebrow">GUIDED COMPANY LAUNCH</p><h1>Build a finance-ready workspace, not an empty dashboard.</h1><p>HisabTech creates your branch, warehouse, chart of accounts, VAT codes, accounting periods and owner role before guiding you to the first invoice.</p><ol><li>Company and business model</li><li>Operating locations</li><li>Opening master data</li><li>Finance configuration</li><li>Administrator security</li></ol></aside>
          <section className="new-company-card">
            <div><p className="eyebrow">STEP 1 OF 8</p><h2>Create your company</h2><p>Use the legal operating details you expect to see on invoices and reports.</p></div>
            {query.error ? <p className="setup-flash error">{query.error}</p> : null}
            <form action={bootstrapGuidedOrganization} className="setup-form two-column">
              <label>Owner full name<input name="fullName" autoComplete="name" required maxLength={120} /></label>
              <label>Company name<input name="organizationName" autoComplete="organization" required maxLength={160} /></label>
              <label>Business type<select name="businessType" defaultValue="Retail & distribution"><option>Retail & distribution</option><option>Wholesale</option><option>Manufacturing</option><option>Professional services</option><option>Construction</option><option>Hospitality</option><option>Nonprofit</option><option>Other</option></select></label>
              <label>Primary branch<input name="branchName" defaultValue="Main Branch" required maxLength={160} /></label>
              <label>Country<select name="countryCode" defaultValue="ET"><option value="ET">Ethiopia</option><option value="KE">Kenya</option><option value="AE">United Arab Emirates</option><option value="US">United States</option><option value="GB">United Kingdom</option></select></label>
              <label>Base currency<select name="currency" defaultValue="ETB"><option value="ETB">ETB — Ethiopian Birr</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="AED">AED — UAE Dirham</option><option value="KES">KES — Kenyan Shilling</option></select></label>
              <label>Timezone<select name="timezone" defaultValue="Africa/Addis_Ababa"><option>Africa/Addis_Ababa</option><option>Africa/Nairobi</option><option>Asia/Dubai</option><option>Europe/London</option><option>America/New_York</option></select></label>
              <label>TIN (optional)<input name="tin" maxLength={30} /></label>
              <label className="full">Business phone (optional)<input name="phone" autoComplete="tel" maxLength={40} /></label>
              <button type="submit" className="primary full">Create secure company workspace</button>
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

  return (
    <main className="guided-setup-page">
      <header className="guided-setup-top"><Link href="/" className="setup-brand"><span>H</span><strong>HisabTech</strong></Link><div className="setup-top-actions"><LanguageSelector /><Link href="/" className="secondary action-link">Open dashboard</Link></div></header>
      <section className="setup-hero">
        <div><p className="eyebrow">COMPANY LAUNCH CENTER</p><h1>{snapshot.organization.name}</h1><p>Complete the controls below using real company data. Progress updates automatically from the ERP records already posted.</p></div>
        <div className="setup-progress-ring" style={{ "--progress": `${snapshot.progress.percent}%` } as React.CSSProperties}><strong>{formatPercent(snapshot.progress.percent)}</strong><span>{snapshot.progress.completed} of {snapshot.progress.total}</span></div>
      </section>
      <div className="setup-progress-bar"><span style={{ width: `${snapshot.progress.percent}%` }} /></div>
      {query.success ? <p className="setup-flash success">{query.success}</p> : null}
      {query.error ? <p className="setup-flash error">{query.error}</p> : null}

      {!strongAdmin ? <MfaSecurityPanel organizationId={context.organizationId} required={context.mfaRequired} initialAal={context.aal} /> : null}

      <nav className="setup-step-nav" aria-label="Company setup progress">
        {(Object.keys(stepCopy) as SetupStepKey[]).map((key) => <a href={`#setup-${key}`} className={completeMap.get(key) ? "complete" : ""} key={key}><span>{completeMap.get(key) ? "✓" : stepCopy[key].number}</span><strong>{stepCopy[key].title}</strong></a>)}
      </nav>

      <section className="setup-workflow">
        <article id="setup-company" className={`setup-step-card ${completeMap.get("company") ? "complete" : ""}`}>
          <header><span>{completeMap.get("company") ? "✓" : "01"}</span><div><h2>{stepCopy.company.title}</h2><p>{stepCopy.company.description}</p></div></header>
          <form action={updateCompanyProfileAction} className="setup-form two-column">
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
        </article>

        <article id="setup-branches" className={`setup-step-card ${completeMap.get("branches") ? "complete" : ""}`}>
          <header><span>{completeMap.get("branches") ? "✓" : "02"}</span><div><h2>{stepCopy.branches.title}</h2><p>{stepCopy.branches.description}</p></div></header>
          <div className="setup-record-chips">{snapshot.branches.map((branch) => <span key={branch.id}><strong>{branch.name}</strong><small>{branch.code}</small></span>)}</div>
          <form action={createOnboardingBranchAction} className="setup-form two-column">
            <label>Branch name<input name="name" required placeholder="Bole Branch" /></label><label>Code<input name="code" required placeholder="BOLE" /></label>
            <label className="full">Address<input name="address" placeholder="City, sub-city and street" /></label>
            <label className="setup-checkbox full"><input type="checkbox" name="createWarehouse" defaultChecked /><span>Create a linked warehouse automatically</span></label>
            <button className="secondary full" type="submit" disabled={!strongAdmin}>Add branch</button>
          </form>
        </article>

        <article id="setup-contacts" className={`setup-step-card ${completeMap.get("contacts") ? "complete" : ""}`}>
          <header><span>{completeMap.get("contacts") ? "✓" : "03"}</span><div><h2>{stepCopy.contacts.title}</h2><p>{stepCopy.contacts.description}</p></div></header>
          <div className="setup-count-row"><span><strong>{snapshot.counts.customers}</strong> customers</span><span><strong>{snapshot.counts.suppliers}</strong> suppliers</span></div>
          <div className="setup-import-grid">
            <form action={importCustomersAction} className="setup-import-card"><h3>Customer CSV</h3><code>name,email,phone,tin,credit_limit,payment_terms_days</code><input type="file" name="file" accept=".csv,text/csv" required /><button type="submit" disabled={!strongAdmin}>Import customers</button></form>
            <form action={importSuppliersAction} className="setup-import-card"><h3>Supplier CSV</h3><code>name,email,phone,tin,credit_limit,payment_terms_days</code><input type="file" name="file" accept=".csv,text/csv" required /><button type="submit" disabled={!strongAdmin}>Import suppliers</button></form>
          </div>
        </article>

        <article id="setup-products" className={`setup-step-card ${completeMap.get("products") ? "complete" : ""}`}>
          <header><span>{completeMap.get("products") ? "✓" : "04"}</span><div><h2>{stepCopy.products.title}</h2><p>{stepCopy.products.description}</p></div></header>
          <div className="setup-count-row"><span><strong>{snapshot.counts.products}</strong> products</span><span><strong>{snapshot.counts.openingStock}</strong> stocked SKUs</span></div>
          <form action={importProductsAction} className="setup-import-card wide"><h3>Product and opening-stock CSV</h3><code>sku,name,unit,unit_price,cost_price,reorder_level,opening_quantity</code><label>Opening warehouse<select name="warehouseId" required>{snapshot.warehouses.map((warehouse) => <option value={warehouse.id} key={warehouse.id}>{warehouse.name} · {warehouse.code}</option>)}</select></label><input type="file" name="file" accept=".csv,text/csv" required /><button type="submit" disabled={!strongAdmin}>Import products and stock</button></form>
        </article>

        <article id="setup-taxes" className={`setup-step-card ${completeMap.get("taxes") ? "complete" : ""}`}>
          <header><span>{completeMap.get("taxes") ? "✓" : "05"}</span><div><h2>{stepCopy.taxes.title}</h2><p>{stepCopy.taxes.description}</p></div></header>
          <div className="setup-ready-summary"><span>✓</span><div><strong>{snapshot.accounts.length} ledger accounts and {snapshot.counts.taxCodes} active tax codes are provisioned.</strong><p>Review account naming, manual-posting permissions, VAT rates and statutory treatment before using them for filing.</p></div></div>
          <Link href="/finance?tab=accounts" className="secondary action-link">Review accounts and taxes</Link>
        </article>

        <article id="setup-opening" className={`setup-step-card ${completeMap.get("opening") ? "complete" : ""}`}>
          <header><span>{completeMap.get("opening") ? "✓" : "06"}</span><div><h2>{stepCopy.opening.title}</h2><p>{stepCopy.opening.description}</p></div></header>
          <form action={postOpeningBalanceAction} className="setup-form two-column">
            <label>Branch<select name="branchId" required>{snapshot.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>
            <label>Entry date<input name="entryDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
            <label>Debit account<select name="debitAccountId" required>{snapshot.accounts.map((account) => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select></label>
            <label>Credit account<select name="creditAccountId" required>{snapshot.accounts.map((account) => <option value={account.id} key={account.id}>{account.code} · {account.name}</option>)}</select></label>
            <label>Amount<input type="number" min="0.01" step="0.01" name="amount" required /></label><label>Notes<input name="notes" placeholder="Opening cash, capital, inventory, payable…" /></label>
            <button type="submit" className="primary full" disabled={!strongAdmin}>Post balanced opening journal</button>
          </form>
        </article>

        <article id="setup-invoice" className={`setup-step-card ${completeMap.get("invoice") ? "complete" : ""}`}>
          <header><span>{completeMap.get("invoice") ? "✓" : "07"}</span><div><h2>{stepCopy.invoice.title}</h2><p>{stepCopy.invoice.description}</p></div></header>
          <div className="setup-action-callout"><div><strong>{snapshot.counts.invoices ? `${snapshot.counts.invoices} invoice${snapshot.counts.invoices === 1 ? "" : "s"} posted` : "Ready for a live workflow check"}</strong><p>The invoice flow posts receivable, revenue, VAT, inventory and cost-of-goods-sold entries atomically.</p></div><Link href="/sales/invoices/new" className="primary action-link">Create first invoice</Link></div>
        </article>

        <article id="setup-security" className={`setup-step-card ${completeMap.get("security") ? "complete" : ""}`}>
          <header><span>{completeMap.get("security") ? "✓" : "08"}</span><div><h2>{stepCopy.security.title}</h2><p>{stepCopy.security.description}</p></div></header>
          <div className="setup-action-callout"><div><strong>{completeMap.get("security") ? "All privileged accounts have a verified factor" : "Authenticator enrollment is required"}</strong><p>MFA-gated permissions protect finance, inventory, payroll, user management and production-control changes.</p></div><Link href="/account" className="primary action-link">Open account security</Link></div>
        </article>
      </section>

      <footer className="setup-finish"><strong>{snapshot.progress.completed === 8 ? "Your operational launch checklist is complete." : `${8 - snapshot.progress.completed} control${8 - snapshot.progress.completed === 1 ? "" : "s"} remain before launch readiness.`}</strong><Link href="/security">Review production controls →</Link></footer>
    </main>
  );
}
