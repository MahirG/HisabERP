import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { PricingExperience } from "../../components/pricing-experience";

export const metadata: Metadata = {
  title: "HisabERP Pricing in Ethiopian Birr",
  description: "Compare indicative HisabERP Starter, Growth, Business and Enterprise pricing in ETB, including users, branches, modules, migration and optional additions.",
};

const questions = [
  { q: "Are these final commercial prices?", a: "They are indicative launch prices for standard product scope. HisabTech confirms the final quotation before purchase when branches, users, migration and integration requirements are known." },
  { q: "Is VAT included?", a: "Published prices are shown before any applicable VAT or statutory charge. The formal quotation will state the applicable tax treatment." },
  { q: "Can we start small and upgrade later?", a: "Yes. A business can begin with the plan that matches its current operating needs and move to a wider plan as users, branches or modules increase." },
  { q: "What does data migration include?", a: "Migration can cover prepared customers, suppliers, products, inventory quantities and opening balances. Historical transaction migration is assessed separately because effort depends on data quality and volume." },
  { q: "Do you offer training?", a: "Growth includes priority onboarding support, while Business and Enterprise include guided implementation. Additional on-site or specialized training can be quoted when required." },
  { q: "Can we request a custom combination of modules?", a: "Yes. HisabTech can scope a configuration when the standard plan boundaries do not match the organization’s workflow." },
];

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <section className="pricing-hero">
        <div><span className="marketing-eyebrow">Transparent ETB pricing</span><h1>Choose a plan based on the control your business needs now.</h1><p>Compare standard HisabERP plans by users, locations, modules and implementation support. Prices are presented in Ethiopian birr so the commercial starting point is clear before a demonstration.</p><div className="pricing-hero-notes"><span>No credit card for evaluation</span><span>Annual savings shown clearly</span><span>Migration scoped separately</span><span>Upgrade as the business grows</span></div></div>
        <div className="pricing-principles"><header><span>How pricing works</span><strong>Software + organization scope</strong></header><p><b>1.</b><span><strong>Choose the operating plan</strong><small>Start with the modules, users and branches required today.</small></span></p><p><b>2.</b><span><strong>Confirm implementation needs</strong><small>Identify migration, training, integrations and specialized setup.</small></span></p><p><b>3.</b><span><strong>Approve the quotation</strong><small>Review the full commercial scope before committing.</small></span></p></div>
      </section>

      <section className="pricing-section"><div className="marketing-section-heading marketing-section-heading-centered"><span>Plans and inclusions</span><h2>Start with dependable records, then expand into connected operations.</h2><p>Annual billing provides approximately two months of subscription savings compared with paying the monthly price for twelve months.</p></div><PricingExperience /></section>

      <section className="pricing-included-section"><div><span className="marketing-eyebrow">Included across plans</span><h2>Every HisabERP subscription starts with the same product foundation.</h2></div><div><article><span>01</span><h3>Secure cloud workspace</h3><p>Protected authentication, controlled organization access and structured business records.</p></article><article><span>02</span><h3>Responsive product access</h3><p>Use the workspace from desktop, tablet and supported mobile browsers.</p></article><article><span>03</span><h3>Product updates</h3><p>Receive maintained product improvements within the subscribed plan scope.</p></article><article><span>04</span><h3>Business data export</h3><p>Maintain practical access to organization records through supported export workflows.</p></article></div></section>

      <section className="marketing-section pricing-faq-section"><div className="marketing-section-heading"><span>Pricing questions</span><h2>Understand the commercial details before you choose.</h2></div><div className="pricing-faq-grid">{questions.map((item)=><article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div></section>

      <section className="marketing-cta marketing-cta-v2"><div><span>Need help choosing a plan?</span><h2>Show HisabTech how your business operates.</h2><p>We will identify the closest plan, explain any additional scope and provide a written quotation before implementation begins.</p></div><div><Link href="/request-demo?topic=pricing" className="marketing-start marketing-large">Request pricing consultation</Link><Link href="/product-tour" className="marketing-demo marketing-large">Explore the product</Link></div></section>
    </MarketingPageShell>
  );
}
