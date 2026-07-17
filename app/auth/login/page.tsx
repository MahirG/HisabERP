import Link from "next/link";
import { LanguageSelector } from "../../../components/language-provider";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

const premiumCopy = {
  en: {
    badge: "HisabTech secure access v2",
    title: "One secure identity for every business you manage.",
    text: "Sign in with a verified email, Google, Apple or a passwordless magic link. Phone access remains available when you need it.",
    secure: "Verified access",
    secureText: "Email confirmation and recovery",
    fast: "Protected sessions",
    fastText: "Organization-isolated business data",
    greeting: "Welcome back",
    helper: "Email and password is now the default secure sign-in method.",
    email: "Business email",
    password: "Password",
    submit: "Sign in securely",
    divider: "or continue with your business email",
    magic: "Email me a magic sign-in link",
    forgot: "Forgot your password?",
    phone: "Use mobile number instead",
    newUser: "New to HisabTech?",
    create: "Create a verified account",
    trust: "Auth v2 · Email-first · Supabase protected",
  },
  am: {
    badge: "HisabTech ደህንነቱ የተጠበቀ መግቢያ v2",
    title: "ለሚያስተዳድሩት እያንዳንዱ ንግድ አንድ ደህንነቱ የተጠበቀ መለያ።",
    text: "በተረጋገጠ ኢሜይል፣ Google፣ Apple ወይም ያለ የይለፍ ቃል ማጂክ ሊንክ ይግቡ። የስልክ መግቢያም አሁንም ይገኛል።",
    secure: "የተረጋገጠ መግቢያ",
    secureText: "የኢሜይል ማረጋገጫና መልሶ ማግኛ",
    fast: "የተጠበቀ ክፍለ ጊዜ",
    fastText: "የድርጅት ውሂብ መለያየት",
    greeting: "እንኳን ደህና መጡ",
    helper: "ኢሜይልና የይለፍ ቃል አሁን ዋናው ደህንነቱ የተጠበቀ መግቢያ ነው።",
    email: "የንግድ ኢሜይል",
    password: "የይለፍ ቃል",
    submit: "በደህና ይግቡ",
    divider: "ወይም በንግድ ኢሜይልዎ ይቀጥሉ",
    magic: "የመግቢያ ሊንክ በኢሜይል ላክልኝ",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    phone: "በሞባይል ቁጥር ይግቡ",
    newUser: "ለHisabTech አዲስ ነዎት?",
    create: "የተረጋገጠ መለያ ይፍጠሩ",
    trust: "Auth v2 · ኢሜይል ቅድሚያ · በSupabase የተጠበቀ",
  },
  ti: {
    badge: "HisabTech ውሑስ መእተዊ v2",
    title: "ንነፍሲ ወከፍ እተመሓድርዎ ንግዲ ሓደ ውሑስ መንነት።",
    text: "ብዝተረጋገጸ ኢሜይል፣ Google፣ Apple ወይ ብዘይ መሕለፊ ቃል ማጂክ ሊንክ እተዉ። መእተዊ ተሌፎን እውን ይርከብ።",
    secure: "ዝተረጋገጸ መእተዊ",
    secureText: "ምርግጋጽን ምምላስን ኢሜይል",
    fast: "ዝተሓለወ ክፍለ ግዜ",
    fastText: "ዝተፈልየ ዳታ ውድብ",
    greeting: "እንቋዕ ብደሓን መጻእኩም",
    helper: "ኢሜይልን መሕለፊ ቃልን ሕጂ ቀንዲ ውሑስ መእተዊ እዩ።",
    email: "ናይ ንግዲ ኢሜይል",
    password: "መሕለፊ ቃል",
    submit: "ብውሕስነት እተዉ",
    divider: "ወይ ብናይ ንግዲ ኢሜይልኩም ቀጽሉ",
    magic: "ናይ መእተዊ ሊንክ ብኢሜይል ስደዱለይ",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    phone: "ብቁጽሪ ሞባይል እተዉ",
    newUser: "ኣብ HisabTech ሓድሽ ዲኹም?",
    create: "ዝተረጋገጸ ኣካውንት ፍጠሩ",
    trust: "Auth v2 · ኢሜይል ቀዳማይ · ብSupabase ዝተሓለወ",
  },
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string; preview?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const p = premiumCopy[localized.language];
  const configured = isSupabaseConfigured();
  const next = params.next || "/";
  const preview = params.preview === "1";
  const previewQuery = preview ? "&preview=1" : "";

  return (
    <main className="auth-page auth-premium-page">
      <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
      <section className="auth-shell">
        <aside className="auth-showcase">
          <Link href="/" className="auth-showcase-brand"><span>H</span><strong>HisabTech</strong></Link>
          <div className="auth-showcase-content">
            <span className="auth-badge"><i/> {p.badge}</span>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <div className="auth-benefits">
              <div><span className="benefit-icon">✓</span><strong>{p.secure}</strong><small>{p.secureText}</small></div>
              <div><span className="benefit-icon">◉</span><strong>{p.fast}</strong><small>{p.fastText}</small></div>
            </div>
          </div>
          <div className="auth-showcase-footer"><span>●</span>{p.trust}</div>
        </aside>

        <section className="auth-card auth-form-panel">
          <div className="auth-top">
            <Link href="/" className="auth-brand auth-mobile-brand"><span>H</span><strong>HisabTech</strong></Link>
            <LanguageSelector/>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">AUTHENTICATION V2</p>
            <h1>{p.greeting}</h1>
            <p>{p.helper}</p>
          </div>
          {!configured && <div className="form-alert warning">Authentication is not configured.</div>}
          {params.error && <div className="form-alert error" role="alert">{params.error}</div>}
          {params.message && <div className="form-alert success" role="status">{params.message}</div>}
          <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider}/>
          <form action={signInWithEmail} className="erp-form premium-auth-form">
            <input type="hidden" name="next" value={next}/>
            <label className="premium-field"><span className="field-label">{p.email}</span><span className="field-control"><input name="email" type="email" autoComplete="email" required/></span></label>
            <label className="premium-field"><span className="field-label">{p.password}</span><span className="field-control"><input name="password" type="password" autoComplete="current-password" required/></span></label>
            <button className="primary auth-submit" type="submit" disabled={!configured}><span>{p.submit}</span><b aria-hidden="true">→</b></button>
          </form>
          <p className="auth-switch"><Link href={`/auth/magic-link?next=${encodeURIComponent(next)}${previewQuery}`}>{p.magic}</Link> · <Link href={`/auth/forgot-password${preview ? "?preview=1" : ""}`}>{p.forgot}</Link></p>
          <Link className="secondary auth-submit action-link" href={`/auth/phone-login?next=${encodeURIComponent(next)}${previewQuery}`}>{p.phone}</Link>
          <p className="auth-switch">{p.newUser} <Link href={`/auth/email-sign-up${preview ? "?preview=1" : ""}`}>{p.create}</Link></p>
        </section>
      </section>
    </main>
  );
}
