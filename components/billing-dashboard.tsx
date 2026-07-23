"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PlanSummary = { slug: string; name: string; audience?: string; description?: string } | null;
type SubscriptionSummary = {
  id: string;
  status: string;
  billing_interval: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  grace_ends_at: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  provider: string | null;
  plan: PlanSummary;
} | null;

type BillingOrder = {
  id: string;
  tx_ref: string;
  status: string;
  provider: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_at: string | null;
  failure_reason: string | null;
  payment_method: string | null;
  created_at: string;
  billing_interval: string;
  plan: PlanSummary;
};

type BillingInvoice = {
  id: string;
  invoice_number: string;
  status: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  provider: string | null;
  provider_reference: string | null;
  plan: PlanSummary;
};

type BillingNotification = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  due_at: string | null;
  read_at: string | null;
  created_at: string;
};

type PaymentChannel = {
  slug: string;
  provider: string;
  kind: string;
  display_name: string;
  description: string;
  currency: string;
};

type BillingOverview = {
  subscription: SubscriptionSummary;
  orders: BillingOrder[];
  invoices: BillingInvoice[];
  notifications: BillingNotification[];
  channels: PaymentChannel[];
  provider: { configured: boolean; webhookConfigured: boolean; mode: string };
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-ET", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function formatMoney(value: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}

function statusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(value: string) {
  if (["active", "paid", "approved", "success"].includes(value)) return "success";
  if (["trialing", "pending", "pending_review", "created", "configuration_required"].includes(value)) return "warning";
  if (["failed", "suspended", "expired", "cancelled", "reversed", "refunded"].includes(value)) return "danger";
  return "neutral";
}

export function BillingDashboard({ overview, canManage, paymentStatus, errorCode }: { overview: BillingOverview; canManage: boolean; paymentStatus?: string; errorCode?: string }) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const subscription = overview.subscription;
  const planSlug = subscription?.plan?.slug || "growth";
  const interval = subscription?.billing_interval === "quarterly" || subscription?.billing_interval === "annual" ? subscription.billing_interval : "monthly";
  const checkoutHref = `/checkout?plan=${encodeURIComponent(planSlug)}&interval=${encodeURIComponent(interval)}`;

  async function updateRenewal(action: "cancel" | "resume") {
    setActionLoading(true);
    setActionMessage("");
    setActionError("");
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to update renewal.");
      setActionMessage(action === "cancel" ? "Automatic renewal is disabled. Access continues through the current paid period." : "Subscription renewal has been restored.");
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update renewal.");
    } finally {
      setActionLoading(false);
    }
  }

  const paymentMessage = paymentStatus === "paid"
    ? "Payment verified. Your subscription and invoice are now active."
    : paymentStatus === "pending"
      ? "The provider reports that this payment is still pending."
      : paymentStatus === "verification_failed"
        ? "The returned payment could not be verified. No subscription access was granted."
        : paymentStatus
          ? `Payment status: ${statusLabel(paymentStatus)}`
          : "";

  return (
    <main className="billing-center-page">
      <section className="billing-center-hero">
        <div>
          <span className="workspace-eyebrow">Organization billing</span>
          <h1>Subscription, payments and invoices in one controlled workspace.</h1>
          <p>Review the current plan, renewal period, payment orders, provider verification and formal subscription invoices for your organization.</p>
        </div>
        <div className="billing-center-hero-actions">
          <Link href="/pricing" className="secondary action-link">Compare plans</Link>
          {canManage ? <Link href={checkoutHref} className="primary action-link">Renew or change plan</Link> : null}
        </div>
      </section>

      {paymentMessage ? <div className={`billing-alert ${paymentStatus === "paid" ? "billing-alert-success" : "billing-alert-warning"}`}>{paymentMessage}</div> : null}
      {errorCode ? <div className="billing-alert billing-alert-error">{errorCode === "billing-permission-required" ? "Only an owner or administrator can change billing." : statusLabel(errorCode)}</div> : null}
      {actionMessage ? <div className="billing-alert billing-alert-success">{actionMessage}</div> : null}
      {actionError ? <div className="billing-alert billing-alert-error">{actionError}</div> : null}

      <section className="billing-current-plan">
        <div className="billing-current-plan-heading">
          <div><span>Current subscription</span><h2>{subscription?.plan?.name || "Starter trial"}</h2><p>{subscription?.plan?.description || "Your organization is using the standard HisabERP trial foundation."}</p></div>
          <b className={`billing-status-badge tone-${statusTone(subscription?.status || "trialing")}`}>{statusLabel(subscription?.status || "trialing")}</b>
        </div>
        <div className="billing-subscription-metrics">
          <article><span>Billing cycle</span><strong>{statusLabel(subscription?.billing_interval || "monthly")}</strong><small>{subscription?.status === "trialing" ? "Selected when the first payment is made" : "Current renewal cadence"}</small></article>
          <article><span>{subscription?.status === "trialing" ? "Trial ends" : "Current period ends"}</span><strong>{formatDate(subscription?.status === "trialing" ? subscription.trial_ends_at : subscription?.current_period_end)}</strong><small>{subscription?.cancel_at_period_end ? "Renewal disabled" : "Renewal available in checkout"}</small></article>
          <article><span>Payment provider</span><strong>{subscription?.provider ? statusLabel(subscription.provider) : "Not selected"}</strong><small>{overview.provider.configured ? `Chapa ${overview.provider.mode} checkout configured` : "Bank transfer available; digital merchant activation pending"}</small></article>
          <article><span>Grace protection</span><strong>{subscription?.grace_ends_at ? formatDate(subscription.grace_ends_at) : "7 days"}</strong><small>Configured lifecycle before suspension</small></article>
        </div>
        {canManage && subscription?.status === "active" ? (
          <div className="billing-renewal-control">
            <div><strong>{subscription.cancel_at_period_end ? "Renewal is disabled" : "Renewal remains available"}</strong><p>{subscription.cancel_at_period_end ? `The subscription remains active until ${formatDate(subscription.current_period_end)}.` : "HisabTech does not silently store or charge card credentials. Complete the next hosted checkout when renewal is due."}</p></div>
            <button type="button" className="secondary" onClick={() => updateRenewal(subscription.cancel_at_period_end ? "resume" : "cancel")} disabled={actionLoading}>{actionLoading ? "Updating…" : subscription.cancel_at_period_end ? "Resume renewal" : "Cancel at period end"}</button>
          </div>
        ) : null}
      </section>

      {overview.notifications.length ? (
        <section className="workspace-section billing-notifications">
          <div className="workspace-section-heading"><div><h2>Billing attention</h2><p>Trial, renewal and payment lifecycle messages generated from the subscription state.</p></div></div>
          <div>{overview.notifications.map((notification) => <article key={notification.id}><span>{statusLabel(notification.notification_type)}</span><div><strong>{notification.title}</strong><p>{notification.body}</p></div><small>{formatDate(notification.due_at || notification.created_at)}</small></article>)}</div>
        </section>
      ) : null}

      <section className="workspace-section billing-history-section">
        <div className="workspace-section-heading"><div><h2>Payment orders</h2><p>Hosted-checkout and bank-transfer attempts with their server-confirmed status.</p></div>{canManage ? <Link href={checkoutHref} className="workspace-inline-action">Create payment order →</Link> : null}</div>
        {overview.orders.length ? (
          <div className="billing-table-frame"><table><thead><tr><th>Reference</th><th>Plan</th><th>Method</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>{overview.orders.map((order) => <tr key={order.id}><td><strong>{order.tx_ref}</strong>{order.failure_reason ? <small>{order.failure_reason}</small> : null}</td><td>{order.plan?.name || "Plan"}<small>{statusLabel(order.billing_interval)}</small></td><td>{statusLabel(order.payment_method || order.provider)}</td><td>{formatMoney(order.total_amount, order.currency)}{order.tax_amount ? <small>Includes {formatMoney(order.tax_amount, order.currency)} tax</small> : null}</td><td><b className={`billing-status-badge tone-${statusTone(order.status)}`}>{statusLabel(order.status)}</b></td><td>{formatDate(order.created_at)}</td></tr>)}</tbody></table></div>
        ) : <div className="billing-empty-state"><strong>No payment orders yet</strong><p>Start a secure checkout or bank-transfer order when the organization is ready to activate a plan.</p></div>}
      </section>

      <section className="workspace-section billing-history-section">
        <div className="workspace-section-heading"><div><h2>Subscription invoices</h2><p>Invoices are generated only after a payment has been verified or approved.</p></div></div>
        {overview.invoices.length ? (
          <div className="billing-table-frame"><table><thead><tr><th>Invoice</th><th>Plan</th><th>Period</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>{overview.invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.invoice_number}</strong><small>{formatDate(invoice.issued_at)}</small></td><td>{invoice.plan?.name || "HisabERP"}</td><td>{formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}</td><td>{formatMoney(invoice.total_amount, invoice.currency)}{invoice.tax_amount ? <small>Tax {formatMoney(invoice.tax_amount, invoice.currency)}</small> : null}</td><td><b className={`billing-status-badge tone-${statusTone(invoice.status)}`}>{statusLabel(invoice.status)}</b></td><td><Link href={`/billing/invoices/${invoice.id}`}>View invoice →</Link></td></tr>)}</tbody></table></div>
        ) : <div className="billing-empty-state"><strong>No invoices issued yet</strong><p>Your first paid subscription invoice will appear here after server verification.</p></div>}
      </section>

      <section className="workspace-section billing-channels-section">
        <div className="workspace-section-heading"><div><h2>Available payment channels</h2><p>Payment availability is controlled by provider configuration and enabled Supabase channels.</p></div></div>
        <div className="billing-channel-grid">
          <article><span>C</span><div><strong>Chapa hosted checkout</strong><p>Telebirr, M-PESA, CBE Birr, AwashBirr, PayPal and supported debit or credit cards.</p></div><b className={`billing-status-badge tone-${overview.provider.configured ? "success" : "warning"}`}>{overview.provider.configured ? "Connected" : "Activation pending"}</b></article>
          {overview.channels.filter((channel) => channel.kind === "bank_transfer").map((channel) => <article key={channel.slug}><span>B</span><div><strong>{channel.display_name}</strong><p>{channel.description}</p></div><b className="billing-status-badge tone-success">Enabled</b></article>)}
        </div>
      </section>
    </main>
  );
}
