import Link from "next/link";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

const loginCopy = {
  en: {
    greeting: "Sign in to HisabTech",
    helper: "Enter your business email and password to access your workspace.",
    email: "Business email",
    emailPlaceholder: "name@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Sign in",
    divider: "or sign in with",
    magic: "Send me a magic sign-in link",
    magicPrompt: "Prefer password-free access?",
    forgot: "Forgot password?",
    phone: "Sign in with mobile number",
    newUser: "New to HisabTech?",
    create: "Create an account",
    legal: "By continuing, you agree to use HisabTech responsibly and protect your organization’s financial information.",
    footer: "Secure business access for Ethiopia",
  },
  am: {
    greeting: "ወደ HisabTech ይግቡ",
    helper: "ወደ የሥራ ቦታዎ ለመግባት የንግድ ኢሜይልዎንና የይለፍ ቃልዎን ያስገቡ።",
    email: "የንግድ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    submit: "ይግቡ",
    divider: "ወይም በዚህ ይግቡ",
    magic: "የማጂክ መግቢያ ሊንክ ይላኩልኝ",
    magicPrompt: "ያለ የይለፍ ቃል መግባት ይፈልጋሉ?",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    phone: "በሞባይል ቁጥር ይግቡ",
    newUser: "ለHisabTech አዲስ ነዎት?",
    create: "መለያ ይፍጠሩ",
    legal: "በመቀጠል HisabTechን በኃላፊነት ለመጠቀምና የድርጅትዎን የፋይናንስ መረጃ ለመጠበቅ ይስማማሉ።",
    footer: "ለኢትዮጵያ ንግዶች የተጠበቀ መግቢያ",
  },
  ti: {
    greeting: "ናብ HisabTech እተዉ",
    helper: "ናብ መስርሒ ቦታኹም ንምእታው ናይ ንግዲ ኢሜይልኩምን መሕለፊ ቃልኩምን ኣእትዉ።",
    email: "ናይ ንግዲ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "መሕለፊ ቃል",
    passwordPlaceholder: "መሕለፊ ቃልኩም ኣእትዉ",
    submit: "እተዉ",
    divider: "ወይ በዚ እተዉ",
    magic: "ናይ ማጂክ መእተዊ ሊንክ ስደዱለይ",
    magicPrompt: "ብዘይ መሕለፊ ቃል ክትኣትዉ ትደልዩ?",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    phone: "ብቁጽሪ ሞባይል እተዉ",
    newUser: "ኣብ HisabTech ሓድሽ ዲኹም?",
    create: "ኣካውንት ፍጠሩ",
    legal: "ብምቕጻል HisabTechን ብሓላፍነት ክትጥቀሙን ናይ ውድብኩም ፋይናንሳዊ ሓበሬታ ክትሕልዉን ትሰማምዑ።",
    footer: "ንንግዲ ኢትዮጵያ ውሑስ መእተዊ",
  },
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string; preview?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const p = loginCopy[localized.language];
  const configured = isSupabaseConfigured();
  const next = params.next || "/";
  const preview = params.preview === "1";
  const previewQuery = preview ? "&preview=1" : "";
  const signUpHref = `/auth/email-sign-up${preview ? "?preview=1" : ""}`;

  return (
    <main className="auth-page auth-premium-page auth-official-page auth-slack-page">
      <header className="auth-slack-header">
        <Link href="/" className="auth-slack-brand" aria-label="HisabTech home">
          <span className="auth-slack-mark" aria-hidden="true"><i/><i/><i/><i/></span>
          <strong>HisabTech</strong>
        </Link>
        <div className="auth-slack-new-account">
          <span>{p.newUser}</span>
          <Link href={signUpHref}>{p.create}</Link>
        </div>
      </header>

      <section className="auth-slack-stage">
        <div className="auth-slack-panel">
          <div className="auth-slack-heading">
            <h1>{p.greeting}</h1>
            <p>{p.helper}</p>
          </div>

          {!configured && <div className="form-alert warning">Authentication is not configured.</div>}
          {params.error && <div className="form-alert error" role="alert">{params.error}</div>}
          {params.message && <div className="form-alert success" role="status">{params.message}</div>}

          <form action={signInWithEmail} className="erp-form premium-auth-form auth-slack-form">
            <input type="hidden" name="next" value={next}/>
            <label className="premium-field" htmlFor="login-email">
              <span className="field-label">{p.email}</span>
              <span className="field-control">
                <input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={p.emailPlaceholder} required autoFocus/>
              </span>
            </label>
            <div className="auth-field-block">
              <div className="auth-field-label-row">
                <label className="field-label" htmlFor="login-password">{p.password}</label>
                <Link href={`/auth/forgot-password${preview ? "?preview=1" : ""}`}>{p.forgot}</Link>
              </div>
              <span className="field-control">
                <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder={p.passwordPlaceholder} required/>
              </span>
            </div>
            <button className="primary auth-submit auth-primary-button auth-slack-primary" type="submit" disabled={!configured}>
              <span>{p.submit}</span><b aria-hidden="true">→</b>
            </button>
          </form>

          <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider}/>

          <div className="auth-slack-passwordless">
            <span aria-hidden="true">✦</span>
            <p>{p.magicPrompt} <Link href={`/auth/magic-link?next=${encodeURIComponent(next)}${previewQuery}`}>{p.magic}</Link></p>
          </div>

          <div className="auth-slack-options" aria-label="Other sign-in options">
            <Link href={`/auth/phone-login?next=${encodeURIComponent(next)}${previewQuery}`}>{p.phone}</Link>
            <span aria-hidden="true">•</span>
            <Link href={`/auth/forgot-password${preview ? "?preview=1" : ""}`}>{p.forgot}</Link>
          </div>

          <p className="auth-slack-legal">{p.legal}</p>
          <p className="auth-slack-mobile-switch">{p.newUser} <Link href={signUpHref}>{p.create}</Link></p>
        </div>
      </section>

      <footer className="auth-slack-footer">
        <span>© {new Date().getFullYear()} Hisab Technologies</span>
        <span>{p.footer}</span>
      </footer>
    </main>
  );
}
