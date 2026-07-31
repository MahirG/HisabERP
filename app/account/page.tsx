import Link from "next/link";
import type { CSSProperties } from "react";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { Icon } from "../../components/ui/icon";
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

function providerDescription(provider: string | null) {
  if (provider === "google") return "Your Google identity is connected to this workspace.";
  if (provider === "apple") return "Your Apple identity is connected to this workspace.";
  if (provider === "phone") return "Your verified mobile number is used to access this workspace.";
  if (provider === "email") return "Your verified email and password are used to access this workspace.";
  return "Your identity is securely managed through Supabase Auth.";
}

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function AccountPage() {
  const user = await getCurrentUserContext({ required: true });
  if (!user) return null;

  const strongSession = user.aal === "aal2";
  const postureScore = strongSession ? 100 : 67;
  const postureStyle = { "--security-score": `${postureScore * 3.6}deg` } as CSSProperties;

  return (
    <main className="security-account-page security-account-modern">
      <nav className="security-account-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><Icon name="home" size={14} /> Dashboard</Link>
        <Icon name="chevron-right" size={13} aria-hidden="true" />
        <span aria-current="page">Account security</span>
      </nav>

      <header className="security-command-header">
        <div className="security-command-copy">
          <p className="security-page-kicker"><span><Icon name="shield-check" size={16} /></span> Security center</p>
          <h1>Protect your account and privileged actions.</h1>
          <p className="security-command-description">
            Review the identity connected to this workspace, strengthen administrator access with an authenticator, and confirm the assurance level protecting sensitive changes.
          </p>
          <div className="security-command-actions">
            <Link className="security-primary-action" href="/security"><Icon name="lock" size={17} /> Production controls</Link>
            <form action={signOut}>
              <button className="security-logout-action" type="submit"><Icon name="log-out" size={17} /> Log out securely</button>
            </form>
          </div>
        </div>

        <aside className={`security-posture-card ${strongSession ? "is-protected" : "needs-verification"}`} aria-label="Security posture">
          <div className="security-posture-ring" style={postureStyle}>
            <span><strong>{postureScore}</strong><small>/100</small></span>
          </div>
          <div className="security-posture-copy">
            <p>Security posture</p>
            <h2>{strongSession ? "Fully protected" : "Verification recommended"}</h2>
            <span><i aria-hidden="true" /> {strongSession ? "3 of 3 checks active" : "2 of 3 checks active"}</span>
          </div>
        </aside>
      </header>

      <section className="security-status-strip" aria-label="Current account security status">
        <article className="security-status-card is-ready">
          <span className="security-status-icon"><Icon name="check-circle" size={19} /></span>
          <div><small>Identity</small><strong>Verified and signed in</strong><p>{user.email || "Verified Biloo account"}</p></div>
        </article>
        <article className={`security-status-card ${strongSession ? "is-ready" : "is-attention"}`}>
          <span className="security-status-icon"><Icon name={strongSession ? "shield-check" : "alert-triangle"} size={19} /></span>
          <div><small>Session assurance</small><strong>{strongSession ? "AAL2 strong session" : "AAL1 standard session"}</strong><p>{strongSession ? "Privileged actions are available" : "Verify MFA before protected changes"}</p></div>
        </article>
        <article className={`security-status-card ${user.mfaRequired ? "is-attention" : "is-neutral"}`}>
          <span className="security-status-icon"><Icon name="smartphone" size={19} /></span>
          <div><small>MFA policy</small><strong>{user.mfaRequired ? "Required for your role" : "Available for stronger access"}</strong><p>{user.mfaRequired ? "Owner and administrator controls are protected" : "Authenticator enrollment is recommended"}</p></div>
        </article>
      </section>

      <section className="security-account-grid security-account-layout">
        <article className="security-identity-card security-profile-card">
          <header className="security-profile-header">
            <span className="security-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}</span>
            <div className="security-profile-copy">
              <small>Signed in account</small>
              <h2>{user.fullName}</h2>
              <p>{user.email || "Verified Biloo account"}</p>
            </div>
            <span className="security-active-badge"><i aria-hidden="true" /> Active now</span>
          </header>

          <section className="security-provider-summary" aria-label="Sign-in provider">
            <span><Icon name="user" size={20} /></span>
            <div><small>Connected identity</small><strong>{providerLabel(user.provider)}</strong><p>{providerDescription(user.provider)}</p></div>
          </section>

          <section className="security-card-section" aria-labelledby="account-details-heading">
            <div className="security-section-heading">
              <div><p className="eyebrow">ACCOUNT DETAILS</p><h3 id="account-details-heading">Identity information</h3></div>
              <span><Icon name="lock" size={12} /> Read only</span>
            </div>
            <dl className="security-details-list">
              <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>
              <div><dt>Workspace role</dt><dd>{roleLabel(user.role)}</dd></div>
              <div><dt>Sign-in provider</dt><dd>{providerLabel(user.provider)}</dd></div>
              <div><dt>Assurance level</dt><dd><span className={`security-assurance-value ${strongSession ? "is-strong" : ""}`}>{user.aal.toUpperCase()}</span></dd></div>
              <div className="security-detail-wide"><dt>Account ID</dt><dd><code>{user.userId}</code></dd></div>
            </dl>
          </section>

          <section className={`security-session-summary ${strongSession ? "is-strong" : "needs-verification"}`} aria-label="Current session protection">
            <span className="security-session-icon" aria-hidden="true"><Icon name={strongSession ? "shield-check" : "alert-triangle"} size={20} /></span>
            <div><strong>{strongSession ? "Privileged session protected" : "Additional verification needed"}</strong><p>{strongSession ? "This browser session can complete administrator-protected actions." : "Normal workspace access remains available. Verify your authenticator before a privileged change."}</p></div>
          </section>
        </article>

        <div className="security-mfa-column">
          <MfaSecurityPanel organizationId={user.organizationId} required={user.mfaRequired} initialAal={user.aal} />
          <aside className="security-privacy-note">
            <span aria-hidden="true"><Icon name="lock" size={18} /></span>
            <div><strong>Your authenticator secret stays private</strong><p>Biloo uses Supabase MFA verification. Authenticator codes are validated securely and are never stored in the browser as reusable credentials.</p></div>
          </aside>
        </div>
      </section>

      <section className="security-policy-card" aria-labelledby="administrator-mfa-heading">
        <header>
          <div><p className="eyebrow">PRIVILEGED ACCESS FLOW</p><h2 id="administrator-mfa-heading">Strong protection without interrupting everyday work</h2><p>Daily workspace access stays simple. Extra verification is requested only when an action requires administrator assurance.</p></div>
          <span className="security-policy-badge"><Icon name="shield-check" size={14} /> Database enforced</span>
        </header>
        <div className="security-policy-grid">
          <article><span><Icon name="user" size={18} /></span><div><small>Step 01</small><strong>Sign in normally</strong><p>Use your approved identity provider and active organization membership.</p></div></article>
          <article><span><Icon name="smartphone" size={18} /></span><div><small>Step 02</small><strong>Verify when required</strong><p>Enter a current authenticator code before owner or administrator changes.</p></div></article>
          <article><span><Icon name="check-circle" size={18} /></span><div><small>Step 03</small><strong>Complete protected work</strong><p>The database confirms the strong session before accepting the operation.</p></div></article>
        </div>
        <footer><span><Icon name="lightbulb" size={18} /></span><div><strong>Why this matters</strong><p>Read access remains available during MFA setup, while sensitive configuration and financial controls remain protected from unverified sessions.</p></div></footer>
      </section>
    </main>
  );
}
