import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { resendEmailConfirmation } from "../../../lib/actions/email-auth";

export const metadata = { title: "Verify email" };

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string; error?: string; message?: string }> }) {
  const { email, error, message } = await searchParams;

  return (
    <EmailAuthCard
      title="Check your email"
      description="Open the single-use verification link to continue to business onboarding."
      footer={<Link href="/auth/login">Return to sign in</Link>}
    >
      <AuthNotice type="error">{error}</AuthNotice>
      <AuthNotice type="success">{message}</AuthNotice>
      {!message ? (
        <div className="form-alert success" role="status">
          If this address can be registered, a verification message was sent{email ? ` to ${email}` : ""}.
        </div>
      ) : null}
      {email ? (
        <form action={resendEmailConfirmation} className="erp-form premium-auth-form auth-verification-resend">
          <input type="hidden" name="email" value={email} />
          <button className="secondary auth-submit" type="submit">Resend verification email</button>
        </form>
      ) : null}
      <p className="auth-legal-note">The link is single-use. Check spam or junk folders before requesting another message.</p>
    </EmailAuthCard>
  );
}
