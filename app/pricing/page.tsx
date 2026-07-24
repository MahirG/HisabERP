import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { PricingExperience } from "../../components/pricing-experience";

export const metadata: Metadata = {
  title: "HisabERP Pricing in Ethiopian Birr",
  description: "Compare HisabERP Starter, Growth, Business and Enterprise pricing in ETB, then continue through protected Stripe subscription checkout.",
};

const questions = [
  { q: "Are these final subscription prices?", a: "Starter, Growth and Business use the published ETB subscription price shown for the selected billing period. Optional migration, additional users, branches, custom integrations and Enterprise scope are priced separately." },
  { q: "How is payment confirmed?", a: "Stripe hosts the checkout. HisabTech activates paid access only after validating Stripe’s signed webhook; a browser redirect alone cannot mark a subscription as paid." },
  { q: "Is VAT included?", a: "Published prices are shown before any applicable VAT or statutory charge. Stripe displays the final payable amount and available payment methods before confirmation." },
  { q: "Can we start small and upgrade later?", a: "Yes. A business can begin with the plan that matches its current operating needs and move to a wider plan through the billing portal as users, branches or modules increase." },
  { q: "What does data migration include?", a: "Migration can cover prepared customers, suppliers, products, inventory quantities and opening balances. Historical transaction migration is assessed separately because effort depends on data quality and volume." },
  { q: "Can we request a custom combination of modules?", a: "Yes. Enterprise and specialized implementation requirements are scoped with HisabTech when standard plan boundaries do not match the organization’s workflow." },
];

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <section className="pricing-hero">
        <div><span className="marketing-eyebrow">Transparent ETB pricing</span><h1>Choose the plan that gives your business the right control now.</h1><p>Compare users, locations, modules and support, then continue through secure Stripe checkout for Starter, Growth or Business. Enterprise remains a guided commercial engagement.</p><div className="pricing-hero-notes"><span>Webhook-verified activation</span><span>Annual savings shown clearly</span><span>Migration scoped separately</span><span>Manage billing securely</span></div></div>
        <div className="pricing-principles"><header><span>How subscription works</span><strong>Choose · verify · activate</strong></header><p><b>1.</b><span><strong>Select the operating plan</strong><small>Choose the modules, users, branches and billing period required today.</small></span></p><p><b>2.</b><span><strong>Complete Stripe checkout</strong><small>Review the final amount and available provider methods on Stripe’s protected surface.</small></span></p><p><b>3.</b><span><strong>Activate after verification</strong><small>HisabTech waits for a signed Stripe event before enabling paid subscription state.</small></span></p></div>
      </section>

      <section className="pricing-section"><div className="marketing-section-heading marketing-section-heading-centered"><span>Plans and inclusions</span><h2>Start with dependable records, then expand into connected operations.</h2><p>Annual billing provides approximately two months of subscription savings compared with paying the monthly price for twelve months.</p></div><PricingExperience /></section>

      <section className="pricing-included-section"><div><span className="marketing-eyebrow">Included across plans</span><h2>Every HisabERP subscription starts with the same product foundation.</h2></div><div><article><span>01</span><h3>Secure cloud workspace</h3><p>Protected authentication, controlled organization access and structured business records.</p></article><article><span>02</span><h3>Responsive product access</h3><p>Use the workspace from desktop, tablet and supported mobile browsers.</p></article><article><span>03</span><h3>Product updates</h3><p>Receive maintained product improvements within the subscribed plan scope.</p></article><article><span>04</span><h3>Billing control</h3><p>Use Stripe’s customer portal for supported payment methods, invoices and subscription settings.</p></article></div></section>

      <section className="marketing-section pricing-faq-section"><div className="marketing-section-heading"><span>Pricing questions</span><h2>Understand the commercial details before you choose.</h2></div><div className="pricing-faq-grid">{questions.map((item)=><article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div></section>

      <section className="marketing-cta marketing-cta-v2"><div><span>Need help choosing a plan?</span><h2>Use self-service checkout or discuss complex scope.</h2><p>Standard plans can begin online. HisabTech will guide migration, integrations, Enterprise requirements and specialized implementation.</p></div><div><Link href="/request-demo?topic=pricing" className="marketing-start marketing-large">Request pricing consultation</Link><Link href="/product-tour" className="marketing-demo marketing-large">Explore the product</Link></div></section>
    </MarketingPageShell>
  );
}
