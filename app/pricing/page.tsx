import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { PricingExperience } from "../../components/pricing-experience";

export const metadata: Metadata = {
  title: "HisabERP Pricing and Secure Payments",
  description: "Compare Starter, Growth, Business and Enterprise pricing in ETB, start a 14-day trial, and pay through local Ethiopian channels, international cards, PayPal or verified bank transfer.",
};

const questions = [
  { q: "Can we try HisabERP before paying?", a: "Yes. Starter, Growth and Business include a 14-day product trial. The trial is created for the organization in Supabase and the billing center shows the exact end date." },
  { q: "Which payment methods are supported?", a: "The secure hosted checkout is designed for Telebirr, M-PESA, CBE Birr, AwashBirr, Coopay-Ebirr, supported debit or credit cards and PayPal. CBE, Awash Bank and Bank of Abyssinia transfer workflows are also available for manual verification." },
  { q: "Does HisabTech store card or wallet credentials?", a: "No. Wallet PINs and card details are entered on the payment provider’s hosted checkout. HisabTech stores only the order, provider reference, verified amount, payment status and resulting invoice." },
  { q: "How is a payment confirmed?", a: "A browser return is never treated as proof. The server verifies the transaction reference, amount, currency and provider status. Signed webhooks are recorded idempotently before subscription access is granted." },
  { q: "Is VAT included?", a: "The billing engine calculates tax from HisabTech’s configured VAT registration status. The checkout order and final invoice show any applicable VAT separately. VAT is not added while the seller setting is disabled." },
  { q: "Will my card be charged automatically?", a: "HisabTech does not silently store or recharge card credentials. Renewal is managed by the subscription lifecycle, and the organization completes a new secure hosted checkout when payment is due unless a future provider-approved recurring mandate is introduced." },
  { q: "What happens when a trial or paid period ends?", a: "The subscription moves through trialing, active, past-due or grace-period states before suspension. The default grace period is seven days, and the billing center shows renewal attention before access changes." },
  { q: "Can we start small and upgrade later?", a: "Yes. Owners and administrators can open the billing center, compare plans and create a verified payment order for a wider plan or billing cycle." },
  { q: "What does data migration include?", a: "Migration can cover prepared customers, suppliers, products, inventory quantities and opening balances. Historical transactions and custom integrations are scoped separately because effort depends on data quality and volume." },
  { q: "Can we request a custom combination of modules?", a: "Yes. Enterprise and non-standard configurations use a written commercial quotation, implementation scope and provider setup appropriate to the organization." },
];

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <section className="pricing-hero">
        <div><span className="marketing-eyebrow">Transparent ETB pricing</span><h1>Choose, pay and activate a plan through one verified billing system.</h1><p>Compare HisabERP by users, locations, modules and implementation support. Start a 14-day trial or activate immediately through local Ethiopian payments, international methods or reviewed bank transfer.</p><div className="pricing-hero-notes"><span>14-day trial</span><span>Monthly, quarterly or annual</span><span>Local and international payment options</span><span>Server-verified activation</span></div></div>
        <div className="pricing-principles"><header><span>How billing works</span><strong>Plan + payment + verified access</strong></header><p><b>1.</b><span><strong>Choose the operating plan</strong><small>Select the modules, users, branches and billing cycle required today.</small></span></p><p><b>2.</b><span><strong>Complete secure payment</strong><small>Use hosted digital checkout or create a bank-transfer order with a unique Hisab reference.</small></span></p><p><b>3.</b><span><strong>Activate from verified evidence</strong><small>The server creates the subscription period and invoice only after provider verification or finance approval.</small></span></p></div>
      </section>

      <section className="pricing-section"><div className="marketing-section-heading marketing-section-heading-centered"><span>Plans and inclusions</span><h2>Start with dependable records, then expand into connected operations.</h2><p>Annual billing provides approximately two months of subscription savings. Quarterly billing keeps payments aligned to a three-month operating cycle.</p></div><PricingExperience /></section>

      <section className="pricing-included-section"><div><span className="marketing-eyebrow">Included across plans</span><h2>Every HisabERP subscription starts with the same product and billing foundation.</h2></div><div><article><span>01</span><h3>Secure cloud workspace</h3><p>Protected authentication, controlled organization access and structured business records.</p></article><article><span>02</span><h3>Subscription billing center</h3><p>Plan status, trial period, renewal dates, payment orders, invoices and attention messages.</p></article><article><span>03</span><h3>Provider verification</h3><p>Signed callbacks and server verification before payment changes organization access.</p></article><article><span>04</span><h3>Business data export</h3><p>Practical access to organization records through supported export workflows.</p></article></div></section>

      <section className="marketing-section pricing-faq-section"><div className="marketing-section-heading"><span>Pricing and payment questions</span><h2>Understand the commercial and technical controls before you choose.</h2></div><div className="pricing-faq-grid">{questions.map((item)=><article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div></section>

      <section className="marketing-cta marketing-cta-v2"><div><span>Ready to activate a plan?</span><h2>Start a trial, pay securely or request a custom commercial scope.</h2><p>Standard plans use the integrated billing platform. Enterprise, custom migration and specialized integrations still begin with a written quotation.</p></div><div><Link href="/checkout?plan=growth&interval=annual" className="marketing-start marketing-large">Open secure checkout</Link><Link href="/request-demo?topic=pricing" className="marketing-demo marketing-large">Request pricing consultation</Link></div></section>
    </MarketingPageShell>
  );
}
