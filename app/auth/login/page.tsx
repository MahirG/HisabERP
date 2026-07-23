import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { signInWithEmail } from "../../../lib/actions/email-auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

const loginCopy = {
  en: {
    title: "Welcome back",
    description: "Sign in with your business email to continue to your HisabTech workspace.",
    email: "Business email",
    emailPlaceholder: "name@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Sign in to workspace",
    divider: "or continue with",
    magic: "Email me a secure sign-in link",
    forgot: "Forgot password?",
    phone: "Use mobile number instead",
    newUser: "New to HisabTech?",
    create: "Create an account",
  },
  am: {
    title: "እንኳን ደህና መጡ",
    description: "ወደ HisabTech የሥራ ቦታዎ ለመቀጠል በንግድ ኢሜይልዎ ይግቡ።",
    email: "የንግድ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    submit: "ወደ የሥራ ቦታ ይግቡ",
    divider: "ወይም በዚህ ይቀጥሉ",
    magic: "የተጠበቀ መግቢያ ሊንክ በኢሜይል ይላኩልኝ",
    forgot: "የይለፍ ቃልዎን ረሱ?",
    phone: "በሞባይል ቁጥር ይግቡ",
    newUser: "ለHisabTech አዲስ ነዎት?",
    create: "መለያ ይፍጠሩ",
  },
  ti: {
    title: "እንቋዕ ብደሓን መጻእኩም",
    description: "ናብ HisabTech መስርሒ ቦታኹም ንምቕጻል ብናይ ንግዲ ኢሜይልኩም እተዉ።",
    email: "ናይ ንግዲ ኢሜይል",
    emailPlaceholder: "name@company.com",
    password: "መሕለፊ ቃል",
    passwordPlaceholder: "መሕለፊ ቃልኩም ኣእትዉ",
    submit: "ናብ መስርሒ ቦታ እተዉ",
    divider: "ወይ በዚ ቀጽሉ",
    magic: "ውሑስ መእተዊ ሊንክ ብኢሜይል ስደዱለይ",
    forgot: "መሕለፊ ቃልኩም ረሲዕኩም?",
    phone: "ብቁጽሪ ሞባይል እተዉ",
    newUser: "ኣብ HisabTech ሓድሽ ዲኹም?",
    create: "ኣካውንት ፍጠሩ",
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
    <EmailAuthCard
      title={p.title}
      description={p.description}
      footer={<>{p.newUser} <Link href={signUpHref}>{p.create}</Link></>}
      eyebrow="Secure workspace access"
      badge="Trusted access for your business"
      showcaseTitle="Your business, organized and ready when you are."
      showcaseDescription="Return to a single connected workspace for sales, finance, inventory, customers and reporting."
    >
      {!configured && <AuthNotice type="warning">Authentication is not configured.</AuthNotice>}
      <AuthNotice type="error">{params.error}</AuthNotice>
      <AuthNotice type="success">{params.message}</AuthNotice>

      <form action={signInWithEmail} className="auth-standard-form">
        <input type="hidden" name="next" value={next} />
        <label className="auth-standard-field" htmlFor="login-email">
          <span>{p.email}</span>
          <input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={p.emailPlaceholder} required autoFocus />
        </label>

        <label className="auth-standard-field" htmlFor="login-password">
          <span className="auth-standard-label-row"><b>{p.password}</b><Link href={`/auth/forgot-password${preview ? "?preview=1" : ""}`}>{p.forgot}</Link></span>
          <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder={p.passwordPlaceholder} required />
        </label>

        <button className="auth-standard-primary" type="submit" disabled={!configured}>
          <span>{p.submit}</span><b aria-hidden="true">→</b>
        </button>
      </form>

      <SocialAuthButtons language={localized.language} next={next} disabled={!configured} dividerText={p.divider} />

      <div className="auth-standard-secondary-actions">
        <Link href={`/auth/magic-link?next=${encodeURIComponent(next)}${previewQuery}`}>{p.magic}</Link>
        <Link href={`/auth/phone-login?next=${encodeURIComponent(next)}${previewQuery}`}>{p.phone}</Link>
      </div>
    </EmailAuthCard>
  );
}
