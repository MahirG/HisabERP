import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { signUpWithEmail } from "../../../lib/actions/email-auth";

export const metadata = { title: "Create your account" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; preview?: string }> }) {
  const p = await searchParams;
  const preview = p.preview === "1";

  return (
    <EmailAuthCard
      title="Create your HisabTech account"
      description="Set up your secure business identity. You will verify your email before creating your company workspace."
      footer={<>Already have an account? <Link href={`/auth/login${preview ? "?preview=1" : ""}`}>Sign in</Link></>}
      eyebrow="Start your business workspace"
      badge="Simple, secure account setup"
      showcaseTitle="Build a stronger operating foundation from day one."
      showcaseDescription="Create one verified identity, then configure your company, team and modules at your own pace."
    >
      <AuthNotice type="error">{p.error}</AuthNotice>
      <AuthNotice type="success">{p.message}</AuthNotice>

      <form action={signUpWithEmail} className="auth-standard-form">
        <label className="auth-standard-field" htmlFor="signup-full-name">
          <span>Full name</span>
          <input id="signup-full-name" name="fullName" autoComplete="name" maxLength={120} placeholder="Your full name" required autoFocus />
        </label>

        <label className="auth-standard-field" htmlFor="signup-email">
          <span>Business email</span>
          <input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" required />
        </label>

        <div className="auth-standard-field-grid">
          <label className="auth-standard-field" htmlFor="signup-password">
            <span>Password</span>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={10} placeholder="Create a password" aria-describedby="signup-password-help" required />
          </label>
          <label className="auth-standard-field" htmlFor="signup-confirm-password">
            <span>Confirm password</span>
            <input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} placeholder="Repeat your password" required />
          </label>
        </div>

        <p className="auth-standard-password-help" id="signup-password-help">Use at least 10 characters with uppercase, lowercase and a number.</p>

        <label className="auth-standard-consent">
          <input type="checkbox" name="acceptedTerms" value="yes" required />
          <span>I agree to the <Link href="/trust">privacy and security terms</Link> and confirm that I am authorized to represent this business.</span>
        </label>

        <button className="auth-standard-primary" type="submit"><span>Create account</span><b aria-hidden="true">→</b></button>
      </form>
    </EmailAuthCard>
  );
}
