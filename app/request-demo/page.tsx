import type { Metadata } from "next";
import Link from "next/link";
import { submitDemoRequest } from "../../lib/actions/demo-request";
import { Icon } from "../../components/ui/icon";

export const metadata: Metadata = {
  title: "Request a HisabERP demo",
  description: "Request a guided HisabERP demonstration for your business or institution.",
};

export default async function RequestDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const submitted = params.submitted === "1";

  return (
    <main className="demo-page">
      <header className="demo-page-header">
        <Link href="/" className="demo-page-brand" aria-label="Return to HisabERP home">
          <span aria-hidden="true">H</span>
          <span><strong>HisabTech</strong><small>HisabERP</small></span>
        </Link>
        <div><Link href="/auth/login">Sign in</Link><Link className="demo-header-start" href="/auth/email-sign-up">Get started</Link></div>
      </header>

      <section className="demo-page-layout">
        <div className="demo-page-intro">
          <span className="demo-page-kicker">Guided product demonstration</span>
          <h1>See how HisabERP fits your business.</h1>
          <p>Tell us about your operation and our team will prepare a focused demonstration covering the workflows that matter most to you.</p>

          <div className="demo-page-points">
            <article><span><Icon name="workflow" size={19}/></span><div><h2>Built around your workflow</h2><p>We will focus on your finance, sales, inventory, purchasing, payroll or payment-reconciliation needs.</p></div></article>
            <article><span><Icon name="users" size={19}/></span><div><h2>For businesses and institutions</h2><p>Suitable for SMEs, multi-branch companies, cooperatives, government programs and implementation partners.</p></div></article>
            <article><span><Icon name="shield-check" size={19}/></span><div><h2>Clear technical answers</h2><p>Discuss security, onboarding, integrations, localization, deployment and adoption requirements.</p></div></article>
          </div>

          <div className="demo-page-contact">
            <span>Prefer direct contact?</span>
            <a href="tel:+251924093037">0924093037</a>
            <a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a>
          </div>
        </div>

        <section className="demo-form-card" aria-labelledby="demo-form-title">
          {submitted ? (
            <div className="demo-success" role="status">
              <span aria-hidden="true">✓</span>
              <p className="demo-page-kicker">Request received</p>
              <h2 id="demo-form-title">Thank you. We will contact you shortly.</h2>
              <p>Your request has been securely recorded. The HisabTech team will use your preferred contact method to arrange the demonstration.</p>
              <div><Link className="demo-primary-button" href="/">Return to the website</Link><Link href="/auth/email-sign-up">Create an account instead</Link></div>
            </div>
          ) : (
            <>
              <div className="demo-form-heading">
                <p className="demo-page-kicker">Request your demo</p>
                <h2 id="demo-form-title">Tell us about your business</h2>
                <p>Fields marked with * are required.</p>
              </div>

              {params.error && <div className="demo-form-alert" role="alert">{params.error}</div>}

              <form action={submitDemoRequest} className="demo-form">
                <label className="demo-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label>
                <div className="demo-field-grid">
                  <label><span>Full name *</span><input name="full_name" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder="Your full name"/></label>
                  <label><span>Business or organization *</span><input name="business_name" type="text" autoComplete="organization" minLength={2} maxLength={160} required placeholder="Business name"/></label>
                </div>
                <div className="demo-field-grid">
                  <label><span>Business email *</span><input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@company.com"/></label>
                  <label><span>Telephone number *</span><input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} required placeholder="+251 9..."/></label>
                </div>
                <div className="demo-field-grid">
                  <label><span>Business type *</span><select name="business_type" required defaultValue=""><option value="" disabled>Select business type</option><option>Retail and distribution</option><option>Professional services</option><option>Manufacturing</option><option>Hospitality and restaurant</option><option>Construction and projects</option><option>Cooperative or association</option><option>Government or NGO program</option><option>Other</option></select></label>
                  <label><span>Team size *</span><select name="team_size" required defaultValue=""><option value="" disabled>Select team size</option><option value="1-5">1–5 people</option><option value="6-20">6–20 people</option><option value="21-50">21–50 people</option><option value="51-200">51–200 people</option><option value="200+">More than 200</option></select></label>
                </div>
                <fieldset className="demo-contact-method"><legend>Preferred contact method *</legend><label><input type="radio" name="preferred_contact" value="phone" defaultChecked/> Phone</label><label><input type="radio" name="preferred_contact" value="email"/> Email</label></fieldset>
                <label><span>What should the demonstration cover?</span><textarea name="message" maxLength={2000} rows={5} placeholder="Tell us about your current process, challenges, required modules or integration needs."/></label>
                <label className="demo-consent"><input type="checkbox" required/><span>I agree that Hisab Technologies may contact me about this demo request.</span></label>
                <button className="demo-primary-button" type="submit">Submit demo request <span aria-hidden="true">→</span></button>
                <small className="demo-form-note"><Icon name="shield-check" size={14}/> Your submission is stored securely and is not publicly accessible.</small>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
