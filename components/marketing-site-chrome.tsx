import Link from "next/link";
import type { ReactNode } from "react";
import { marketingIndustries } from "../lib/marketing-industries";
import { marketingModules } from "../lib/marketing-modules";

export function MarketingHeader() {
  return (
    <header className="marketing-nav marketing-nav-v2">
      <Link href="/" className="marketing-brand" aria-label="HisabTech home">
        <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
        <span className="marketing-brand-copy"><strong>HisabTech</strong><small>Business operating system</small></span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/product-tour">Product tour</Link>
        <Link href="/#modules">Modules</Link>
        <Link href="/ethiopia">For Ethiopia</Link>
        <Link href="/industries">Industries</Link>
        <Link href="/pricing">Pricing</Link>
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
          <strong>Explore</strong>
          <Link href="/product-tour">Interactive product tour</Link>
          <Link href="/ethiopia">ERP built for Ethiopia</Link>
          <Link href="/industries">Industry solutions</Link>
          <Link href="/pricing">Pricing in ETB</Link>
          <Link href="/request-demo">Request a demo</Link>
        </div>
        <div>
          <strong>Popular modules</strong>
          {marketingModules.slice(0, 4).map((module) => <Link href={`/product/${module.slug}`} key={module.slug}>{module.shortTitle}</Link>)}
          <strong className="marketing-footer-subheading">Popular industries</strong>
          {marketingIndustries.slice(0, 3).map((industry) => <Link href={`/industries/${industry.slug}`} key={industry.slug}>{industry.shortTitle}</Link>)}
        </div>
        <div>
          <strong>Account</strong>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/email-sign-up">Create account</Link>
          <Link href="/auth/forgot-password">Reset password</Link>
          <a href="mailto:mahir@hisabtech.com">Contact HisabTech</a>
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
