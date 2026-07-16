import Link from "next/link";
import { AuthCredentialsFields } from "../../../components/auth-credentials-fields";
import { LanguageSelector } from "../../../components/language-provider";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signUp } from "../../../lib/actions/auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Create account" };

const premiumCopy = {
  en: {
    badge: "Start with confidence",
    title: "A premium operating system for your growing company.",
    text: "Create a secure workspace for sales, finance, inventory and customer operations in minutes.",
    owner: "Owner-ready",
    ownerText: "Your first verified account controls setup",
    protected: "Built-in protection",
    protectedText: "Organization-level data isolation",
    heading: "Create your workspace",
    helper: "Start with Google, Apple or verify your company account using a mobile number.",
    sms: "Phone verification requires an enabled SMS provider in Supabase.",
    trust: "Designed in Ethiopia · Ready for serious business",
  },
  am: {
    badge: "በመተማመን ይጀምሩ",
    title: "ለሚያድግ ድርጅትዎ የተሰራ ፕሪሚየም የንግድ ስርዓት።",
    text: "ሽያጭ፣ ፋይናንስ፣ ክምችትና ደንበኞችን በደቂቃዎች ውስጥ በአንድ ደህንነቱ በተጠበቀ ቦታ ያዋቅሩ።",
    owner: "ለባለቤት ዝግጁ",
    ownerText: "የመጀመሪያው የተረጋገጠ መለያ ማዋቀሩን ይቆጣጠራል",
    protected: "አብሮ የተሰራ ጥበቃ",
    protectedText: "በድርጅት ደረጃ የውሂብ መለያየት",
    heading: "የሥራ ቦታዎን ይፍጠሩ",
    helper: "በGoogle፣ Apple ይጀምሩ ወይም የድርጅት መለያዎን በሞባይል ቁጥር ያረጋግጡ።",
    sms: "የስልክ ማረጋገጫ በSupabase ውስጥ የSMS አቅራቢ እንዲነቃ ይፈልጋል።",
    trust: "በኢትዮጵያ የተነደፈ · ለከባድ ንግድ ዝግጁ",
  },
  ti: {
    badge: "ብምትእምማን ጀምሩ",
    title: "ንዝዓቢ ውድብኩም ዝተሰርሐ ፕሪሚየም ስርዓት ንግዲ።",
    text: "ሽያጭ፣ ፋይናንስ፣ ስቶክን ዓማዊልን ኣብ ውሑስ መስርሒ ቦታ ብደቓይቕ ኣዋቕሩ።",
    owner: "ንዋና ድሉው",
    ownerText: "ቀዳማይ ዝተረጋገጸ ኣካውንት ምውቓር ይቆጻጸር",
    protected: "ውሽጣዊ ምክልኻል",
    protectedText: "ብደረጃ ውድብ ዝተፈልየ ዳታ",
    heading: "መስርሒ ቦታኹም ፍጠሩ",
    helper: "ብGoogle፣ Apple ጀምሩ ወይ ኣካውንት ውድብኩም ብቁጽሪ ሞባይል ኣረጋግጹ።",
    sms: "ምርግጋጽ ተሌፎን ኣብ Supabase ዝተነቕሐ SMS provider ይደሊ።",
    trust: "ኣብ ኢትዮጵያ ዝተነድፈ · ንዓቢ ንግዲ ድሉው",
  },
} as const;

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const c = localized.copy.auth;
  const p = premiumCopy[localized.language];
  const configured = isSupabaseConfigured();

  return (
    <main className="auth-page auth-premium-page auth-signup-page">
      <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
      <section className="auth-shell auth-shell-wide">
        <aside className="auth-showcase">
          <Link href="/" className="auth-showcase-brand"><span>H</span><strong>Hisab ERP</strong></Link>
          <div className="auth-showcase-content">
            <span className="auth-badge"><i/> {p.badge}</span>
            <h2>{p.title}</h2>
            <p>{p.text}</p>
            <div className="auth-benefits">
              <div><span className="benefit-icon">♢</span><strong>{p.owner}</strong><small>{p.ownerText}</small></div>
              <div><span className="benefit-icon">✓</span><strong>{p.protected}</strong><small>{p.protectedText}</small></div>
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
            <p className="eyebrow">{c.onboardingLabel}</p>
            <h1>{p.heading}</h1>
            <p>{p.helper}</p>
          </div>
          {!configured && <div className="form-alert warning">{c.supabaseMissing}</div>}
          {params.error && <div className="form-alert error">{params.error}</div>}
          <SocialAuthButtons language={localized.language} next="/onboarding" disabled={!configured}/>
          <form action={signUp} className="erp-form premium-auth-form premium-signup-form">
            <div className="identity-grid">
              <label className="premium-field"><span className="field-label">{c.fullName}</span><span className="field-control"><input name="fullName" autoComplete="name" required maxLength={120}/></span></label>
              <label className="premium-field"><span className="field-label">{c.organizationName}</span><span className="field-control"><input name="organizationName" autoComplete="organization" required maxLength={160}/></span></label>
            </div>
            <AuthCredentialsFields mode="sign-up" language={localized.language} passwordHelp={c.passwordHelp}/>
            <div className="sms-note"><span>✦</span><p>{p.sms}</p></div>
            <button className="primary auth-submit" type="submit" disabled={!configured}><span>{c.create}</span><b aria-hidden="true">→</b></button>
          </form>
          <p className="auth-switch">{c.existing} <Link href="/auth/login">{c.signIn}</Link></p>
        </section>
      </section>
    </main>
  );
}
