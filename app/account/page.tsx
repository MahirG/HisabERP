import Link from "next/link";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { signOut } from "../../lib/actions/auth";
import { getCurrentUserContext } from "../../lib/data/context";

export const metadata = { title: "Account & security" };
export const dynamic = "force-dynamic";

function initials(name: string) {
  const value = name.trim();
  if (!value) return "U";
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function providerLabel(provider: string | null) {
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  if (provider === "phone") return "Mobile number";
  if (provider === "email") return "Email and password";
  return "Supabase identity";
}

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function AccountPage() {
  const user = await getCurrentUserContext({ required: true });
  if (!user) return null;

  const strongSession = user.aal === "aal2";

  return (
    <main className="security-account-page security-account-modern">
      <nav className="security-account-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Account security</span>
      </nav>

      <header className="security-account-hero security-account-hero-modern">
        <div className="security-account-heading">
          <p className="eyebrow">IDENTITY &amp; ACCESS</p>
          <h1>Account security</h1>
          <p>Review your signed-in identity, strengthen administrator access, and confirm the assurance level protecting this workspace.</p>
        </div>
        <div className="security-account-actions">
          <Link className="security-secondary-action" href="/security">Production controls</Link>
          <form action={signOut}><button className="security-logout-action" type="submit">Log out securely</button></form>
        </div>
      </header>

      <section className="security-status-strip" aria-label="Current account security status">
        <article className="security-status-card is-ready">
          <span className="security-status-indicator" aria-hidden="true" />
          <div><small>Identity</small><strong>Signed in</strong><p>{user.email || "Verified HisabTech account"}</p></div>
        </article>
        <article className={`security-status-card ${strongSession ? "is-ready" : "is-attention"}`}>
          <span className="security-status-indicator" aria-hidden="true" />
          <div><small>Session assurance</small><strong>{strongSession ? "Strong session" : "Standard session"}</strong><p>{strongSession ? "AAL2 verification is active" : "Verify MFA before privileged changes"}</p></div>
        </article>
        <article className={`security-status-card ${user.mfaRequired ? "is-attention" : "is-neutral"}`}>
          <span className="security-status-indicator" aria-hidden="true" />
          <div><small>MFA policy</small><strong>{user.mfaRequired ? "Required" : "Available"}</strong><p>{user.mfaRequired ? "Required for owner and admin changes" : "Recommended for stronger protection"}</p></div>
        </article>
      </section>

      <section className="security-account-grid security-account-layout">
        <article className="security-identity-card security-profile-card">
          <header className="security-profile-header">
            <span className="security-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}</span>
            <div className="security-profile-copy">
              <small>Signed in as</small>
              <h2>{user.fullName}</h2>
              <p>{user.email || "Verified HisabTech account"}</p>
            </div>
            <span className="security-active-badge"><i aria-hidden="true" /> Active</span>
          </header>

          <section className="security-card-section" aria-labelledby="account-details-heading">
            <div className="security-section-heading">
              <div><p className="eyebrow">ACCOUNT DETAILS</p><h3 id="account-details-heading">Identity information</h3></div>
              <span>Read only</span>
            </div>
            <dl className="security-details-list">
              <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>
              <div><dt>Workspace role</dt><dd>{roleLabel(user.role)}</dd></div>
              <div><dt>Sign-in provider</dt><dd>{providerLabel(user.provider)}</dd></div>
              <div><dt>Assurance level</dt><dd>{user.aal.toUpperCase()}</dd></div>
              <div className="security-detail-wide"><dt>Account ID</dt><dd><code>{user.userId}</code></dd></div>
            </dl>
          </section>

          <section className="security-session-summary" aria-label="Current session protection">
            <span className={`security-session-icon ${strongSession ? "is-strong" : ""}`} aria-hidden="true">{strongSession ? "✓" : "!"}</span>
            <div><strong>{strongSession ? "Privileged session protected" : "Additional verification needed"}</strong><p>{strongSession ? "This session can complete administrator-protected actions." : "Normal workspace access is available. Verify your authenticator before a privileged change."}</p></div>
          </section>
        </article>

        <div className="security-mfa-column">
          <MfaSecurityPanel organizationId={user.organizationId} required={user.mfaRequired} initialAal={user.aal} />
          <aside className="security-privacy-note">
            <span aria-hidden="true">i</span>
            <div><strong>Your authenticator secret stays private</strong><p>HisabTech uses Supabase MFA verification. Authenticator codes are validated securely and are never stored in the browser as reusable credentials.</p></div>
          </aside>
        </div>
      </section>

      <section className="security-account-note security-policy-card" aria-labelledby="administrator-mfa-heading">
        <header>
          <div><p className="eyebrow">HOW PROTECTION WORKS</p><h2 id="administrator-mfa-heading">Administrator MFA, without blocking everyday work</h2></div>
          <span className="security-policy-badge">Database enforced</span>
        </header>
        <div className="security-policy-grid">
          <article><span>1</span><div><strong>Sign in normally</strong><p>Access the workspace with your approved identity provider and organization membership.</p></div></article>
          <article><span>2</span><div><strong>Verify when required</strong><p>Enter a current authenticator code before owner or administrator changes.</p></div></article>
          <article><span>3</span><div><strong>Complete privileged work</strong><p>The database confirms the strong session before accepting protected operations.</p></div></article>
        </div>
        <footer><strong>Why this matters</strong><p>Read access remains available during MFA setup, while sensitive configuration and financial controls remain protected from unverified sessions.</p></footer>
      </section>
    </main>
  );
}
