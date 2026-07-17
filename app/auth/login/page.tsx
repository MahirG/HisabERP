import Link from "next/link";
import { AuthCredentialsFields } from "../../../components/auth-credentials-fields";
import { LanguageSelector } from "../../../components/language-provider";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signIn } from "../../../lib/actions/auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

const premiumCopy = {
  en: {
    badge: "Built for modern Ethiopian business",
    title: "Your entire business, beautifully under control.",
    text: "Move from scattered records to one secure view of cash, sales, stock and customers.",
    secure: "Secure access",
    secureText: "Protected company data",
    fast: "Fast decisions",
    fastText: "Live business visibility",
    greeting: "Welcome back",
    helper: "Sign in securely with Google, email, magic link, or your registered mobile number.",
    email: "Sign in with email and password",
    magic: "Email me a magic sign-in link",
    forgot: "Forgot your password?",
    trust: "Encrypted sessions · Organization-isolated data",
  },
  am: {
    badge: "ለዘመናዊ የኢትዮጵያ ንግድ የተሰራ",
    title: "ሙሉ ንግድዎን በአንድ ውብና ደህንነቱ በተጠበቀ ቦታ ያስተዳድሩ።",
    text: "ገንዘብ፣ ሽያጭ፣ ክምችትና ደንበኞችን ከአንድ ግልጽ ዳሽቦርድ ይቆጣጠሩ።",
    secure: "ደህንነቱ የተጠበቀ መግቢያ",
    secureText: "የድርጅት ውሂብ ጥበቃ",
    fast: "ፈጣን ውሳኔ",
    fastText: "የቀጥታ የንግድ እይታ",
    greeting: "እንኳን ደህና መጡ",
    helper: "በGoogle፣ በኢሜይል፣ በማጂክ ሊንክ ወይም በተመዘገበው የሞባይል ቁጥርዎ በደህና ይግቡ።",
    email: "በኢሜይልና የይለፍ ቃል ይግቡ",
    magic: "የመግቢያ ሊንክ በኢሜይል ላክልኝ",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    trust: "የተመሰጠረ ክፍለ ጊዜ · የተለየ የድርጅት ውሂብ",
  },
  ti: {
    badge: "ንዘመናዊ ንግዲ ኢትዮጵያ ዝተሰርሐ",
    title: "ምሉእ ንግድኹም ኣብ ሓደ ጽቡቕን ውሑስን ቦታ ኣመሓድሩ።",
    text: "ገንዘብ፣ ሽያጭ፣ ስቶክን ዓማዊልን ካብ ሓደ ንጹር ዳሽቦርድ ተቖጻጸሩ።",
    secure: "ውሑስ መእተዊ",
    secureText: "ዝተሓለወ ዳታ ውድብ",
    fast: "ቅልጡፍ ውሳነ",
    fastText: "ቀጥታዊ እይታ ንግዲ",
    greeting: "እንቋዕ ብደሓን መጻእኩም",
    helper: "ብGoogle፣ ብኢሜይል፣ ብማጂክ ሊንክ ወይ ብዝተመዝገበ ቁጽሪ ሞባይልኩም ብውሕስነት እተዉ።",
    email: "ብኢሜይልን መሕለፊ ቃልን እተዉ",
    magic: "ናይ መእተዊ ሊንክ ብኢሜይል ስደዱለይ",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    trust: "ዝተመስጠረ ክፍለ ግዜ · ዝተፈልየ ዳታ ውድብ",
  },
} as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const c = localized.copy.auth;
  const p = premiumCopy[localized.language];
  const configured = isSupabaseConfigured();
  const next = params.next || "/";

  return (
    <main className="auth-page auth-premium-page">
      <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
      <section className="auth-shell">
        <aside className="auth-showcase">
          <Link href="/" className="auth-showcase-brand"><span>H</span><strong>Hisab ERP</strong></Link>
          <div className="auth-showcase-content">
            <span className="auth-badge"><i/> {p.badge}</span>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <div className="auth-benefits">
              <div><span className="benefit-icon">⌁</span><strong>{p.secure}</strong><small>{p.secureText}</small></div>
              <div><span className="benefit-icon">↗</span><strong>{p.fast}</strong><small>{p.fastText}</small></div>
            </div>
          </div>
          <div className="auth-showcase-footer"><span>●</span>{p.trust}</div>
        </aside>

        <section className="auth-card auth-form-panel">
          <div className="auth-top">
            <Link href="/" className="auth-brand auth-mobile-brand"><span>H</span><strong>Hisab ERP</strong></Link>
            <LanguageSelector/>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">{c.secureWorkspace}</p>
            <h1>{p.greeting}</h1>
            <p>{p.helper}</p>
          </div>
          {!configured && <div className="form-alert warning">{c.supabaseMissing}</div>}
          {params.error && <div className="form-alert error">{params.error}</div>}
          {params.message && <div className="form-alert success">{params.message}</div>}
          <SocialAuthButtons language={localized.language} next={next} disabled={!configured}/>
          <Link className="primary auth-submit action-link" href={`/auth/email-login?next=${encodeURIComponent(next)}`}>{p.email}</Link>
          <p className="auth-switch"><Link href={`/auth/magic-link?next=${encodeURIComponent(next)}`}>{p.magic}</Link> · <Link href="/auth/forgot-password">{p.forgot}</Link></p>
          <form action={signIn} className="erp-form premium-auth-form">
            <input type="hidden" name="next" value={next}/>
            <AuthCredentialsFields mode="sign-in" language={localized.language}/>
            <button className="primary auth-submit" type="submit" disabled={!configured}><span>{c.signIn}</span><b aria-hidden="true">→</b></button>
          </form>
          <p className="auth-switch">{c.newUser} <Link href="/auth/sign-up">{c.createAccount}</Link></p>
        </section>
      </section>
    </main>
  );
}
