import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "iconoir-react";
import { MarketingPageShell } from "../../components/marketing-site-chrome";

export const metadata: Metadata = {
  title: "Software Development & Business Automation | Hisab Technologies",
  description: "Explore custom software, ERP systems, websites, mobile apps, AI automation, cloud solutions and security services from Hisab Technologies in Ethiopia.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Hisab Technologies — Software & Business Systems",
    description: "Purpose-built digital solutions, from ERP and automation to apps, web experiences and secure systems.",
    url: "/services",
    type: "website",
  },
};

const services = [
  { id: "01", title: "Custom software", description: "Build applications and workflows around the way your organization actually works.", detail: "Business platforms · Internal tools · Integrations" },
  { id: "02", title: "ERP & business systems", description: "Connect operations, financial workflows and reporting through structured business software.", detail: "Biloo ERP · Operations · Reporting" },
  { id: "03", title: "Website development", description: "Create fast, accessible, conversion-focused websites that communicate your brand with clarity.", detail: "Marketing sites · Web platforms · SEO foundations" },
  { id: "04", title: "Mobile applications", description: "Design mobile-first experiences with practical navigation and reliable everyday interactions.", detail: "Mobile products · Responsive systems · UX" },
  { id: "05", title: "AI & automation", description: "Explore practical ways to reduce repetitive work and improve operational decision-making.", detail: "Workflow automation · AI-assisted tools · Process design" },
  { id: "06", title: "Cloud & infrastructure", description: "Plan dependable hosting, deployment and system integrations for evolving business requirements.", detail: "Cloud architecture · Delivery · Monitoring" },
  { id: "07", title: "UI/UX & product design", description: "Turn complex processes into interfaces that are understandable, consistent and efficient.", detail: "Design systems · Product strategy · Accessibility" },
  { id: "08", title: "Security & modernization", description: "Review access controls, reliability and modernization opportunities in critical software.", detail: "System review · Access design · Modernization" },
] as const;

const approach = [
  { number: "01", title: "Understand", description: "Clarify your business workflows, constraints and success criteria." },
  { number: "02", title: "Design", description: "Map the right system, experience and implementation priorities." },
  { number: "03", title: "Build", description: "Deliver tested software in manageable, reviewable milestones." },
  { number: "04", title: "Improve", description: "Refine performance, usability and capabilities as needs evolve." },
] as const;

export default function ServicesPage() {
  return (
    <MarketingPageShell>
      <div className="hisab-services-page">
        <section className="hisab-services-hero" aria-labelledby="hisab-services-title">
          <div className="hisab-services-hero-content">
            <span className="hisab-services-eyebrow">HISAB TECHNOLOGIES / SOFTWARE ENGINEERING</span>
            <h1 id="hisab-services-title">Serious software.<br /><em>Built around your business.</em></h1>
            <p>From modern websites to complete business operating systems, we design and engineer practical digital solutions for organizations in Ethiopia and beyond.</p>
            <div className="hisab-services-actions">
              <Link className="hisab-services-primary" href="/request-demo?source=hisab-services">Discuss your project <ArrowRight aria-hidden="true" /></Link>
              <Link className="hisab-services-secondary" href="/product-tour">Explore Biloo ERP <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="hisab-services-hero-aside" aria-label="Hisab Technologies principles">
            <span className="hisab-services-side-label">OUR APPROACH</span>
            <strong>Clear thinking.<br />Precise execution.<br />Long-term value.</strong>
            <div className="hisab-services-aside-divider" />
            <p>Building the Future, One Solution at a Time.</p>
            <span className="hisab-services-aside-location">ADDIS ABABA, ETHIOPIA</span>
          </div>
        </section>

        <section className="hisab-services-list-section" aria-labelledby="hisab-services-list-title">
          <div className="hisab-services-section-head">
            <div><span className="hisab-services-section-tag">01 / WHAT WE DO</span><h2 id="hisab-services-list-title">Technology that solves <em>real business problems.</em></h2></div>
            <p>Our services span strategy, product engineering and business transformation. The right solution starts with your actual requirements.</p>
          </div>
          <div className="hisab-services-grid">
            {services.map((service) => (
              <article className="hisab-service-card" key={service.id}>
                <span className="hisab-service-id">{service.id} / 08</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <small>{service.detail}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="hisab-services-product" aria-labelledby="hisab-services-product-title">
          <div><span className="hisab-services-section-tag">02 / OUR BUSINESS SOFTWARE</span><h2 id="hisab-services-product-title">Meet Biloo.<br /><em>One connected operating system.</em></h2><p>Biloo brings sales, finance, inventory, purchasing and reporting into a connected ERP experience. See the real product areas and clearly labeled interactive previews.</p><Link href="/product-tour">Discover Biloo <ArrowRight aria-hidden="true" /></Link></div>
          <div className="hisab-services-product-system"><span>BILOO / BUSINESS OPERATING SYSTEM</span><div><strong>Sales</strong><strong>Finance</strong><strong>Inventory</strong><strong>Reporting</strong></div><small>Connected business workflows · Built for Ethiopia</small></div>
        </section>

        <section className="hisab-services-process" aria-labelledby="hisab-services-process-title">
          <div className="hisab-services-section-head"><div><span className="hisab-services-section-tag">03 / HOW WE WORK</span><h2 id="hisab-services-process-title">A disciplined path <em>from idea to impact.</em></h2></div></div>
          <div className="hisab-services-process-grid">
            {approach.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}
          </div>
        </section>

        <section className="hisab-services-final" aria-labelledby="hisab-services-final-title">
          <span>LET'S BUILD SOMETHING USEFUL</span>
          <h2 id="hisab-services-final-title">Your next business breakthrough starts with a conversation.</h2>
          <p>Tell us what you need to improve, connect or create. We'll help you explore a practical direction.</p>
          <Link href="/request-demo?source=hisab-services-final">Contact Hisab Technologies <ArrowRight aria-hidden="true" /></Link>
        </section>
      </div>
    </MarketingPageShell>
  );
}
