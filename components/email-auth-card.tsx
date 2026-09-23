import Link from "next/link";
import type { ReactNode } from "react";
import { CookieConsent } from "./cookie-consent";

type EmailAuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
  badge?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
};

export function EmailAuthCard({
  title,
  description,
  children,
  footer,
  eyebrow = "Biloo secure access",
  badge = "Protected business workspace",
  showcaseTitle = "Everything your business needs. One clear view.",
  showcaseDescription = "Biloo brings sales, finance, inventory and reporting together in one workspace built for growing businesses in Ethiopia.",
}: EmailAuthCardProps) {
  return (
    <main className="auth-page auth-premium-page auth-official-page auth-standard-page">
      <section className="auth-standard-shell">
        <aside className="auth-standard-showcase" aria-label="Biloo product introduction">
          <div className="auth-showcase-inner">
            <Link href="/" className="auth-standard-brand" aria-label="Biloo home">
              <img src="/hisab-logo.svg" alt="" width="42" height="42" className="hisab-logo" />
              <span><strong>Biloo</strong><small>Business operating system</small></span>
            </Link>

            <div className="auth-standard-showcase-copy">
              <span className="auth-standard-badge"><i aria-hidden="true" />{badge}</span>
              <h2>{showcaseTitle}</h2>
              <p>{showcaseDescription}</p>

              <div className="auth-product-proof" aria-label="Biloo platform capabilities">
                <div><strong>Sales</strong><span>Invoices & collections</span></div>
                <div><strong>Finance</strong><span>Cash & accounting</span></div>
                <div><strong>Inventory</strong><span>Stock & purchasing</span></div>
              </div>

              <ul className="auth-standard-benefits">
                <li><span aria-hidden="true">✓</span><div><strong>One connected workspace</strong><small>Keep your day-to-day operations in one place.</small></div></li>
                <li><span aria-hidden="true">✓</span><div><strong>Built for Ethiopian business</strong><small>Practical workflows for local teams and growing companies.</small></div></li>
                <li><span aria-hidden="true">✓</span><div><strong>Secure access</strong><small>Protected identity, sessions and account recovery.</small></div></li>
              </ul>
            </div>
          </div>

          <p className="auth-standard-trust"><span aria-hidden="true">●</span> Secure connection · Your account is protected</p>
        </aside>

        <section className="auth-standard-form-side">
          <div className="auth-standard-mobile-topbar">
            <Link href="/" className="auth-standard-brand" aria-label="Biloo home">
              <img src="/hisab-logo.svg" alt="" width="36" height="36" className="hisab-logo" />
              <strong>Biloo</strong>
            </Link>
            <Link href="/" className="auth-standard-home-link">Back to website</Link>
          </div>

          <div className="auth-standard-card">
            <header className="auth-standard-heading">
              <p className="auth-standard-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>
            {children}
            {footer ? <div className="auth-standard-switch">{footer}</div> : null}
            <p className="auth-form-security">By creating an account, you agree to use Biloo responsibly and keep your login details secure.</p>
          </div>
        </section>
      </section>
      <CookieConsent />
    </main>
  );
}

export function AuthNotice({ type, children }: { type: "error" | "success" | "warning"; children?: ReactNode }) {
  return children ? <div className={`form-alert ${type}`} role={type === "error" ? "alert" : "status"}>{children}</div> : null;
}
