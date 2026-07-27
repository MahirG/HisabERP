import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { appConfig, isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";
import { safeNextPath } from "../../../lib/validation";

export const metadata = { title: "Sign in" };

const loginCopy = {
  en: {
    title: "Welcome back",
    description: "Sign in with your business email to continue to your Biloo workspace.",
    email: "Business email",
    emailPlaceholder: "name@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Sign in to workspace",
    divider: "or continue with",
    magic: "Email me a secure sign-in link",
    forgot: "Forgot password?",
    phone: "Use mobile number instead",
    newUser: "New to Biloo?",
    create: "Create an account",
    passwordHelpTitle: "Need email and password access?",
    passwordHelp: "If this email was first registered with Google, create a password securely without creating a second account.",
    passwordHelpAction: "Create or reset email password",
    confirmationHelp: "Your email still needs verification before password sign-in is available.",
    confirmationAction: "Resend verification email",
  },
  am: {
    title: "እንኳን ደህና መጡ",
    description: "ወደ Biloo የሥራ ቦታዎ ለመቀጠል በንግድ ኢሜይልዎ ይግቡ።",
    email: "የንግድ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    submit: "ወደ የሥራ ቦታ ይግቡ",
    divider: "ወይም በዚህ ይቀጥሉ",
    magic: "የተጠበቀ መግቢያ ሊንክ በኢሜይል ይላኩልኝ",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    phone: "በሞባይል ቁጥር ይግቡ",
    newUser: "ለBiloo አዲስ ነዎት?",
    create: "መለያ ይፍጠሩ",
    passwordHelpTitle: "በኢሜይልና የይለፍ ቃል መግባት ይፈልጋሉ?",
    passwordHelp: "ይህ ኢሜይል በGoogle ከተመዘገበ፣ ሁለተኛ መለያ ሳይፈጥሩ የይለፍ ቃል ያዘጋጁ።",
    passwordHelpAction: "የኢሜይል የይለፍ ቃል ይፍጠሩ ወይም ይቀይሩ",
    confirmationHelp: "በይለፍ ቃል ከመግባትዎ በፊት ኢሜይልዎን ማረጋገጥ ያስፈልጋል።",
    confirmationAction: "የማረጋገጫ ኢሜይል እንደገና ይላኩ",
  },
  ti: {
    title: "እንቋዕ ብደሓን መጻእኩም",
    description: "ናብ Biloo መስርሒ ቦታኹም ንምቕጻል ብናይ ንግዲ ኢሜይልኩም እተዉ።",
    email: "ናይ ንግዲ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "መሕለፊ ቃል",
    passwordPlaceholder: "መሕለፊ ቃልኩም ኣእትዉ",
    submit: "ናብ መስርሒ ቦታ እተዉ",
    divider: "ወይ በዚ ቀጽሉ",
    magic: "ውሑስ መእተዊ ሊንክ ብኢሜይል ስደዱለይ",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    phone: "ብቁጽሪ ሞባይል እተዉ",
    newUser: "ኣብ Biloo ሓድሽ ዲኹም?",
    create: "ኣካውንት ፍጠሩ",
    passwordHelpTitle: "ብኢሜይልን መሕለፊ ቃልን ክትኣትዉ ትደልዩ?",
    passwordHelp: "እዚ ኢሜይል መጀመርታ ብGoogle እንተተመዝጊቡ፣ ካልእ ኣካውንት ከይፈጠርኩም መሕለፊ ቃል ኣዳልዉ።",
    passwordHelpAction: "ናይ ኢሜይል መሕለፊ ቃል ፍጠሩ ወይ ቀይሩ",
    confirmationHelp: "ብመሕለፊ ቃል ቅድሚ ምእታውኩም ኢሜይልኩም ክረጋገጽ ኣለዎ።",
    confirmationAction: "ናይ ምርግጋጽ ኢሜይል ደጊምኩም ስደዱ",
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
  const p = loginCopy[localized.language];
  const configured = isSupabaseConfigured();
  const next = safeNextPath(params.next || "/");
  const preview = params.preview === "1";
  const email = typeof params.email === "string" ? params.email.trim().slice(0, 254) : "";
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
    <EmailAuthCard
      title={p.title}
      description={p.description}
      footer={<>{p.newUser} <Link href={`/auth/email-sign-up?${signUpQuery.toString()}`}>{p.create}</Link></>}
      eyebrow="Secure workspace access"
      badge="Trusted access for your business"
      showcaseTitle="Your business, organized and ready when you are."
      showcaseDescription="Return to a single connected workspace for sales, finance, inventory, customers and reporting."
    >
      {!configured && <AuthNotice type="warning">Authentication is not configured.</AuthNotice>}
      <AuthNotice type="error">{params.error}</AuthNotice>
      <AuthNotice type="success">{params.message}</AuthNotice>

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

      <form action={signInWithEmail} className="auth-standard-form">
        <input type="hidden" name="next" value={next} />
        <label className="auth-standard-field" htmlFor="login-email">
          <span>{p.email}</span>
          <input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={p.emailPlaceholder} defaultValue={email} required autoFocus />
        </label>

        <label className="auth-standard-field" htmlFor="login-password">
          <span className="auth-standard-label-row"><b>{p.password}</b><Link href={`/auth/forgot-password?${resetQuery.toString()}`}>{p.forgot}</Link></span>
          <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder={p.passwordPlaceholder} required />
        </label>

        <button className="auth-standard-primary" type="submit" disabled={!configured}>
          <span>{p.submit}</span><b aria-hidden="true">→</b>
        </button>
      </form>

      <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider} />

      <div className="auth-standard-secondary-actions">
        <Link href={`/auth/magic-link?${magicQuery.toString()}`}>{p.magic}</Link>
        {appConfig.authProviders.phone ? <Link href={`/auth/phone-login?${phoneQuery.toString()}`}>{p.phone}</Link> : null}
      </div>
    </EmailAuthCard>
  );
}
