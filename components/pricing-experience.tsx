"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPlanAmount, paymentMethodGroups, pricingAddOns, pricingPlans, type BillingInterval } from "../lib/marketing-pricing";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(value);
}

const intervalLabels: Record<BillingInterval, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const periodLabels: Record<BillingInterval, string> = {
  monthly: "per month",
  quarterly: "every 3 months",
  annual: "per year",
};

type ProviderStatus = {
  activation: "ready" | "configuration_required";
  digitalCheckout: { configured: boolean; webhookConfigured: boolean; mode: string };
  bankTransfer: { enabled: boolean; channelCount: number };
};

export function PricingExperience() {
  const [billing, setBilling] = useState<BillingInterval>("annual");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const annualSavings = useMemo(
    () => pricingPlans.map((plan) => plan.monthlyEtb && plan.annualEtb ? plan.monthlyEtb * 12 - plan.annualEtb : 0),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/billing/provider-status", { signal: controller.signal })
      .then(async (response) => response.json() as Promise<ProviderStatus>)
      .then((status) => setProviderStatus(status))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProviderStatus(null);
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="pricing-trial-banner">
        <span>14-day product trial</span>
        <strong>Explore the workspace before the first subscription payment.</strong>
        <small>No card is stored by HisabTech. Digital payments are completed in the provider’s secure checkout.</small>
      </div>

      <div className="pricing-controls" aria-label="Billing period">
        {(Object.keys(intervalLabels) as BillingInterval[]).map((interval) => (
          <button type="button" className={billing === interval ? "active" : undefined} onClick={() => setBilling(interval)} key={interval}>
            {intervalLabels[interval]}
            {interval === "annual" ? <span>Save about 2 months</span> : interval === "quarterly" ? <span>3-month cycle</span> : null}
          </button>
        ))}
      </div>

      <div className="pricing-plan-grid">
        {pricingPlans.map((plan, index) => {
          const amount = getPlanAmount(plan, billing);
          const checkoutHref = `/checkout?plan=${encodeURIComponent(plan.slug)}&interval=${encodeURIComponent(billing)}`;
          const trialHref = `/auth/email-sign-up?plan=${encodeURIComponent(plan.slug)}&next=${encodeURIComponent(checkoutHref)}`;
          return (
            <article className={plan.badge ? "featured" : undefined} key={plan.name}>
              {plan.badge ? <b className="pricing-badge">{plan.badge}</b> : null}
              <header><span>{String(index + 1).padStart(2, "0")}</span><h2>{plan.name}</h2><p>{plan.audience}</p></header>
              <div className="pricing-amount">
                {amount === null ? (
                  <><strong>Custom</strong><small>Scoped to your organization</small></>
                ) : (
                  <>
                    <strong>ETB {formatEtb(amount)}</strong>
                    <small>{periodLabels[billing]}{billing === "annual" && annualSavings[index] ? ` · save ETB ${formatEtb(annualSavings[index])}` : ""}</small>
                  </>
                )}
              </div>
              <p className="pricing-description">{plan.description}</p>
              {plan.trialDays ? <div className="pricing-plan-trial"><strong>{plan.trialDays} days free</strong><span>Then choose how to pay</span></div> : null}
              <div className="pricing-capacity"><span>{plan.users}</span><span>{plan.branches}</span></div>
              <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <div className="pricing-plan-actions">
                {plan.checkoutEnabled ? (
                  <>
                    <Link href={trialHref} className={plan.badge ? "marketing-start" : "marketing-demo"}>{plan.cta}</Link>
                    <Link href={checkoutHref} className="pricing-pay-now">Pay and activate now <span aria-hidden="true">→</span></Link>
                  </>
                ) : (
                  <Link href={plan.href} className="marketing-demo">{plan.cta}</Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section className="pricing-payment-platform" aria-labelledby="payment-platform-title">
        <div className="pricing-payment-heading">
          <span className="marketing-eyebrow">Local and international checkout</span>
          <h2 id="payment-platform-title">Pay with the channel that fits your business.</h2>
          <p>One server-verified billing flow connects local mobile money, Ethiopian banks and international payment methods. HisabTech activates a subscription only after the provider confirms the amount, currency and transaction reference.</p>
          <div className="pricing-provider-status" data-status={providerStatus?.activation ?? "checking"}>
            <i aria-hidden="true" />
            <span>{providerStatus === null ? "Checking payment availability…" : providerStatus.activation === "ready" ? "Secure digital checkout is connected" : "Digital checkout is awaiting merchant activation; bank transfer remains available"}</span>
          </div>
        </div>
        <div className="pricing-payment-method-groups">
          {paymentMethodGroups.map((group, index) => (
            <article key={group.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{group.label}</h3>
              <div>{group.methods.map((method) => <b key={method}>{method}</b>)}</div>
            </article>
          ))}
        </div>
        <div className="pricing-payment-safeguards">
          <article><strong>Hosted payment page</strong><p>Wallet and card details are entered on the payment provider’s checkout, not stored in HisabERP.</p></article>
          <article><strong>Server verification</strong><p>Callbacks and signed webhooks are re-verified before an order is marked paid.</p></article>
          <article><strong>Invoice and audit trail</strong><p>Every successful order creates a subscription period, invoice and payment reference in Supabase.</p></article>
          <article><strong>Manual transfer review</strong><p>Bank-transfer receipts stay private and require finance approval before activation.</p></article>
        </div>
      </section>

      <div className="pricing-addons">
        <div><span className="marketing-eyebrow">Optional additions</span><h2>Know what changes the final commercial scope.</h2><p>These items are separated so businesses can compare the software subscription with migration, branch growth and specialized implementation work.</p></div>
        <div>{pricingAddOns.map((item) => <article key={item.label}><span><strong>{item.label}</strong><small>{item.detail}</small></span><b>{item.price}</b></article>)}</div>
      </div>
    </>
  );
}
