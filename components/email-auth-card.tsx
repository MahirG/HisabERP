import Link from "next/link";
import type { ReactNode } from "react";

export function EmailAuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="auth-page auth-premium-page auth-official-page auth-official-email-card">
      <section className="auth-shell auth-official-shell">
        <aside className="auth-showcase auth-official-showcase">
          <Link href="/" className="auth-showcase-brand auth-official-brand"><img src="/hisab-logo.svg" alt="" width="40" height="40" className="hisab-logo"/><strong>HisabTech</strong></Link>
          <div className="auth-showcase-content">
            <span className="auth-badge auth-official-badge"><i/> Secure business identity</span>
            <h2>One trusted account for every company you manage.</h2>
            <p>Use verified access, protected sessions and clear recovery flows across your HisabTech workspace.</p>
            <div className="auth-benefits auth-official-benefits">
              <div><span className="benefit-icon" aria-hidden="true">✓</span><strong>Verified access</strong><small>Email confirmation and secure account recovery.</small></div>
              <div><span className="benefit-icon" aria-hidden="true">◫</span><strong>Controlled workspace</strong><small>Role-aware access to organization records.</small></div>
            </div>
          </div>
          <div className="auth-showcase-footer"><span>●</span>HisabTech identity and access</div>
        </aside>
        <section className="auth-card auth-form-panel auth-official-form-panel">
          <div className="auth-official-form-wrap">
            <div className="auth-top"><Link href="/" className="auth-brand auth-mobile-brand"><img src="/hisab-logo.svg" alt="" width="36" height="36" className="hisab-logo"/><strong>HisabTech</strong></Link></div>
            <div className="auth-heading auth-official-heading"><p className="eyebrow">HisabTech</p><h1>{title}</h1><p>{description}</p></div>
            {children}
            {footer ? <div className="auth-switch auth-account-switch">{footer}</div> : null}
          </div>
        </section>
      </section>
    </main>
  );
}

export function AuthNotice({ type, children }: { type: "error" | "success" | "warning"; children?: ReactNode }) {
  return children ? <div className={`form-alert ${type}`} role={type === "error" ? "alert" : "status"}>{children}</div> : null;
}
