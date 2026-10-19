import Link from "next/link";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { Icon } from "../../components/ui/icon";
import { signOut } from "../../lib/actions/auth";
import { getCurrentUserContext } from "../../lib/data/context";
import { createClient } from "../../lib/supabase/server";
import { safeNextPath } from "../../lib/validation";

export const metadata = { title: "Account & security" };
export const dynamic = "force-dynamic";

type AccountSearchParams = {
  setup?: string;
  verify?: string;
  next?: string;
};

function initials(name: string) {
  const value = name.trim();
  if (!value) return "U";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function providerLabel(provider: string | null) {
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  if (provider === "phone") return "Mobile number";
  if (provider === "email") return "Email and password";
  return "Supabase identity";
}

function providerDescription(provider: string | null) {
  if (provider === "google") return "Your Google account is connected as a sign-in method for this workspace.";
  if (provider === "apple") return "Your Apple account is connected as a sign-in method for this workspace.";
  if (provider === "phone") return "Your mobile number is connected as a sign-in method for this workspace.";
  if (provider === "email") return "Your email identity is managed through Supabase Auth. Use account recovery to create or reset your password.";
  return "Your identity is securely managed through Supabase Auth.";
}

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<AccountSearchParams> }) {
  const [user, query] = await Promise.all([getCurrentUserContext({ required: true }), searchParams]);
  if (!user) return null;

  const supabase = await createClient();
  const factorResult = await supabase.auth.mfa.listFactors();
  const factorStatusKnown = !factorResult.error;
  const allFactors = factorStatusKnown ? [
    ...(factorResult.data?.totp || []),
    ...(factorResult.data?.phone || []),
  ] : [];
  const verifiedFactorCount = allFactors.filter((factor) => factor.status === "verified").length;
  const hasAuthenticator = verifiedFactorCount > 0;
  const strongSession = user.aal === "aal2";
  const continueHref = safeNextPath(query.next || "/workspace-home");
  const setupMode = query.setup === "mfa";
  const verificationMode = query.verify === "mfa";
  const authenticatorStatus = !factorStatusKnown ? "Unavailable" : hasAuthenticator ? "Enrolled" : "Not enrolled";
  const sessionStatus = strongSession ? "AAL2 verified" : "AAL1 standard";
  const resetQuery = new URLSearchParams({ next: "/account" });
  if (user.email) resetQuery.set("email", user.email);
  const resetHref = `/auth/forgot-password?${resetQuery.toString()}`;

  if (verificationMode) {
    return (
      <main className="acct2-page acct2-verification-page">
        <nav className="acct2-breadcrumb" aria-label="Breadcrumb">
          <Link href={continueHref}><Icon name="chevron-right" size={13} style={{ transform: "rotate(180deg)" }} /> Return to workspace</Link>
          <span aria-current="page">Administrator verification</span>
        </nav>

        <header className="acct2-heading">
          <div>
            <span className="acct2-eyebrow"><Icon name="shield-check" size={15} /> Existing member authentication</span>
            <h1>{strongSession ? "Administrator access confirmed" : hasAuthenticator ? "Confirm administrator access" : "Secure administrator access"}</h1>
            <p>
              {strongSession
                ? "This browser already has the strong authentication required for protected workspace operations."
                : !factorStatusKnown
                  ? "Authenticator status could not be retrieved. Retry the status check below before continuing."
                  : hasAuthenticator
                  ? "Enter the current code from your authenticator app. No company registration or setup form is required for your existing membership."
                  : "This is an existing workspace membership. Complete authenticator setup for privileged access; no new company registration is required."}
            </p>
          </div>
          <div className="acct2-heading-actions">
            <Link href={continueHref} className="acct2-button"><Icon name="arrow-right" size={15} style={{ transform: "rotate(180deg)" }} /> Cancel</Link>
          </div>
        </header>

        <section className="acct2-security-strip" aria-label="Authentication requirement">
          <div className="acct2-security-summary">
            <span className="acct2-security-icon"><Icon name={strongSession ? "check-circle" : "lock"} size={21} /></span>
            <div>
              <small>{user.organizationName}</small>
              <strong>{strongSession ? "AAL2 session active" : !factorStatusKnown ? "Authenticator status unavailable" : hasAuthenticator ? "Authenticator confirmation required" : "Authenticator enrollment required"}</strong>
              <p>{roleLabel(user.role)} · {providerLabel(user.provider)} sign-in · {user.aal.toUpperCase()} assurance</p>
            </div>
          </div>
        </section>

        <div className="acct2-auth" id="authenticator">
          <MfaSecurityPanel
            organizationId={user.organizationId}
            required={user.mfaRequired}
            initialAal={user.aal}
            continueHref={continueHref}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="acct2-page">
      <nav className="acct2-breadcrumb" aria-label="Breadcrumb">
        <Link href="/workspace-home"><Icon name="home" size={14} /> Workspace</Link>
        <Icon name="chevron-right" size={13} aria-hidden="true" />
        <span aria-current="page">Account & security</span>
      </nav>

      {setupMode ? (
        <section className="acct2-setup" aria-labelledby="secure-account-heading">
          <span className="acct2-setup-icon"><Icon name="shield-check" size={21} /></span>
          <div>
            <small>ADMINISTRATOR SECURITY</small>
            <strong id="secure-account-heading">{!factorStatusKnown ? "Check authenticator status" : hasAuthenticator ? "Confirm your authenticator" : "Finish authenticator setup"}</strong>
            <p>{!factorStatusKnown ? "Authenticator status is unavailable. Use the authenticator panel below to retry." : hasAuthenticator ? "Enter a current code to confirm this browser session, then continue to your workspace." : "Connect Google Authenticator or another TOTP app, verify one code, then continue to your workspace."}</p>
          </div>
          <a href="#authenticator">{!factorStatusKnown ? "Check status" : hasAuthenticator ? "Verify now" : "Set up now"} <Icon name="arrow-right" size={15} /></a>
        </section>
      ) : null}

      <header className="acct2-heading">
        <div>
          <span className="acct2-eyebrow"><Icon name="shield-check" size={15} /> Identity & access</span>
          <h1>Account & security</h1>
          <p>Manage your workspace identity, sign-in method, authenticator, and current browser session.</p>
        </div>
        <div className="acct2-heading-actions">
          {user.mfaRequired ? <Link href="/security" className="acct2-button"><Icon name="lock" size={15} /> Security controls</Link> : null}
          <Link href="/workspace-home" className="acct2-button is-primary"><Icon name="grid" size={15} /> Back to workspace</Link>
        </div>
      </header>

      {!factorStatusKnown ? <p className="acct2-service-notice" role="alert"><Icon name="alert-triangle" size={16} /> Authenticator status could not be loaded. Refresh this page to retry; the verification panel below checks again.</p> : null}
      <section className="acct2-security-strip" aria-label="Account security status">
        <div className="acct2-security-summary">
          <span className="acct2-security-icon"><Icon name="shield-check" size={21} /></span>
          <div>
            <small>Security status</small>
            <strong>{strongSession ? "Strong session active" : !factorStatusKnown ? "Authenticator status unavailable" : hasAuthenticator ? "Session verification required" : user.mfaRequired ? "Authenticator setup required" : "Authenticator setup recommended"}</strong>
            <p>{!factorStatusKnown ? "Authenticator data unavailable" : hasAuthenticator ? `${verifiedFactorCount} verified factor${verifiedFactorCount === 1 ? "" : "s"}` : "No verified authenticator"} · {user.aal.toUpperCase()} assurance</p>
          </div>
        </div>
        <dl className="acct2-security-facts" aria-label="Account security checks">
          <div><dt>Authenticator</dt><dd>{authenticatorStatus}</dd></div>
          <div><dt>This session</dt><dd>{sessionStatus}</dd></div>
        </dl>
      </section>

      <section className="acct2-grid">
        <div className="acct2-main">
          <article className="acct2-card" id="profile">
            <header className="acct2-card-head">
              <div className="acct2-profile">
                <span className="acct2-avatar">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}
                </span>
                <div className="acct2-profile-copy">
                  <h2>{user.fullName}</h2>
                  <p>{user.email || "Biloo account"}</p>
                </div>
              </div>
              <span className="acct2-active"><i aria-hidden="true" /> Active</span>
            </header>
            <div className="acct2-card-body">
              <dl className="acct2-details">
                <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>
                <div><dt>Workspace role</dt><dd><span className="acct2-chip">{roleLabel(user.role)}</span></dd></div>
                <div><dt>Primary sign-in</dt><dd>{providerLabel(user.provider)}</dd></div>
                <div><dt>Current assurance</dt><dd><span className={`acct2-chip ${strongSession ? "is-strong" : ""}`}>{user.aal.toUpperCase()}</span></dd></div>
                <div className="is-wide"><dt>Account ID</dt><dd><code>{user.userId}</code></dd></div>
              </dl>
            </div>
          </article>

          <article className="acct2-card" id="sign-in">
            <div className="acct2-provider">
              <span className="acct2-provider-icon"><Icon name="link" size={19} /></span>
              <div>
                <small>CONNECTED SIGN-IN</small>
                <h2>{providerLabel(user.provider)}</h2>
                <p>{providerDescription(user.provider)}</p>
              </div>
              <div className="acct2-provider-links">
                {user.email ? <Link href={resetHref}>Create or reset password</Link> : null}
                <Link href="/help-center">Account help</Link>
              </div>
            </div>
          </article>

          <div className="acct2-auth" id="authenticator">
            <MfaSecurityPanel
              organizationId={user.organizationId}
              required={user.mfaRequired}
              initialAal={user.aal}
              continueHref={setupMode ? continueHref : undefined}
            />
          </div>
        </div>

        <aside className="acct2-side">
          <section className="acct2-card">
            <header className="acct2-card-head">
              <div><small>ACCESS STATUS</small><h2>Current protection</h2></div>
              <Icon name="shield-check" size={18} />
            </header>
            <div className="acct2-card-body acct2-status-list">
              <article className="acct2-status-item">
                <span><Icon name="check-circle" size={16} /></span>
                <div><strong>Signed-in identity</strong><small>{user.email || providerLabel(user.provider)}</small></div>
              </article>
              <article className={`acct2-status-item ${hasAuthenticator ? "" : "is-pending"}`}>
                <span><Icon name={hasAuthenticator ? "check-circle" : "smartphone"} size={16} /></span>
                <div><strong>{!factorStatusKnown ? "Authenticator status unavailable" : hasAuthenticator ? "Authenticator enrolled" : "Authenticator not enrolled"}</strong><small>{!factorStatusKnown ? "Reload to confirm factor status." : hasAuthenticator ? `${verifiedFactorCount} verified factor${verifiedFactorCount === 1 ? "" : "s"}` : "Add an authenticator to protect privileged actions."}</small></div>
              </article>
              <article className={`acct2-status-item ${strongSession ? "" : "is-pending"}`}>
                <span><Icon name={strongSession ? "check-circle" : "lock"} size={16} /></span>
                <div><strong>{strongSession ? "Strong session active" : "Standard session"}</strong><small>{strongSession ? "AAL2 verified for this session." : "AAL2 verification may be required for privileged actions."}</small></div>
              </article>
            </div>
          </section>

          <section className="acct2-card" id="session">
            <header className="acct2-card-head">
              <div><small>CURRENT SESSION</small><h2>This browser</h2></div>
              <Icon name="activity" size={18} />
            </header>
            <div className="acct2-card-body">
              <div className="acct2-session-grid">
                <div><small>Assurance</small><strong>{user.aal.toUpperCase()}</strong></div>
                <div><small>Role policy</small><strong>{user.mfaRequired ? "MFA required" : "MFA optional"}</strong></div>
                <div><small>Provider</small><strong>{providerLabel(user.provider)}</strong></div>
                <div><small>Status</small><strong>{strongSession ? "Privileged" : "Standard"}</strong></div>
              </div>
              <p className="acct2-note"><Icon name="lightbulb" size={15} /> AAL2 applies to this browser session and may be requested again later.</p>
            </div>
          </section>

          <section className="acct2-card">
            <header className="acct2-card-head">
              <div><small>RECOVERY</small><h2>Avoid account lockout</h2></div>
              <Icon name="smartphone" size={18} />
            </header>
            <ul className="acct2-recovery">
              <li>Keep your business email or identity provider recoverable.</li>
              <li>Add a backup authenticator before replacing your current device.</li>
              <li>Contact an organization owner if you lose access to every factor.</li>
            </ul>
          </section>

          <section className="acct2-card acct2-signout">
            <p>End this session when using a shared or public device.</p>
            <form action={signOut}>
              <button type="submit"><Icon name="log-out" size={16} /> Log out securely</button>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}