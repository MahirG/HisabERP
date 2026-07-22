import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "../../components/marketing-site-chrome";
import { ProductTourExperience } from "../../components/product-tour-experience";

export const metadata: Metadata = {
  title: "HisabERP Product Tour",
  description: "Explore the HisabERP dashboard, sales, inventory, finance and reporting workflows in an interactive product tour.",
};

export default function ProductTourPage() {
  return (
    <MarketingPageShell>
      <section className="marketing-page-hero product-tour-hero">
        <div>
          <span className="marketing-eyebrow">Interactive HisabERP product tour</span>
          <h1>See how HisabERP connects daily work to better business decisions.</h1>
          <p>Move through the major product areas and explore how sales, inventory, finance and reporting contribute to one reliable operating picture.</p>
          <div className="marketing-hero-actions">
            <Link href="/auth/email-sign-up" className="marketing-start marketing-large">Start free</Link>
            <Link href="/request-demo" className="marketing-demo marketing-large">Request a guided demo</Link>
          </div>
        </div>
        <aside className="product-tour-hero-summary">
          <strong>What this tour covers</strong>
          <span>Executive dashboard</span>
          <span>Sales and invoicing</span>
          <span>Inventory control</span>
          <span>Finance and cash flow</span>
          <span>Reports and analytics</span>
        </aside>
      </section>

      <section className="product-tour-page-stage">
        <ProductTourExperience />
      </section>

      <section className="marketing-tour-principles">
        <div className="marketing-section-heading marketing-section-heading-centered">
          <span>One connected workflow</span>
          <h2>The value is not only in each module—it is in how the modules work together.</h2>
        </div>
        <div>
          <article><b>01</b><h3>Record once</h3><p>A transaction should not need to be rewritten across multiple files or departments.</p></article>
          <article><b>02</b><h3>Update automatically</h3><p>Sales, balances, stock and financial position should remain connected as activity happens.</p></article>
          <article><b>03</b><h3>Review confidently</h3><p>Managers should work from the same operational records used by the team.</p></article>
        </div>
      </section>

      <section className="marketing-cta marketing-cta-v2">
        <div><span>Need a tour based on your business?</span><h2>Tell us how your company currently manages operations.</h2><p>HisabTech can demonstrate the workflows most relevant to your industry, team structure and current challenges.</p></div>
        <div><Link href="/request-demo" className="marketing-start marketing-large">Request a guided demo</Link><Link href="/auth/email-sign-up" className="marketing-demo marketing-large">Create a workspace</Link></div>
      </section>
    </MarketingPageShell>
  );
}
