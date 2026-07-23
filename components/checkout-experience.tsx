"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPlanAmount, pricingPlans, type BillingInterval } from "../lib/marketing-pricing";

type CheckoutUser = {
  fullName: string;
  email: string;
  organizationName: string;
};

type ProviderStatus = {
  activation: "ready" | "configuration_required";
  digitalCheckout: { configured: boolean; webhookConfigured: boolean; mode: string; supportedMethods: string[] };
  bankTransfer: { enabled: boolean; channelCount: number };
};

type BankChannel = {
  slug: string;
  display_name: string;
  description: string;
  currency: string;
  account_name: string | null;
  account_number: string | null;
  instructions: string | null;
};

type BankCheckout = {
  provider: "bank_transfer";
  orderId: string;
  txRef: string;
  amount: number;
  currency: string;
  instructions: string;
  channels: BankChannel[];
};

type DigitalCheckout = {
  provider: "chapa";
  orderId: string;
  txRef: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
};

const intervalLabels: Record<BillingInterval, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

function formatMoney(amount: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function CheckoutExperience({ user, initialPlan, initialInterval }: { user: CheckoutUser; initialPlan: string; initialInterval: BillingInterval }) {
  const [planSlug, setPlanSlug] = useState(initialPlan);
  const [interval, setInterval] = useState<BillingInterval>(initialInterval);
  const [provider, setProvider] = useState<"chapa" | "bank_transfer">("chapa");
  const [phone, setPhone] = useState("");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankOrder, setBankOrder] = useState<BankCheckout | null>(null);
  const [bankChannel, setBankChannel] = useState("");
  const [proofLoading, setProofLoading] = useState(false);
  const [proofMessage, setProofMessage] = useState("");

  const availablePlans = pricingPlans.filter((plan) => plan.checkoutEnabled);
  const selectedPlan = useMemo(() => availablePlans.find((plan) => plan.slug === planSlug) ?? availablePlans[0], [availablePlans, planSlug]);
  const displayAmount = getPlanAmount(selectedPlan, interval) ?? 0;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/billing/provider-status", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => response.json() as Promise<ProviderStatus>)
      .then((result) => {
        setProviderStatus(result);
        if (!result.digitalCheckout.configured && result.bankTransfer.enabled) setProvider("bank_transfer");
      })
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === "AbortError")) setProviderStatus(null);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setBankOrder(null);
    setProofMessage("");
    setError("");
  }, [planSlug, interval, provider]);

  async function startCheckout() {
    setLoading(true);
    setError("");
    setProofMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan.slug, interval, provider, phone }),
      });
      const payload = await response.json() as (DigitalCheckout | BankCheckout | { error?: string; code?: string });
      if (!response.ok) throw new Error("error" in payload && payload.error ? payload.error : "Unable to start checkout.");
      if ("provider" in payload && payload.provider === "chapa") {
        window.location.assign(payload.checkoutUrl);
        return;
      }
      if ("provider" in payload && payload.provider === "bank_transfer") {
        setBankOrder(payload);
        setBankChannel(payload.channels[0]?.slug ?? "");
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTransferProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bankOrder) return;
    setProofLoading(true);
    setError("");
    setProofMessage("");
    try {
      const form = new FormData(event.currentTarget);
      form.set("orderId", bankOrder.orderId);
      form.set("amount", String(bankOrder.amount));
      const response = await fetch("/api/billing/bank-transfer", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const payload = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to submit transfer proof.");
      setProofMessage(payload.message || "Transfer proof received for verification.");
      event.currentTarget.reset();
      setBankChannel(bankOrder.channels[0]?.slug ?? "");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit transfer proof.");
    } finally {
      setProofLoading(false);
    }
  }

  const digitalReady = providerStatus?.digitalCheckout.configured === true;
  const bankReady = providerStatus?.bankTransfer.enabled !== false;

  return (
    <main className="billing-checkout-page">
      <header className="billing-commerce-header">
        <Link href="/pricing" className="billing-back-link">← Back to pricing</Link>
        <Link href="/" className="billing-commerce-brand"><img src="/hisab-logo.svg" width="38" height="38" alt="" /><span><strong>HisabTech</strong><small>Secure subscription checkout</small></span></Link>
        <Link href="/billing" className="billing-header-link">Billing center</Link>
      </header>

      <section className="billing-checkout-shell">
        <div className="billing-checkout-main">
          <div className="billing-checkout-heading">
            <span>Subscription checkout</span>
            <h1>Activate the right HisabERP plan for your organization.</h1>
            <p>Choose the billing cycle and complete payment through a secure hosted provider or submit a bank transfer for finance verification.</p>
          </div>

          {error ? <div className="billing-alert billing-alert-error" role="alert">{error}</div> : null}
          {proofMessage ? <div className="billing-alert billing-alert-success" role="status">{proofMessage} <Link href="/billing">Open billing center →</Link></div> : null}

          <section className="billing-checkout-section">
            <div className="billing-section-title"><span>01</span><div><h2>Choose your plan</h2><p>You can upgrade again later from the billing center.</p></div></div>
            <div className="billing-plan-selector">
              {availablePlans.map((plan) => (
                <button type="button" className={selectedPlan.slug === plan.slug ? "active" : undefined} onClick={() => setPlanSlug(plan.slug)} key={plan.slug}>
                  <span>{plan.name}</span><strong>{formatMoney(getPlanAmount(plan, interval) ?? 0)}</strong><small>{plan.users} · {plan.branches}</small>
                </button>
              ))}
            </div>
            <div className="billing-interval-selector" aria-label="Billing interval">
              {(Object.keys(intervalLabels) as BillingInterval[]).map((item) => (
                <button type="button" className={interval === item ? "active" : undefined} onClick={() => setInterval(item)} key={item}>
                  <strong>{intervalLabels[item]}</strong>
                  <small>{item === "annual" ? "Save about two months" : item === "quarterly" ? "Pay every three months" : "Flexible monthly renewal"}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="billing-checkout-section">
            <div className="billing-section-title"><span>02</span><div><h2>Choose how to pay</h2><p>HisabTech never stores wallet PINs or card details.</p></div></div>
            <div className="billing-provider-selector">
              <button type="button" className={provider === "chapa" ? "active" : undefined} onClick={() => setProvider("chapa")} disabled={providerStatus !== null && !digitalReady}>
                <span className="billing-provider-mark">C</span>
                <span><strong>Secure digital checkout</strong><small>Telebirr, M-PESA, CBE Birr, AwashBirr, cards and PayPal</small></span>
                <b>{digitalReady ? "Available" : providerStatus === null ? "Checking" : "Activation pending"}</b>
              </button>
              <button type="button" className={provider === "bank_transfer" ? "active" : undefined} onClick={() => setProvider("bank_transfer")} disabled={!bankReady}>
                <span className="billing-provider-mark">B</span>
                <span><strong>Bank transfer</strong><small>CBE, Awash Bank or Bank of Abyssinia with receipt review</small></span>
                <b>{bankReady ? "Available" : "Unavailable"}</b>
              </button>
            </div>
            <label className="billing-field">
              <span>Mobile number <small>Optional, used to prefill supported wallet checkout</small></span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="09xxxxxxxx or 07xxxxxxxx" maxLength={18} />
            </label>
          </section>

          {!bankOrder ? (
            <button className="billing-checkout-submit" type="button" onClick={startCheckout} disabled={loading || (provider === "chapa" && providerStatus !== null && !digitalReady)}>
              <span>{loading ? "Preparing secure checkout…" : provider === "chapa" ? "Continue to secure checkout" : "Create bank-transfer order"}</span><b aria-hidden="true">→</b>
            </button>
          ) : (
            <section className="billing-bank-order" aria-labelledby="bank-order-heading">
              <div className="billing-bank-order-reference"><span>Hisab payment reference</span><strong>{bankOrder.txRef}</strong><small>Include this reference with the transfer and proof submission.</small></div>
              <h2 id="bank-order-heading">Submit bank-transfer proof</h2>
              <p>{bankOrder.instructions}</p>
              <div className="billing-bank-channels">
                {bankOrder.channels.map((channel) => (
                  <article key={channel.slug}>
                    <strong>{channel.display_name}</strong>
                    <p>{channel.description}</p>
                    {channel.account_name && channel.account_number ? <div><span>{channel.account_name}</span><b>{channel.account_number}</b></div> : <small>Account details are issued on the formal HisabTech invoice.</small>}
                  </article>
                ))}
              </div>
              <form onSubmit={submitTransferProof} className="billing-proof-form">
                <label className="billing-field"><span>Bank channel</span><select name="channel" value={bankChannel} onChange={(event) => setBankChannel(event.target.value)} required>{bankOrder.channels.map((channel) => <option value={channel.slug} key={channel.slug}>{channel.display_name}</option>)}</select></label>
                <label className="billing-field"><span>Bank transaction reference</span><input name="transferReference" placeholder="Enter the bank reference" maxLength={120} required /></label>
                <label className="billing-field"><span>Transferred amount</span><input value={`${bankOrder.currency} ${bankOrder.amount.toFixed(2)}`} readOnly /></label>
                <label className="billing-field billing-file-field"><span>Receipt image or PDF <small>Private, maximum 10 MB</small></span><input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label>
                <button type="submit" className="billing-checkout-submit" disabled={proofLoading || !bankChannel}>{proofLoading ? "Uploading securely…" : "Submit proof for verification"}</button>
              </form>
            </section>
          )}
        </div>

        <aside className="billing-order-summary">
          <span>Order summary</span>
          <h2>{selectedPlan.name}</h2>
          <p>{selectedPlan.description}</p>
          <div className="billing-summary-price"><strong>{formatMoney(displayAmount)}</strong><small>{intervalLabels[interval]} billing</small></div>
          <dl><div><dt>Organization</dt><dd>{user.organizationName}</dd></div><div><dt>Billing contact</dt><dd>{user.fullName}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Tax</dt><dd>Calculated from HisabTech’s configured VAT status</dd></div></dl>
          <ul>{selectedPlan.features.slice(0, 6).map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <div className="billing-security-note"><strong>Protected activation</strong><p>The subscription becomes active only after server verification or bank-transfer approval.</p></div>
        </aside>
      </section>
    </main>
  );
}
