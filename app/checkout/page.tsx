import Link from "next/link";
import { ProviderOrbit } from "../../components/provider-orbit";
import { createSubscriptionCheckout, openStripeBillingPortal } from "../../lib/actions/billing";
import { formatEtb, getBillingPlan, getPlanAmountEtb, isBillingCycle } from "../../lib/billing/catalog";
import { getCurrentBillingSnapshot, subscriptionGrantsAccess } from "../../lib/data/billing";

export const metadata = { title: "Secure checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string; billing?: string; error?: string }> }) {
  const params = await searchParams;
  const plan = getBillingPlan(params.plan || "growth") || getBillingPlan("growth")!;
  const billingCycle = isBillingCycle(params.billing) ? params.billing : "annual";
  const amount = getPlanAmountEtb(plan, billingCycle);
  const snapshot = await getCurrentBillingSnapshot();
  const alreadyActive = subscriptionGrantsAccess(snapshot.subscription?.status);

  return (
    <main className="commerce-page checkout-page">
      <header className="commerce-topbar">
        <Link href="/" className="commerce-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42"/><span><strong>HisabTech</strong><small>Secure subscription</small></span></Link>
        <Link href="/pricing">Back to pricing</Link>
      </header>

      <section className="checkout-shell">
        <aside className="checkout-trust-panel">
          <span className="commerce-kicker">Protected HisabERP activation</span>
          <h1>One final review before your business workspace is activated.</h1>
          <p>Checkout is handled by Stripe. HisabTech never stores full card details, and your workspace is activated only after a signed payment event is verified.</p>
          <ProviderOrbit compact />
          <div className="checkout-trust-list">
            <span><b>01</b><div><strong>Secure hosted checkout</strong><small>Payment information is entered on Stripe’s protected payment surface.</small></div></span>
            <span><b>02</b><div><strong>Webhook-verified activation</strong><small>A browser redirect alone cannot mark a subscription as paid.</small></div></span>
            <span><b>03</b><div><strong>Self-service billing</strong><small>Invoices, payment methods and cancellations are managed through the Stripe portal.</small></div></span>
          </div>
        </aside>

        <section className="checkout-review-card">
          <div className="checkout-review-heading"><span>Order summary</span><h2>HisabERP {plan.name}</h2><p>{plan.description}</p></div>
          {params.error ? <div className="commerce-alert error" role="alert">{params.error}</div> : null}
          {!snapshot.configured ? <div className="commerce-alert warning" role="status">Stripe keys and the webhook signing secret must be configured before checkout can open.</div> : null}
          {alreadyActive ? <div className="commerce-alert success" role="status">Your HisabERP subscription is already active.</div> : null}

          <div className="checkout-price"><span>ETB</span><strong>{formatEtb(amount)}</strong><small>{billingCycle === "annual" ? "per year" : "per month"}</small></div>
          <div className="checkout-plan-meta"><span>{plan.users}</span><span>{plan.branches}</span></div>
          <ul>{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
          <div className="checkout-total"><span>Subscription total</span><strong>ETB {formatEtb(amount)}</strong></div>

          {alreadyActive ? (
            <form action={openStripeBillingPortal}><button className="commerce-primary" type="submit" disabled={!snapshot.configured}>Manage current subscription <b aria-hidden="true">→</b></button></form>
          ) : (
            <form action={createSubscriptionCheckout}>
              <input type="hidden" name="plan" value={plan.code}/>
              <input type="hidden" name="billing" value={billingCycle}/>
              <button className="commerce-primary" type="submit" disabled={!snapshot.configured}>Continue to secure Stripe checkout <b aria-hidden="true">→</b></button>
            </form>
          )}
          <p className="checkout-legal">By continuing, you authorize recurring billing for the selected period. Applicable taxes, provider availability and final payment methods are shown by Stripe before confirmation.</p>
          <div className="checkout-secondary"><Link href={`/pricing`}>Change plan</Link><Link href="/trust">Security details</Link></div>
        </section>
      </section>
    </main>
  );
}
