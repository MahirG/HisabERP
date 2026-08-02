import Link from "next/link";
import type { CSSProperties } from "react";
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
  if (provider === "google") return "Your Google identity is connected and remains the primary sign-in method.";
  if (provider === "apple") return "Your Apple identity is connected and remains the primary sign-in method.";
  if (provider === "phone") return "Your verified mobile number is used to access this workspace.";
  if (provider === "email") return "Your verified business email and password are used to access this workspace.";
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
  const allFactors = [
    ...(factorResult.data?.totp || []),
    ...(factorResult.data?.phone || []),
  ];
  const verifiedFactors = allFactors.filter((factor) => factor.status === "verified");
  const verifiedFactorCount = verifiedFactors.length;
  const hasAuthenticator = verifiedFactorCount > 0;
  const strongSession = user.aal === "aal2";
  const continueHref = safeNextPath(query.next || "/");
  const setupMode = query.setup === "mfa";
  const postureScore = Math.min(100, 45 + (user.provider ? 15 : 0) + (hasAuthenticator ? 22 : 0) + (strongSession ? 18 : 0));
  const postureStyle = { "--account-score": `${postureScore * 3.6}deg` } as CSSProperties;
  const resetQuery = new URLSearchParams({ next: "/account" });
  if (user.email) resetQuery.set("email", user.email);
  const resetHref = `/auth/forgot-password?${resetQuery.toString()}`;

  return (
    <main className="biloo-account-center">
      <nav className="biloo-account-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><Icon name="home" size={14} /> Workspace</Link>
        <Icon name="chevron-right" size={13} aria-hidden="true" />
        <span aria-current="page">Account control center</span>
      </nav>

      {setupMode ? (
        <section className="biloo-account-setup-banner" aria-labelledby="secure-new-account-heading">
          <span className="biloo-account-setup-icon"><Icon name="shield-check" size={22} /></span>
          <div>
            <p>SECURE YOUR ADMINISTRATOR ACCOUNT</p>
            <h2 id="secure-new-account-heading">Complete authenticator setup before protected work.</h2>
            <span>Scan the QR code below with Google Authenticator or another TOTP app, verify one code, then continue to your workspace.</span>
          </div>
          <a href="#authenticator">Set up now <Icon name="arrow-right" size={15} /></a>
        </section>
      ) : null}

      <header className="biloo-account-hero">
        <div className="biloo-account-hero-copy">
          <p className="biloo-account-kicker"><span><Icon name="shield-check" size={15} /></span> Identity & access</p>
          <h1>Your account, access and security in one place.</h1>
          <p>Manage the identity connected to Biloo, protect administrator actions with an authenticator, and understand exactly what this browser session can do.</p>
          <div className="biloo-account-hero-actions">
            <Link href="/" className="biloo-account-primary-action"><Icon name="grid" size={16} /> Open workspace</Link>
            <Link href="/security" className="biloo-account-secondary-action"><Icon name="lock" size={16} /> Production controls</Link>
          </div>
          <div className="biloo-account-trust-row" aria-label="Account trust signals">
            <span><i className="is-positive" aria-hidden="true" /> Identity verified</span>
            <span><i className={hasAuthenticator ? "is-positive" : "is-warning"} aria-hidden="true" /> {hasAuthenticator ? `${verifiedFactorCount} authenticator${verifiedFactorCount === 1 ? "" : "s"}` : "Authenticator not enrolled"}</span>
            <span><i className={strongSession ? "is-positive" : "is-warning"} aria-hidden="true" /> {strongSession ? "AAL2 session" : "Standard session"}</span>
          </div>
        </div>

        <aside className={`biloo-account-score-card ${strongSession ? "is-protected" : "needs-action"}`} aria-label="Security posture">
          <div className="biloo-account-score-ring" style={postureStyle}>
            <span><strong>{postureScore}</strong><small>/100</small></span>
          </div>
          <div className="biloo-account-score-copy">
            <p>SECURITY POSTURE</p>
            <h2>{strongSession ? "Protected session" : hasAuthenticator ? "Verification required" : "Setup recommended"}</h2>
            <ul>
              <li className="complete"><Icon name="check-circle" size={14} /> Verified identity</li>
              <li className={hasAuthenticator ? "complete" : "pending"}><Icon name={hasAuthenticator ? "check-circle" : "alert-triangle"} size={14} /> Authenticator factor</li>
              <li className={strongSession ? "complete" : "pending"}><Icon name={strongSession ? "check-circle" : "alert-triangle"} size={14} /> Strong current session</li>
            </ul>
          </div>
        </aside>
      </header>

      <nav className="biloo-account-section-nav" aria-label="Account sections">
        <a href="#profile"><Icon name="user" size={15} /> Profile</a>
        <a href="#sign-in"><Icon name="link" size={15} /> Sign-in</a>
        <a href="#authenticator"><Icon name="smartphone" size={15} /> Authenticator</a>
        <a href="#session"><Icon name="activity" size={15} /> Session</a>
      </nav>

      <section className="biloo-account-content-grid">
        <div className="biloo-account-main-column">
          <article className="biloo-account-profile-card" id="profile">
            <header>
              <span className="biloo-account-avatar">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}
              </span>
              <div>
                <p>ACTIVE BILOO ACCOUNT</p>
                <h2>{user.fullName}</h2>
                <span>{user.email || "Verified Biloo account"}</span>
              </div>
              <span className="biloo-account-live-badge"><i aria-hidden="true" /> Active now</span>
            </header>

            <div className="biloo-account-profile-body">
              <section className="biloo-account-detail-section">
                <div className="biloo-account-section-heading">
                  <div><p>ACCOUNT DETAILS</p><h3>Workspace identity</h3></div>
                  <span><Icon name="lock" size={12} /> Verified record</span>
                </div>
                <dl className="biloo-account-details-list">
                  <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>
                  <div><dt>Workspace role</dt><dd><span className="biloo-account-role-chip">{roleLabel(user.role)}</span></dd></div>
                  <div><dt>Primary identity</dt><dd>{providerLabel(user.provider)}</dd></div>
                  <div><dt>Current assurance</dt><dd><span className={`biloo-account-aal ${strongSession ? "is-strong" : ""}`}>{user.aal.toUpperCase()}</span></dd></div>
                  <div className="is-wide"><dt>Account ID</dt><dd><code>{user.userId}</code></dd></div>
                </dl>
              </section>
            </div>
          </article>

          <article className="biloo-account-identity-card" id="sign-in">
            <div className="biloo-account-card-icon"><Icon name="link" size={20} /></div>
            <div className="biloo-account-card-copy">
              <p>CONNECTED SIGN-IN</p>
              <h2>{providerLabel(user.provider)}</h2>
              <span>{providerDescription(user.provider)}</span>
            </div>
            <div className="biloo-account-identity-actions">
              {user.email ? <Link href={resetHref}>Create or reset password</Link> : null}
              <Link href="/help-center">Account help</Link>
            </div>
          </article>

          <div id="authenticator">
            <MfaSecurityPanel
              organizationId={user.organizationId}
              required={user.mfaRequired}
              initialAal={user.aal}
              continueHref={setupMode ? continueHref : undefined}
            />
          </div>
        </div>

        <aside className="biloo-account-rail">
          <section className="biloo-account-rail-card biloo-account-status-card">
            <div className="biloo-account-rail-heading">
              <div><p>ACCESS STATUS</p><h2>Current protection</h2></div>
              <span className={strongSession ? "is-ready" : "needs-action"}>{strongSession ? "Protected" : "Action needed"}</span>
            </div>
            <div className="biloo-account-status-list">
              <article className="is-complete"><span><Icon name="check-circle" size={17} /></span><div><strong>Identity confirmed</strong><small>{user.email || providerLabel(user.provider)}</small></div></article>
              <article className={hasAuthenticator ? "is-complete" : "is-pending"}><span><Icon name={hasAuthenticator ? "check-circle" : "smartphone"} size={17} /></span><div><strong>{hasAuthenticator ? "Authenticator enrolled" : "Authenticator missing"}</strong><small>{hasAuthenticator ? `${verifiedFactorCount} verified factor${verifiedFactorCount === 1 ? "" : "s"}` : "Add Google Authenticator or another TOTP app"}</small></div></article>
              <article className={strongSession ? "is-complete" : "is-pending"}><span><Icon name={strongSession ? "check-circle" : "lock"} size={17} /></span><div><strong>{strongSession ? "Strong session active" : "Session verification needed"}</strong><small>{strongSession ? "Protected actions are available" : "Enter a current authenticator code"}</small></div></article>
            </div>
          </section>

          <section className="biloo-account-rail-card" id="session">
            <div className="biloo-account-rail-heading">
              <div><p>CURRENT SESSION</p><h2>This browser</h2></div>
              <Icon name="activity" size={18} />
            </div>
            <div className="biloo-account-session-grid">
              <div><small>Assurance</small><strong>{user.aal.toUpperCase()}</strong></div>
              <div><small>Role policy</small><strong>{user.mfaRequired ? "MFA required" : "MFA optional"}</strong></div>
              <div><small>Provider</small><strong>{providerLabel(user.provider)}</strong></div>
              <div><small>Status</small><strong>{strongSession ? "Privileged" : "Standard"}</strong></div>
            </div>
            <p className="biloo-account-session-note"><Icon name="lightbulb" size={16} /> AAL2 applies to this browser session. Biloo will request verification again when the session no longer carries strong assurance.</p>
          </section>

          <section className="biloo-account-rail-card biloo-account-recovery-card">
            <div className="biloo-account-rail-heading">
              <div><p>RECOVERY PLAN</p><h2>Avoid account lockout</h2></div>
              <Icon name="shield-check" size={18} />
            </div>
            <ul>
              <li><span>01</span><p>Keep your business email and provider account recoverable.</p></li>
              <li><span>02</span><p>Add a second authenticator after verifying this session.</p></li>
              <li><span>03</span><p>Contact an organization owner before replacing your only device.</p></li>
            </ul>
          </section>

          <section className="biloo-account-signout-card">
            <div><p>FINISH SECURELY</p><h2>End this browser session</h2><span>Use secure logout on shared or public devices.</span></div>
            <form action={signOut}>
              <button type="submit"><Icon name="log-out" size={16} /> Log out securely</button>
            </form>
          </section>
        </aside>
      </section>

      <section className="biloo-account-access-flow" aria-labelledby="protected-access-heading">
        <header>
          <div><p>PRIVILEGED ACCESS FLOW</p><h2 id="protected-access-heading">Enterprise control without slowing everyday work.</h2><span>Biloo requests stronger proof only when a role or operation requires administrator assurance.</span></div>
          <span><Icon name="shield-check" size={14} /> Database enforced</span>
        </header>
        <div>
          <article><span><Icon name="user" size={18} /></span><div><small>STEP 01</small><strong>Sign in with your identity</strong><p>Use Google, email and password, Apple, or your verified mobile number.</p></div></article>
          <article><span><Icon name="smartphone" size={18} /></span><div><small>STEP 02</small><strong>Prove possession</strong><p>Enter a time-based code from Google Authenticator or another compatible app.</p></div></article>
          <article><span><Icon name="check-circle" size={18} /></span><div><small>STEP 03</small><strong>Complete protected work</strong><p>The application and database confirm AAL2 before privileged changes are accepted.</p></div></article>
        </div>
      </section>
    </main>
  );
}
