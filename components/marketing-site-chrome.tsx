import Link from "next/link";
import type { ReactNode } from "react";

export function MarketingHeader() {
  return (
    <header className="marketing-nav marketing-nav-v2">
      <Link href="/" className="marketing-brand" aria-label="HisabTech home">
        <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
        <span className="marketing-brand-copy"><strong>HisabTech</strong><small>Business operating system</small></span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/product-tour">Product tour</Link>
        <Link href="/industries">Industries</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/migration">Migration</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/help-center">Help</Link>
      </nav>
      <div className="marketing-nav-actions">
        <Link href="/auth/login" className="marketing-signin">Sign in</Link>
        <Link href="/request-demo" className="marketing-demo">Request a demo</Link>
        <Link href="/auth/email-sign-up" className="marketing-start">Start free</Link>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div>
          <Link href="/" className="marketing-brand marketing-footer-brand">
            <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
            <span className="marketing-brand-copy"><strong>HisabTech</strong><small>HisabERP</small></span>
          </Link>
          <p>One secure, multilingual business workspace for Ethiopian companies that want clearer operations and better decisions.</p>
          <a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a>
          <a href="tel:+251924093037">+251 924 093 037</a>
        </div>
        <div>
          <strong>Product and market</strong>
          <Link href="/product-tour">Interactive product tour</Link>
          <Link href="/#modules">Product modules</Link>
          <Link href="/ethiopia">ERP built for Ethiopia</Link>
          <Link href="/industries">Industry solutions</Link>
          <Link href="/pricing">Pricing in ETB</Link>
        </div>
        <div>
          <strong>Implementation and support</strong>
          <Link href="/migration">Data migration and onboarding</Link>
          <Link href="/compare">ERP comparisons</Link>
          <Link href="/help-center">Help Center</Link>
          <Link href="/customer-stories">Customer proof</Link>
          <Link href="/request-demo">Request a demo</Link>
        </div>
        <div>
          <strong>Trust and account</strong>
          <Link href="/trust">Trust Center</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/email-sign-up">Create account</Link>
          <a href="mailto:mahir@hisabtech.com?subject=HisabERP%20security%20question">Security contact</a>
        </div>
      </div>
      <div className="marketing-footer-bottom">
        <span>© {new Date().getFullYear()} Hisab Technologies. All rights reserved.</span>
        <span>Addis Ababa, Ethiopia</span>
      </div>
    </footer>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <main className="marketing-site marketing-site-v2"><MarketingHeader />{children}<MarketingFooter /></main>;
}
