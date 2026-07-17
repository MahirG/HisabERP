import Link from "next/link";
import { AuthCredentialsFields } from "../../../components/auth-credentials-fields";
import { LanguageSelector } from "../../../components/language-provider";
import { signIn } from "../../../lib/actions/auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Phone sign in" };

const copy = {
  en: {
    badge: "Phone access",
    title: "Sign in with your registered mobile number.",
    text: "Phone access remains available for teams that registered with a verified mobile number.",
    heading: "Mobile number sign in",
    helper: "Use your country code, registered mobile number and password.",
    email: "Use email and password instead",
    trust: "Protected phone session · Organization-isolated data",
  },
  am: {
    badge: "የስልክ መግቢያ",
    title: "በተመዘገበው የሞባይል ቁጥርዎ ይግቡ።",
    text: "በተረጋገጠ የሞባይል ቁጥር ለተመዘገቡ ቡድኖች የስልክ መግቢያ አሁንም ይገኛል።",
    heading: "በሞባይል ቁጥር ይግቡ",
    helper: "የአገር ኮድ፣ የተመዘገበ ሞባይል ቁጥርና የይለፍ ቃል ይጠቀሙ።",
    email: "በኢሜይልና የይለፍ ቃል ይግቡ",
    trust: "የተጠበቀ የስልክ ክፍለ ጊዜ · የተለየ የድርጅት ውሂብ",
  },
  ti: {
    badge: "መእተዊ ተሌፎን",
    title: "ብዝተመዝገበ ቁጽሪ ሞባይልኩም እተዉ።",
    text: "ብዝተረጋገጸ ቁጽሪ ሞባይል ንዝተመዝገቡ ጉጅለታት መእተዊ ተሌፎን ይርከብ።",
    heading: "ብቁጽሪ ሞባይል እተዉ",
    helper: "ኮድ ሃገር፣ ዝተመዝገበ ቁጽሪ ሞባይልን መሕለፊ ቃልን ተጠቐሙ።",
    email: "ብኢሜይልን መሕለፊ ቃልን እተዉ",
    trust: "ዝተሓለወ ክፍለ ግዜ ተሌፎን · ዝተፈልየ ዳታ ውድብ",
  },
} as const;

export default async function PhoneLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string; preview?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const c = localized.copy.auth;
  const p = copy[localized.language];
  const configured = isSupabaseConfigured();
  const next = params.next || "/";
  const preview = params.preview === "1";

  return (
    <main className="auth-page auth-premium-page">
      <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
      <section className="auth-shell">
        <aside className="auth-showcase">
          <Link href="/" className="auth-showcase-brand"><span>H</span><strong>HisabTech</strong></Link>
          <div className="auth-showcase-content"><span className="auth-badge"><i/> {p.badge}</span><h2>{p.title}</h2><p>{p.text}</p></div>
          <div className="auth-showcase-footer"><span>●</span>{p.trust}</div>
        </aside>
        <section className="auth-card auth-form-panel">
          <div className="auth-top"><Link href="/" className="auth-brand auth-mobile-brand"><span>H</span><strong>HisabTech</strong></Link><LanguageSelector/></div>
          <div className="auth-heading"><p className="eyebrow">PHONE ACCESS</p><h1>{p.heading}</h1><p>{p.helper}</p></div>
          {!configured && <div className="form-alert warning">Authentication is not configured.</div>}
          {params.error && <div className="form-alert error" role="alert">{params.error}</div>}
          {params.message && <div className="form-alert success" role="status">{params.message}</div>}
          <form action={signIn} className="erp-form premium-auth-form">
            <input type="hidden" name="next" value={next}/>
            <AuthCredentialsFields mode="sign-in" language={localized.language}/>
            <button className="primary auth-submit" type="submit" disabled={!configured}><span>{c.signIn}</span><b aria-hidden="true">→</b></button>
          </form>
          <Link className="secondary auth-submit action-link" href={`/auth/login?next=${encodeURIComponent(next)}${preview ? "&preview=1" : ""}`}>{p.email}</Link>
          <p className="auth-switch">{c.newUser} <Link href={`/auth/sign-up${preview ? "?preview=1" : ""}`}>{c.createAccount}</Link></p>
        </section>
      </section>
    </main>
  );
}
