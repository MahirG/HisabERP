import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { InteractiveErpOffice } from "../../components/interactive-erp-office";

export const metadata: Metadata = {
  title: "ERP Built for Ethiopian Businesses",
  description: "See how HisabERP supports Ethiopian birr, local operating realities, multilingual access, mobile workflows, local onboarding and business management from Addis Ababa.",
};

const localAdvantages = [
  { number: "01", title: "Ethiopian birr at the center", text: "Run daily transactions, balances, invoices, purchasing, expenses and reports in ETB without adapting a foreign-first interface." },
  { number: "02", title: "Local-language access", text: "Use English and Amharic across core product experiences, with an architecture designed for continued Ethiopian-language expansion." },
  { number: "03", title: "Mobile and bandwidth conscious", text: "Use responsive workflows designed for phones, tablets and desktop screens without depending on oversized visual assets." },
  { number: "04", title: "Local business structures", text: "Configure branches, users, customers, suppliers, products, services, fiscal details and responsibilities around how the organization actually operates." },
  { number: "05", title: "Digital-payment readiness", text: "Maintain payment-channel records and use reconciliation workflows prepared for supported local payment and banking connections." },
  { number: "06", title: "Local implementation support", text: "Work with a HisabTech team based in Addis Ababa for product evaluation, setup guidance, migration planning and team onboarding." },
];

const operatingReality = [
  ["Notebooks and separate Excel files", "One controlled operational record across authorized teams"],
  ["End-of-month discovery", "Daily visibility into cash, stock, balances and exceptions"],
  ["Unclear customer and supplier balances", "Structured receivable and payable records with follow-up context"],
  ["Different numbers across branches", "Branch-aware activity and consolidated management reporting"],
  ["Software that assumes foreign workflows", "A product designed around Ethiopian business use cases and terminology"],
];

const localMetrics = [
  { label: "Primary currency", value: "ETB", note: "Ethiopian birr" },
  { label: "Languages", value: "EN · AM", note: "Localized access" },
  { label: "Support", value: "Addis Ababa", note: "Local implementation context" },
];

const localRows = [
  { label: "Mobile workflows", value: "Ready", meta: "Phone · tablet · desktop" },
  { label: "Multi-branch operations", value: "Connected", meta: "Consolidated visibility" },
  { label: "Payment records", value: "Local-ready", meta: "Reconciliation workflow" },
];

export default function EthiopiaPage() {
  return (
    <MarketingPageShell>
      <section className="local-hero">
        <div>
          <span className="marketing-eyebrow">Built locally for Ethiopian business reality</span>
          <h1>An ERP that understands where your business operates.</h1>
          <p>HisabERP is developed by Hisab Technologies in Addis Ababa to help Ethiopian businesses replace fragmented records with one secure, multilingual and decision-ready workspace.</p>
          <div className="marketing-hero-actions">
            <Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start free</Link>
            <Link href="/request-demo" className="marketing-demo marketing-large">Request an Ethiopia-focused demo</Link>
          </div>
        </div>
        <InteractiveErpOffice moduleTitle="Ethiopia operations" moduleEyebrow="Local operating profile" metrics={localMetrics} rows={localRows} compact />
      </section>

      <section className="marketing-section local-advantages-section">
        <div className="marketing-section-heading marketing-section-heading-wide"><span>Local advantages</span><h2>Built around the details that determine whether business software is actually usable.</h2><p>Localization is more than translating a button. It means the currency, workflows, access patterns, support model and implementation approach fit the operating environment.</p></div>
        <div className="local-advantage-grid">{localAdvantages.map((item)=><article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="local-reality-section">
        <div><span className="marketing-eyebrow">Move beyond disconnected records</span><h2>Replace common operating friction with one reliable business picture.</h2><p>HisabERP is designed for businesses that need practical control today while building a stronger foundation for growth.</p><Link href="/product-tour" className="marketing-dark-link">Explore the product tour →</Link></div>
        <div className="local-reality-table"><header><span>Before HisabERP</span><span>With HisabERP</span></header>{operatingReality.map(([before,after])=><p key={before}><span>{before}</span><strong>{after}</strong></p>)}</div>
      </section>

      <section className="marketing-section local-readiness-section">
        <div className="marketing-section-heading"><span>Implementation readiness</span><h2>Start from your current reality—not an idealized process.</h2><p>Whether records are in notebooks, spreadsheets or another system, HisabTech can help define the setup and migration path before the organization changes its daily process.</p></div>
        <div className="local-readiness-grid"><article><span>01</span><h3>Business assessment</h3><p>Review branches, users, products, services, balances, workflows and reporting expectations.</p></article><article><span>02</span><h3>Data preparation</h3><p>Organize customer, supplier, inventory and opening-balance information for controlled migration.</p></article><article><span>03</span><h3>Configuration and training</h3><p>Prepare roles, modules and daily processes, then guide the team through practical use.</p></article><article><span>04</span><h3>Go-live support</h3><p>Review initial activity, correct setup gaps and establish a dependable operating rhythm.</p></article></div>
      </section>

      <section className="marketing-cta marketing-cta-v2"><div><span>Evaluate HisabERP in your Ethiopian business</span><h2>See the product using workflows and examples relevant to your team.</h2><p>Tell us how the business currently manages sales, stock, expenses, balances and reporting. We will focus the demonstration on that operating reality.</p></div><div><Link href="/request-demo" className="marketing-start marketing-large">Request a local demo</Link><Link href="/industries" className="marketing-demo marketing-large">Explore industries</Link></div></section>
    </MarketingPageShell>
  );
}
