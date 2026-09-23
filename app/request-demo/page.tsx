import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "../../components/marketing-site-chrome";
import { submitDemoRequest } from "../../lib/actions/demo-request";

export const metadata: Metadata = {
  title: "Book a Biloo ERP walkthrough",
  description: "Book a personalized Biloo ERP walkthrough for your business.",
};

export default async function RequestDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; delivered?: string; error?: string; source?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const submitted = params.submitted === "1";
  const context = [params.source, params.topic].filter(Boolean).join(" · ");

  return (
    <main className="marketing-site marketing-site-v2 marketing-editorial-v1 demo-request-page">
      <MarketingHeader />
      <section className="demo-booking-hero" id="public-main-content">
        <div className="demo-booking-intro">
          <div className="demo-booking-kicker"><span aria-hidden="true">●</span> Biloo ERP · Personalized walkthrough</div>
          <h1>See Biloo in action.</h1>
          <p>Tell us what your business needs and we’ll tailor a focused walkthrough around the workflows that matter most—sales, finance, inventory and reporting.</p>
          <div className="demo-booking-proof">
            <span><b>01</b> Understand your workflow</span>
            <span><b>02</b> See the right modules</span>
            <span><b>03</b> Plan your next step</span>
          </div>
        </div>

        {submitted ? (
          <section className="demo-booking-card demo-booking-success" role="status" aria-labelledby="demo-success-title">
            <div className="demo-success-icon" aria-hidden="true">✓</div>
            <p className="demo-form-kicker">Request received</p>
            <h2 id="demo-success-title">You’re on the list.</h2>
            <p>Thanks for reaching out. Your request has been delivered to our team. We’ll contact you using your preferred method to arrange your walkthrough.</p>
            <div className="demo-success-actions">
              <Link className="demo-request-primary-link" href="/">Back to Biloo</Link>
              <Link href="/auth/email-sign-up">Create an account</Link>
            </div>
          </section>
        ) : (
          <form className="demo-booking-card demo-request-form" action={submitDemoRequest}>
            <div className="demo-form-heading">
              <p className="demo-form-kicker">Book your walkthrough</p>
              <h2>Let’s talk about your business.</h2>
              <p>It takes about 2 minutes. Required fields are marked <span>*</span>.</p>
              {context ? <small className="demo-request-context">From: {context}</small> : null}
            </div>

            {params.error ? <div className="demo-request-alert" role="alert">{params.error}</div> : null}

            <label className="demo-request-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label>
            <input type="hidden" name="request_context" value={context}/>

            <div className="demo-form-section-label">Your details</div>
            <div className="demo-form-row">
              <label>Full name *<input name="full_name" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder="e.g. Mahir Aman"/></label>
              <label>Company or organization *<input name="business_name" type="text" autoComplete="organization" minLength={2} maxLength={160} required placeholder="Your company"/></label>
            </div>
            <div className="demo-form-row">
              <label>Business email *<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@company.com"/></label>
              <label>Phone number *<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} required placeholder="+251 9xx xxx xxx"/></label>
            </div>

            <div className="demo-form-section-label">Your business</div>
            <div className="demo-form-row">
              <label>Business type *<select name="business_type" defaultValue="" required><option value="" disabled>Select business type</option><option>Retail and distribution</option><option>Professional services</option><option>Manufacturing</option><option>Hospitality and restaurant</option><option>Construction and projects</option><option>Cooperative or association</option><option>Government or NGO program</option><option>Other</option></select></label>
              <label>Team size *<select name="team_size" defaultValue="" required><option value="" disabled>Select team size</option><option value="1-5">1–5 people</option><option value="6-20">6–20 people</option><option value="21-50">21–50 people</option><option value="51-200">51–200 people</option><option value="200+">More than 200</option></select></label>
            </div>

            <fieldset className="demo-contact-method">
              <legend>How should we contact you? *</legend>
              <label><input type="radio" name="preferred_contact" value="phone" defaultChecked/> Phone</label>
              <label><input type="radio" name="preferred_contact" value="email"/> Email</label>
            </fieldset>

            <label className="demo-message-field">What would you like to see?
              <textarea name="message" rows={4} maxLength={2000} defaultValue={context ? `I am interested in: ${context}. ` : undefined} placeholder="Tell us what you want Biloo to help you manage."/>
            </label>

            <label className="demo-request-consent"><input type="checkbox" required/><span>I agree that Hisab Technologies may contact me about this walkthrough.</span></label>
            <button className="demo-booking-submit" type="submit"><span>Book my walkthrough</span><b aria-hidden="true">→</b></button>
            <small className="demo-form-note">Your details are sent securely to the Biloo team and are never shown publicly.</small>
          </form>
        )}
      </section>
      <MarketingFooter />
    </main>
  );
}
