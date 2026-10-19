import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { InteractiveErpOffice } from "../../components/interactive-erp-office";
import { marketingResources } from "../../lib/marketing-resources";
import { getPublicLanguage, localize } from "../../lib/public-localization";

export const metadata: Metadata = {
  title: "Business Learning Center",
  description: "Practical HisabTech guides for cash flow, inventory, customer debt, ERP selection and digital operations.",
};

const copy = {
  en: {
    eyebrow: "HisabTech Business Learning Center",
    title: "Practical operating guidance for growing Ethiopian businesses.",
    intro: "Use concise, implementation-focused guides to improve cash visibility, stock control, collections, monthly reporting and the move from manual records to ERP.",
    guides: "Practical guides",
    guideTitle: "Start with the operating problem that matters now.",
    guideIntro: "Every article focuses on a repeatable management routine rather than generic technology promotion.",
    read: "Read guide",
    minutes: "min read",
    framework: "Learning framework",
    frameworkTitle: "Turn each article into an operating change.",
    steps: [
      ["01", "Identify the decision", "Name the business decision, risk or delay the team needs to improve."],
      ["02", "Assign ownership", "Choose the person responsible for the record, review and follow-up action."],
      ["03", "Standardize the evidence", "Use the same records, definitions and review rhythm every period."],
      ["04", "Measure the result", "Compare timeliness, accuracy and business outcomes before and after the change."],
    ],
    ctaEyebrow: "Apply the guidance in HisabERP",
    ctaTitle: "See how the same routines work inside one connected workspace.",
    ctaText: "Request a focused demonstration using the reports, controls and workflows most relevant to your business.",
    demo: "Request a demo",
    tour: "Explore the product",
  },
} as const;

export default async function ResourcesPage() {
  const language = await getPublicLanguage();
  const c = copy[language];
  const resourceMetrics = [
    { label: c.guides, value: String(marketingResources.length), note: "Implementation-focused" },
    { label: "Framework", value: "4 steps", note: "From guidance to change" },
    { label: "Context", value: "ET", note: "Ethiopian business" },
  ];
  const resourceRows = marketingResources.slice(0, 3).map((article) => ({ label: localize(article.title, language), value: `${article.readingMinutes} ${c.minutes}`, meta: localize(article.category, language) }));

  return (
    <MarketingPageShell>
      <section className="resources-hero">
        <div><span className="marketing-eyebrow">{c.eyebrow}</span><h1>{c.title}</h1><p>{c.intro}</p></div>
        <InteractiveErpOffice moduleTitle="Business learning" moduleEyebrow={c.guides} metrics={resourceMetrics} rows={resourceRows} compact />
      </section>

      <section className="marketing-section resources-index-section">
        <div className="marketing-section-heading marketing-section-heading-wide"><span>{c.guides}</span><h2>{c.guideTitle}</h2><p>{c.guideIntro}</p></div>
        <div className="resources-grid">
          {marketingResources.map((article, index) => (
            <article key={article.slug}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><small>{localize(article.category, language)}</small></div>
              <h3>{localize(article.title, language)}</h3>
              <p>{localize(article.summary, language)}</p>
              <footer><span>{article.readingMinutes} {c.minutes}</span><Link href={`/resources/${article.slug}`}>{c.read} <b aria-hidden="true">→</b></Link></footer>
            </article>
          ))}
        </div>
      </section>

      <section className="resources-framework-section">
        <div><span className="marketing-eyebrow">{c.framework}</span><h2>{c.frameworkTitle}</h2></div>
        <div className="resources-framework-grid">{c.steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="marketing-cta marketing-cta-v2"><div><span>{c.ctaEyebrow}</span><h2>{c.ctaTitle}</h2><p>{c.ctaText}</p></div><div><Link href="/request-demo?source=resources" className="marketing-start marketing-large">{c.demo}</Link><Link href="/product-tour" className="marketing-demo marketing-large">{c.tour}</Link></div></section>
    </MarketingPageShell>
  );
}
