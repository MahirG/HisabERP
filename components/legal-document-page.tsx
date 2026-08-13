import Link from "next/link";
import { Page, Settings, ShieldCheck } from "iconoir-react";
import type { ReactNode } from "react";
import { MarketingPageShell } from "./marketing-site-chrome";

type LegalSection = {
  id: string;
  title: string;
  summary: string;
  content: ReactNode;
};

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDate: string;
  readingTime: string;
  highlights: Array<{ label: string; value: string }>;
  sections: LegalSection[];
  relatedHref: string;
  relatedLabel: string;
};

function LegalIcon({ type }: { type: "shield" | "document" | "control" }) {
  if (type === "shield") return <ShieldCheck width={22} height={22} strokeWidth={1.55} aria-hidden />;
  if (type === "control") return <Settings width={22} height={22} strokeWidth={1.55} aria-hidden />;
  return <Page width={22} height={22} strokeWidth={1.55} aria-hidden />;
}

export function LegalDocumentPage({
  eyebrow,
  title,
  description,
  effectiveDate,
  readingTime,
  highlights,
  sections,
  relatedHref,
  relatedLabel,
}: LegalDocumentPageProps) {
  return (
    <MarketingPageShell>
      <section className="legal-hero">
        <div className="legal-hero-copy">
          <span className="marketing-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="legal-meta">
            <span><strong>Effective</strong>{effectiveDate}</span>
            <span><strong>Reading time</strong>{readingTime}</span>
            <span><strong>Contact</strong><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a></span>
          </div>
        </div>
        <aside className="legal-hero-card" aria-label="Policy commitment">
          <span className="legal-hero-icon"><LegalIcon type="shield" /></span>
          <strong>Clear policy. Practical control.</strong>
          <p>We explain what applies, why it matters, and how to contact us—without hiding important terms in vague language.</p>
          <Link href={relatedHref}>{relatedLabel}<span aria-hidden="true">→</span></Link>
        </aside>
      </section>

      <section className="legal-highlights" aria-label="Policy overview">
        {highlights.map((item, index) => (
          <article key={item.label}>
            <span className="legal-highlight-icon"><LegalIcon type={index === 0 ? "shield" : index === 1 ? "control" : "document"} /></span>
            <div><small>{item.label}</small><strong>{item.value}</strong></div>
          </article>
        ))}
      </section>

      <section className="legal-document-shell">
        <aside className="legal-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <nav>
            {sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
            ))}
          </nav>
          <div>
            <strong>Questions?</strong>
            <p>Contact the Biloo team for a plain-language explanation.</p>
            <a href="mailto:mahir@hisabtech.com">Email privacy support</a>
          </div>
        </aside>

        <article className="legal-document">
          {sections.map((section, index) => (
            <section id={section.id} key={section.id}>
              <header><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{section.title}</h2><p>{section.summary}</p></div></header>
              <div className="legal-section-content">{section.content}</div>
            </section>
          ))}
        </article>
      </section>

      <section className="legal-contact-panel">
        <div>
          <span className="marketing-eyebrow">Direct support</span>
          <h2>Need clarification before you continue?</h2>
          <p>Send your question, the page or feature involved, and the contact details you want us to use. We will provide a clear response.</p>
        </div>
        <div className="legal-contact-actions">
          <a href="mailto:mahir@hisabtech.com">Email Mahir</a>
          <Link href="/help-center">Visit Help Center</Link>
        </div>
      </section>
    </MarketingPageShell>
  );
}
