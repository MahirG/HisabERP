import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { Icon } from "../../../components/ui/icon";
import { requestPasswordReset } from "../../../lib/actions/email-auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { safeNextPath } from "../../../lib/validation";

export const metadata = { title: "Create or reset password" };

type ForgotPasswordSearchParams = {
  error?: string;
  message?: string;
  email?: string;
  next?: string;
  preview?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<ForgotPasswordSearchParams> }) {
  const p = await searchParams;
  const configured = isSupabaseConfigured();
  const next = safeNextPath(p.next || "/");
  const email = typeof p.email === "string" ? p.email.trim().slice(0, 254) : "";
  const errorMessage = typeof p.error === "string" ? p.error.slice(0, 360) : "";
  const successMessage = typeof p.message === "string" ? p.message.slice(0, 360) : "";
  const loginQuery = new URLSearchParams({ next });
  if (p.preview === "1") loginQuery.set("preview", "1");
  if (email) loginQuery.set("email", email);

  return (
    <EmailAuthCard
      variant="recovery"
      title="Reset your password"
      description="Enter your business email and we'll send instructions to recover your Biloo account securely."
      footer={<Link href={`/auth/login?${loginQuery.toString()}`}>Back to sign in <Icon name="arrow-right" size={16} /></Link>}
      eyebrow="Secure workspace recovery"
      showcaseTitle="Your business continues where you left off."
      showcaseDescription="Recover access to your existing Biloo workspace without creating another account or losing your business records."
    >
      {!configured ? <AuthNotice type="warning">Authentication is not configured.</AuthNotice> : null}
      <AuthNotice type="error">{errorMessage}</AuthNotice>
      <AuthNotice type="success">{successMessage}</AuthNotice>
      <form action={requestPasswordReset} className="biloo-login-form">
        <input type="hidden" name="next" value={next} />
        <label className="biloo-login-field" htmlFor="recovery-email">
          <span>Business email</span>
          <div className="biloo-login-input-shell">
            <span className="biloo-login-field-icon is-email" aria-hidden="true"><Icon name="mail" size={18} /></span>
            <input id="recovery-email" name="email" type="email" inputMode="email"
              autoComplete="email" placeholder="name@company.com" defaultValue={email}
              required autoFocus />
          </div>
        </label>
        <button className="biloo-login-primary" type="submit" disabled={!configured}>
          <span>Send recovery link</span><Icon name="arrow-right" size={18} />
        </button>
      </form>
      <p className="biloo-recovery-privacy-note">
        <Icon name="shield-check" size={17} />
        For your privacy, the same confirmation appears whether or not an account exists for this address.
      </p>
    </EmailAuthCard>
  );
}
