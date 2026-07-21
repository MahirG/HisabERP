import Link from "next/link";

export const metadata = { title: "Request a demo" };

export default function RequestDemoPage() {
  return (
    <main className="demo-request-page">
      <header className="demo-request-header">
        <Link href="/" className="marketing-brand"><span>H</span><strong>HisabTech</strong></Link>
        <Link href="/auth/login">Already a customer? Sign in</Link>
      </header>
      <section className="demo-request-shell">
        <div className="demo-request-copy">
          <span>Personalized HisabERP demonstration</span>
          <h1>See how HisabERP can run your business.</h1>
          <p>Tell us about your organization and the workflows you want to improve. Our team will prepare a focused demonstration covering the modules, integrations, and reporting that matter to you.</p>
          <ul><li>Business-specific product walkthrough</li><li>Sales, finance, inventory, and reporting demonstration</li><li>telebirr and integration-readiness discussion</li><li>Implementation and onboarding guidance</li></ul>
          <div><strong>Prefer direct contact?</strong><a href="tel:+251924093037">+251 924 093 037</a><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a></div>
        </div>
        <form className="demo-request-form" action="mailto:mahir@hisabtech.com" method="post" encType="text/plain">
          <div><span>Request your demo</span><h2>Tell us about your business</h2><p>Complete the details below. Your email application will open with the request ready to send.</p></div>
          <label>Full name<input name="Full name" type="text" required placeholder="Your full name"/></label>
          <label>Business email<input name="Business email" type="email" required placeholder="name@company.com"/></label>
          <label>Phone number<input name="Phone" type="tel" required placeholder="09..."/></label>
          <label>Company or organization<input name="Organization" type="text" required placeholder="Business name"/></label>
          <div className="demo-form-row"><label>Team size<select name="Team size" defaultValue=""><option value="" disabled>Select size</option><option>1–5</option><option>6–20</option><option>21–50</option><option>51–200</option><option>200+</option></select></label><label>Industry<select name="Industry" defaultValue=""><option value="" disabled>Select industry</option><option>Retail</option><option>Wholesale</option><option>Services</option><option>Hospitality</option><option>Manufacturing</option><option>Government / NGO</option><option>Other</option></select></label></div>
          <label>What would you like to improve?<textarea name="Goals" rows={4} placeholder="Tell us about your current process, challenges, and required integrations."/></label>
          <button type="submit">Request my HisabERP demo</button>
          <small>By submitting, you agree to be contacted by Hisab Technologies about this request.</small>
        </form>
      </section>
    </main>
  );
}
