import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { signUpWithEmail } from "../../../lib/actions/email-auth";

export const metadata = { title: "Create account with email" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const p = await searchParams;

  return (
    <EmailAuthCard
      title="Create your HisabTech account"
      description="Use your business email to create a verified identity for company setup and account recovery."
      footer={<>Already have an account? <Link href="/auth/email-login">Sign in</Link></>}
    >
      <AuthNotice type="error">{p.error}</AuthNotice>
      <AuthNotice type="success">{p.message}</AuthNotice>
      <form action={signUpWithEmail} className="erp-form premium-auth-form auth-official-form">
        <label className="premium-field" htmlFor="signup-full-name"><span className="field-label">Full name</span><span className="field-control"><input id="signup-full-name" name="fullName" autoComplete="name" maxLength={120} required/></span></label>
        <label className="premium-field" htmlFor="signup-email"><span className="field-label">Business email</span><span className="field-control"><input id="signup-email" name="email" type="email" autoComplete="email" required/></span></label>
        <label className="premium-field" htmlFor="signup-password"><span className="field-label">Password</span><span className="field-control"><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={10} required/></span><small>Use at least 10 characters with uppercase, lowercase and a number.</small></label>
        <label className="premium-field" htmlFor="signup-confirm-password"><span className="field-label">Confirm password</span><span className="field-control"><input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required/></span></label>
        <button className="primary auth-submit auth-primary-button" type="submit"><span>Create account</span><b aria-hidden="true">→</b></button>
      </form>
      <p className="auth-legal-note">By creating an account, you confirm that you are authorized to represent this business.</p>
    </EmailAuthCard>
  );
}
