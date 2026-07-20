import Link from "next/link";
import { LanguageSelector } from "../../../components/language-provider";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

const officialCopy = {
  en: {
    badge: "Secure business access",
    title: "Your business, under control.",
    text: "Manage finance, sales, inventory and operations from one protected workspace built for serious teams.",
    secure: "Role-based access",
    secureText: "Every person sees only what their role allows.",
    fast: "Protected business data",
    fastText: "Organization records remain isolated and auditable.",
    greeting: "Sign in to HisabTech",
    helper: "Continue with a trusted provider or use your business email.",
    email: "Business email",
    password: "Password",
    submit: "Sign in",
    divider: "or sign in with email",
    magic: "Use a magic sign-in link",
    forgot: "Forgot password?",
    phone: "Sign in with mobile number",
    newUser: "New to HisabTech?",
    create: "Create an account",
    trust: "Secure operations for modern Ethiopian businesses",
  },
  am: {
    badge: "ደህንነቱ የተጠበቀ የንግድ መግቢያ",
    title: "ንግድዎን በግልጽነት ያስተዳድሩ።",
    text: "ፋይናንስ፣ ሽያጭ፣ ክምችትና ሥራዎችን ለከባድ ቡድኖች በተሰራ አንድ የተጠበቀ መስሪያ ቦታ ያስተዳድሩ።",
    secure: "በሚና የተመሰረተ መግቢያ",
    secureText: "እያንዳንዱ ሰው ሚናው የሚፈቅደውን ብቻ ያያል።",
    fast: "የተጠበቀ የንግድ ውሂብ",
    fastText: "የድርጅት መዝገቦች ተለይተውና ለኦዲት ዝግጁ ሆነው ይቆያሉ።",
    greeting: "ወደ HisabTech ይግቡ",
    helper: "በታመነ አቅራቢ ይቀጥሉ ወይም የንግድ ኢሜይልዎን ይጠቀሙ።",
    email: "የንግድ ኢሜይል",
    password: "የይለፍ ቃል",
    submit: "ይግቡ",
    divider: "ወይም በኢሜይል ይግቡ",
    magic: "በማጂክ መግቢያ ሊንክ ይግቡ",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    phone: "በሞባይል ቁጥር ይግቡ",
    newUser: "ለHisabTech አዲስ ነዎት?",
    create: "መለያ ይፍጠሩ",
    trust: "ለዘመናዊ የኢትዮጵያ ንግዶች የተጠበቀ ሥራ",
  },
  ti: {
    badge: "ውሑስ መእተዊ ንግዲ",
    title: "ንግድኹም ብግልጽነት ኣመሓድሩ።",
    text: "ፋይናንስ፣ ሽያጥ፣ ስቶክን ስርሓትን ኣብ ሓደ ውሑስ መስርሒ ቦታ ኣመሓድሩ።",
    secure: "ብተራ ዝተወሰነ መእተዊ",
    secureText: "ነፍሲ ወከፍ ሰብ ተራኡ ዝፈቐዶ ጥራይ ይርኢ።",
    fast: "ዝተሓለወ ዳታ ንግዲ",
    fastText: "መዝገባት ውድብ ተፈልዮምን ንኦዲት ድሉዋትን ይቕጽሉ።",
    greeting: "ናብ HisabTech እተዉ",
    helper: "ብዝተኣመነ ኣቕራቢ ቀጽሉ ወይ ናይ ንግዲ ኢሜይልኩም ተጠቐሙ።",
    email: "ናይ ንግዲ ኢሜይል",
    password: "መሕለፊ ቃል",
    submit: "እተዉ",
    divider: "ወይ ብኢሜይል እተዉ",
    magic: "ብማጂክ ሊንክ መእተዊ እተዉ",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    phone: "ብቁጽሪ ሞባይል እተዉ",
    newUser: "ኣብ HisabTech ሓድሽ ዲኹም?",
    create: "ኣካውንት ፍጠሩ",
    trust: "ንዘመናዊ ንግዲ ኢትዮጵያ ውሑስ ስርሓት",
  },
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string; preview?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const p = officialCopy[localized.language];
  const configured = isSupabaseConfigured();
  const next = params.next || "/";
  const preview = params.preview === "1";
  const previewQuery = preview ? "&preview=1" : "";

  return (
    <main className="auth-page auth-premium-page auth-official-page">
      <section className="auth-shell auth-official-shell">
        <aside className="auth-showcase auth-official-showcase">
          <Link href="/" className="auth-showcase-brand auth-official-brand"><span>H</span><strong>HisabTech</strong></Link>
          <div className="auth-showcase-content">
            <span className="auth-badge auth-official-badge"><i/> {p.badge}</span>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <div className="auth-benefits auth-official-benefits">
              <div><span className="benefit-icon" aria-hidden="true">✓</span><strong>{p.secure}</strong><small>{p.secureText}</small></div>
              <div><span className="benefit-icon" aria-hidden="true">◫</span><strong>{p.fast}</strong><small>{p.fastText}</small></div>
            </div>
          </div>
          <div className="auth-showcase-footer"><span>●</span>{p.trust}</div>
        </aside>

        <section className="auth-card auth-form-panel auth-official-form-panel">
          <div className="auth-official-form-wrap">
            <div className="auth-top">
              <Link href="/" className="auth-brand auth-mobile-brand"><span>H</span><strong>HisabTech</strong></Link>
              <LanguageSelector/>
            </div>
            <div className="auth-heading auth-official-heading">
              <p className="eyebrow">HisabTech</p>
              <h1>{p.greeting}</h1>
              <p>{p.helper}</p>
            </div>
            {!configured && <div className="form-alert warning">Authentication is not configured.</div>}
            {params.error && <div className="form-alert error" role="alert">{params.error}</div>}
            {params.message && <div className="form-alert success" role="status">{params.message}</div>}
            <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider}/>
            <form action={signInWithEmail} className="erp-form premium-auth-form auth-official-form">
              <input type="hidden" name="next" value={next}/>
              <label className="premium-field" htmlFor="login-email"><span className="field-label">{p.email}</span><span className="field-control"><input id="login-email" name="email" type="email" autoComplete="email" required/></span></label>
              <div className="auth-field-block">
                <div className="auth-field-label-row"><label className="field-label" htmlFor="login-password">{p.password}</label><Link href={`/auth/forgot-password${preview ? "?preview=1" : ""}`}>{p.forgot}</Link></div>
                <span className="field-control"><input id="login-password" name="password" type="password" autoComplete="current-password" required/></span>
              </div>
              <button className="primary auth-submit auth-primary-button" type="submit" disabled={!configured}><span>{p.submit}</span><b aria-hidden="true">→</b></button>
            </form>
            <div className="auth-secondary-options" aria-label="Other sign-in options">
              <Link href={`/auth/magic-link?next=${encodeURIComponent(next)}${previewQuery}`}><span aria-hidden="true">✉</span><strong>{p.magic}</strong><b aria-hidden="true">→</b></Link>
              <Link href={`/auth/phone-login?next=${encodeURIComponent(next)}${previewQuery}`}><span aria-hidden="true">◉</span><strong>{p.phone}</strong><b aria-hidden="true">→</b></Link>
            </div>
            <p className="auth-switch auth-account-switch">{p.newUser} <Link href={`/auth/email-sign-up${preview ? "?preview=1" : ""}`}>{p.create}</Link></p>
          </div>
        </section>
      </section>
    </main>
  );
}
