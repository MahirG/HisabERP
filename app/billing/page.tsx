import Link from "next/link";
import { openStripeBillingPortal } from "../../lib/actions/billing";
import { billingPlans, formatEtb } from "../../lib/billing/catalog";
import { getCurrentBillingSnapshot, subscriptionGrantsAccess } from "../../lib/data/billing";

export const metadata = { title: "Billing and subscription" };
export const dynamic = "force-dynamic";

function statusLabel(status: string | null | undefined) {
  if (!status) return "No subscription";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [snapshot, params] = await Promise.all([getCurrentBillingSnapshot(), searchParams]);
  const subscription = snapshot.subscription;
  const plan = billingPlans.find((item) => item.code === subscription?.planCode) || null;
  const active = subscriptionGrantsAccess(subscription?.status);

  return (
    <main className="commerce-page billing-page">
      <header className="commerce-topbar">
        <Link href="/" className="commerce-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42"/><span><strong>HisabTech</strong><small>Billing center</small></span></Link>
        <Link href="/">Return to workspace</Link>
      </header>

      <section className="billing-hero">
        <div><span className="commerce-kicker">Subscription control center</span><h1>Clear billing, verified access, no hidden activation state.</h1><p>Review the current HisabERP plan, renewal period and payment condition. Stripe securely manages payment methods, invoices and cancellation settings.</p></div>
        <span className={`billing-status ${active ? "active" : "inactive"}`}><i aria-hidden="true"/>{statusLabel(subscription?.status)}</span>
      </section>

      {params.error ? <div className="commerce-alert error billing-alert" role="alert">{params.error}</div> : null}
      {!snapshot.configured ? <div className="commerce-alert warning billing-alert" role="status">Stripe is not configured in this environment. The billing ledger remains protected, but provider actions are unavailable.</div> : null}

      <section className="billing-grid">
        <article className="billing-plan-card">
          <span>Current plan</span>
          <h2>{plan?.name || "No paid plan"}</h2>
          <p>{plan?.description || "Choose a HisabERP plan to activate verified subscription access."}</p>
          {subscription ? <div className="billing-price"><strong>ETB {formatEtb(subscription.amountEtb)}</strong><small>{subscription.billingCycle === "annual" ? "per year" : "per month"}</small></div> : null}
          <div className="billing-card-actions">
            {subscription?.stripeCustomerId ? <form action={openStripeBillingPortal}><button className="commerce-primary" type="submit" disabled={!snapshot.configured}>Open Stripe billing portal <b aria-hidden="true">→</b></button></form> : <Link href="/pricing" className="commerce-primary">Choose a plan <b aria-hidden="true">→</b></Link>}
            <Link href="/pricing" className="commerce-secondary">Compare plans</Link>
          </div>
        </article>

        <article className="billing-detail-card">
          <header><span>Subscription details</span><strong>Webhook verified</strong></header>
          <dl>
            <div><dt>Status</dt><dd>{statusLabel(subscription?.status)}</dd></div>
            <div><dt>Billing period</dt><dd>{subscription ? (subscription.billingCycle === "annual" ? "Annual" : "Monthly") : "—"}</dd></div>
            <div><dt>Current period ends</dt><dd>{subscription?.currentPeriodEnd ? new Intl.DateTimeFormat("en-ET", { dateStyle: "long" }).format(new Date(subscription.currentPeriodEnd)) : "—"}</dd></div>
            <div><dt>Renewal setting</dt><dd>{subscription?.cancelAtPeriodEnd ? "Ends after current period" : subscription ? "Renews automatically" : "—"}</dd></div>
            <div><dt>Latest invoice</dt><dd>{subscription?.lastInvoiceStatus ? statusLabel(subscription.lastInvoiceStatus) : "—"}</dd></div>
            <div><dt>Currency</dt><dd>{subscription?.currency || "ETB"}</dd></div>
          </dl>
        </article>

        <article className="billing-security-card">
          <span>How access is protected</span>
          <h2>Payment state cannot be changed from the browser.</h2>
          <p>HisabTech records billing changes only after validating Stripe’s signed webhook. Your account may read its own status but cannot activate, edit or delete subscription records directly.</p>
          <div><span><b>01</b> Signed event verification</span><span><b>02</b> Idempotent processing</span><span><b>03</b> User-isolated RLS</span></div>
          <Link href="/trust">Review the Trust Center →</Link>
        </article>
      </section>
    </main>
  );
}
