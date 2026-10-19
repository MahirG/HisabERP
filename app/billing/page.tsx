import Link from "next/link";
import { billingPlans, formatEtb } from "../../lib/billing/catalog";
import { billingGrantsAccess, getCurrentBillingSnapshot } from "../../lib/data/billing";
import { safeNextPath } from "../../lib/validation";
import { Icon } from "../../components/ui/icon";

export const metadata = { title: "Billing & paid access" };
export const dynamic = "force-dynamic";

function statusLabel(status: string | null | undefined) {
  if (!status) return "No paid access";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-ET", { dateStyle: "medium" }).format(date)
    : "Not available";
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; next?: string }> }) {
  const [snapshot, params] = await Promise.all([getCurrentBillingSnapshot(), searchParams]);
  const access = snapshot.access;
  const plan = billingPlans.find((item) => item.code === access?.planCode) || null;
  const active = billingGrantsAccess(access?.status, access?.currentPeriodEnd);
  const safeNext = safeNextPath(params.next || "/workspace-home");
  const returnHref = snapshot.signedIn ? (active ? safeNext : "/workspace-home") : "/";
  const accessStatus = snapshot.readError ? "Status unavailable" : active ? "Active" : access?.status === "active" ? "Expired" : statusLabel(access?.status);

  return (
    <main className="commerce-page billing-page">
      <header className="commerce-topbar">
        <Link href={snapshot.signedIn ? "/workspace-home" : "/"} className="commerce-brand" aria-label={snapshot.signedIn ? "Biloo workspace home" : "Biloo home"}><img src="/hisab-logo.svg" alt="" width="42" height="42"/><span><strong>Biloo ERP</strong><small>Billing &amp; paid access</small></span></Link>
        <Link href={returnHref} className="billing-return"><Icon name="home" size={16} />{snapshot.signedIn ? "Back to workspace" : "Biloo home"}</Link>
      </header>

      <section className="billing-hero">
        <div><span className="commerce-kicker"><Icon name="receipt" size={15} /> Billing &amp; subscriptions</span><h1>Billing &amp; paid access</h1><p>Review your Biloo ERP plan, access dates, and latest payment status. Renew manually through Chapa when you choose—there are no automatic recurring charges.</p></div>
        <span className={`billing-status ${active ? "active" : "inactive"}`}><i aria-hidden="true"/>{accessStatus}</span>
      </section>

      {params.notice ? <div className="commerce-alert warning billing-alert" role="status">{params.notice}</div> : null}
      {params.error ? <div className="commerce-alert error billing-alert" role="alert">{params.error}</div> : null}
      {snapshot.readError ? <div className="commerce-alert error billing-alert" role="alert"><Icon name="alert-triangle" size={17} /> Billing records are temporarily unavailable. No payment status can be confirmed. Please refresh this page before making another payment.</div> : null}
      {!snapshot.configured ? <div className="commerce-alert warning billing-alert" role="status">Chapa is not configured in this environment. Existing access records remain protected, but new checkout is unavailable.</div> : null}

      <section className="billing-grid">
        <article className="billing-plan-card">
          <span className="billing-card-eyebrow"><Icon name="wallet" size={16} /> Current plan</span>
          <h2>{snapshot.readError ? "Plan unavailable" : plan?.name || "No paid plan"}</h2>
          <p>{snapshot.readError ? "We cannot confirm your plan right now. Retry the status check before starting a new payment." : plan?.description || "Choose a Biloo ERP plan and complete a verified Chapa payment to activate access."}</p>
          {access ? <div className="billing-price"><strong>{access.currency || "ETB"} {formatEtb(access.amountEtb)}</strong><small>{access.billingCycle === "annual" ? "Annual access amount recorded" : "Monthly access amount recorded"}</small></div> : null}
          <div className="billing-card-actions">
            <Link href={snapshot.readError ? "/billing" : "/pricing"} className="commerce-primary">{snapshot.readError ? "Retry billing status" : active ? "Renew or change plan" : "Compare plans"} <Icon name={snapshot.readError ? "refresh-cw" : "arrow-right"} size={16} /></Link>
            <Link href="/help-center" className="commerce-secondary"><Icon name="circle-help" size={16} /> Payment help</Link>
          </div>
        </article>

        <article className="billing-detail-card">
          <header><span><Icon name="file-check" size={17} /> Access details</span><strong>Provider: Chapa</strong></header>
          <dl>
            <div><dt>Status</dt><dd>{accessStatus}</dd></div>
            <div><dt>Paid period</dt><dd>{access ? (access.billingCycle === "annual" ? "Annual" : "Monthly") : "—"}</dd></div>
            <div><dt>Access starts</dt><dd>{dateLabel(access?.currentPeriodStart)}</dd></div>
            <div><dt>Access ends</dt><dd>{dateLabel(access?.currentPeriodEnd)}</dd></div>
            <div><dt>Renewal</dt><dd>Manual payment through Chapa</dd></div>
            <div><dt>Latest payment</dt><dd>{access?.lastPaymentStatus ? statusLabel(access.lastPaymentStatus) : "—"}</dd></div>
            <div><dt>Currency</dt><dd>{access?.currency || "ETB"}</dd></div>
          </dl>
        </article>

        <article className="billing-security-card">
          <span className="billing-card-eyebrow"><Icon name="shield-check" size={16} /> Payment security</span>
          <h2>Access updates require server verification.</h2>
          <p>Biloo verifies the Chapa transaction reference, amount, currency, and final payment state on the server before applying a payment to your access ledger.</p>
          <div><span><b>01</b> Authenticated webhook delivery</span><span><b>02</b> Direct transaction verification</span><span><b>03</b> User-isolated RLS</span></div>
          <Link href="/trust">Review the Trust Center <Icon name="arrow-right" size={15} /></Link>
        </article>
      </section>
    </main>
  );
}
