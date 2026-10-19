import Link from "next/link";
import { AuthNotice } from "../../../components/email-auth-card";
import { LoginPasswordField } from "../../../components/login-password-field";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { Icon } from "../../../components/ui/icon";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { appConfig, isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";
import { safeNextPath } from "../../../lib/validation";

export const metadata = { title: "Sign in" };

const loginCopy = {
  en: {
    title: "Welcome back",
    description: "Sign in to continue to your Biloo business workspace.",
    email: "Business email",
    emailPlaceholder: "name@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Sign in to Biloo",
    divider: "or continue with email",
    magic: "Email me a secure sign-in link",
    forgot: "Forgot password?",
    phone: "Use mobile number instead",
    newUser: "New to Biloo?",
    create: "Create your workspace",
    passwordHelpTitle: "Need email and password access?",
    passwordHelp: "If this email was first registered with Google, create a password securely without creating a second account.",
    passwordHelpAction: "Create or reset email password",
    confirmationHelp: "Your email still needs verification before password sign-in is available.",
    confirmationAction: "Resend verification email",
  },
} as const;

type LoginSearchParams = {
  error?: string;
  message?: string;
  next?: string;
  preview?: string;
  reason?: string;
  email?: string;
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<LoginSearchParams> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const p = loginCopy.en;
  const configured = isSupabaseConfigured();
  const next = safeNextPath(params.next || "/workspace-home");
  const preview = params.preview === "1";
  const email = typeof params.email === "string" ? params.email.trim().slice(0, 254) : "";
  const errorMessage = typeof params.error === "string" ? params.error.slice(0, 360) : "";
  const successMessage = typeof params.message === "string" ? params.message.slice(0, 360) : "";
  const showPasswordHelp = params.reason === "existing-account" || params.reason === "password-or-provider";
  const showConfirmationHelp = params.reason === "email-not-confirmed" && Boolean(email);

  const signUpQuery = new URLSearchParams({ next });
  const resetQuery = new URLSearchParams({ next });
  const verifyQuery = new URLSearchParams({ next });
  if (preview) {
    signUpQuery.set("preview", "1");
    resetQuery.set("preview", "1");
  }
  if (email) {
    resetQuery.set("email", email);
    verifyQuery.set("email", email);
  }

  const magicQuery = new URLSearchParams({ next });
  const phoneQuery = new URLSearchParams({ next });
  if (preview) {
    magicQuery.set("preview", "1");
    phoneQuery.set("preview", "1");
  }

  return (
    <main className="biloo-login-page">
      <section className="biloo-login-shell">
        <aside className="biloo-login-visual" aria-label="Biloo business workspace preview">
          <div className="biloo-login-visual-grid" aria-hidden="true" />
          <header className="biloo-login-visual-header">
            <Link href="/" className="biloo-login-wordmark" aria-label="Biloo home">
              biloo<span>.</span>
            </Link>
            <span className="biloo-login-secure-status"><i aria-hidden="true" /> Secure cloud workspace</span>
          </header>

          <div className="biloo-login-visual-copy">
            <p className="biloo-login-kicker"><Icon name="sparkles" size={16} /> Built for ambitious Ethiopian businesses</p>
            <h2>Clarity for every birr, every decision.</h2>
            <p>One connected operating system for finance, sales, inventory, customers and the decisions that move your business forward.</p>
          </div>

          <div className="biloo-login-benefits" aria-label="Your connected business modules">
            <div><span aria-hidden="true"><Icon name="receipt" size={18} /></span><div><strong>Sales and invoicing</strong><small>Keep transactions, customers and receivables organized.</small></div></div>
            <div><span aria-hidden="true"><Icon name="landmark" size={18} /></span><div><strong>Finance and reporting</strong><small>Understand cash flow with accurate business records.</small></div></div>
            <div><span aria-hidden="true"><Icon name="boxes" size={18} /></span><div><strong>Inventory and purchasing</strong><small>Manage stock and supplier operations together.</small></div></div>
          </div>

          <footer className="biloo-login-visual-footer">
            <span><Icon name="shield-check" size={17} /> Protected access</span>
            <span><Icon name="activity" size={17} /> Connected reporting</span>
            <span><Icon name="building" size={17} /> Multi-business ready</span>
          </footer>
        </aside>

        <section className="biloo-login-form-pane">
          <nav className="biloo-login-topbar" aria-label="Sign-in support links">
            <Link href="/" className="biloo-login-mobile-wordmark" aria-label="Biloo home"><img src="/biloo-header-logo.svg" alt="Biloo" /></Link>
            <div><Link href="/help-center">Help</Link><Link href="/">Back to website</Link></div>
          </nav>

          <div className="biloo-login-form-wrap">
            <div className="biloo-login-card">
              <header className="biloo-login-heading">
                <span className="biloo-login-heading-icon"><Icon name="lock" size={20} /></span>
                <p>Secure workspace access</p>
                <h1>{p.title}</h1>
                <span>{p.description}</span>
              </header>

              {!configured && <AuthNotice type="warning">Authentication is not configured.</AuthNotice>}
              <AuthNotice type="error">{errorMessage}</AuthNotice>
              <AuthNotice type="success">{successMessage}</AuthNotice>

              {showPasswordHelp ? (
                <AuthNotice type="warning">
                  <strong>{p.passwordHelpTitle}</strong> {p.passwordHelp}{" "}
                  <Link href={`/auth/forgot-password?${resetQuery.toString()}`}>{p.passwordHelpAction}</Link>.
                </AuthNotice>
              ) : null}

              {showConfirmationHelp ? (
                <AuthNotice type="warning">
                  {p.confirmationHelp}{" "}
                  <Link href={`/auth/verify-email?${verifyQuery.toString()}`}>{p.confirmationAction}</Link>.
                </AuthNotice>
              ) : null}

              <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider} />

              <form action={signInWithEmail} className="biloo-login-form">
                <input type="hidden" name="next" value={next} />

                <label className="biloo-login-field" htmlFor="login-email">
                  <span>{p.email}</span>
                  <div className="biloo-login-input-shell">
                    <span className="biloo-login-field-icon is-email" aria-hidden="true"><Icon name="mail" size={18} /></span>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={p.emailPlaceholder}
                      defaultValue={email}
                      required
                    />
                  </div>
                </label>

                <LoginPasswordField
                  label={p.password}
                  placeholder={p.passwordPlaceholder}
                  forgotLabel={p.forgot}
                  forgotHref={`/auth/forgot-password?${resetQuery.toString()}`}
                />

                <button className="biloo-login-primary" type="submit" disabled={!configured}>
                  <span>{p.submit}</span><Icon name="arrow-right" size={18} />
                </button>
              </form>

              <div className="biloo-login-secondary-actions">
                <Link href={`/auth/magic-link?${magicQuery.toString()}`}><Icon name="link" size={16} />{p.magic}</Link>
                {appConfig.authProviders.phone ? <Link href={`/auth/phone-login?${phoneQuery.toString()}`}><Icon name="smartphone" size={16} />{p.phone}</Link> : null}
              </div>

              <div className="biloo-login-account-switch">
                <span>{p.newUser}</span>
                <Link href={`/auth/email-sign-up?${signUpQuery.toString()}`}>{p.create}<Icon name="arrow-right" size={15} /></Link>
              </div>
            </div>
          </div>

          <footer className="biloo-login-legal">
            <span>© 2026 Biloo</span>
            <Link href="/trust">Privacy &amp; security</Link>
            <span>Encrypted connection</span>
          </footer>
        </section>
      </section>
    </main>
  );
}
