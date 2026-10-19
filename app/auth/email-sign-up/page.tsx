import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { SocialAuthButtons } from "../../../components/social-auth-buttons";
import { SignUpPasswordFields } from "../../../components/signup-password-fields";
import { signUpWithEmail } from "../../../lib/actions/email-auth";
import { formatEtb, getBillingPlan, getPlanAmountEtb, isBillingCycle } from "../../../lib/billing/catalog";
import { isSupabaseConfigured } from "../../../lib/config";
import { safeNextPath } from "../../../lib/validation";

export const metadata = { title: "Create your account" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; preview?: string; plan?: string; billing?: string; next?: string }> }) {
  const p = await searchParams;
  const preview = p.preview === "1";
  const plan = getBillingPlan(p.plan);
  const billingCycle = isBillingCycle(p.billing) ? p.billing : "annual";
  const planDestination = plan ? `/checkout?plan=${plan.code}&billing=${billingCycle}` : "/onboarding";
  const next = safeNextPath(p.next || planDestination);
  const loginQuery = new URLSearchParams({ next });
  if (preview) loginQuery.set("preview", "1");
  const configured = isSupabaseConfigured();
  const errorMessage = typeof p.error === "string" ? p.error.slice(0, 360) : "";
  const successMessage = typeof p.message === "string" ? p.message.slice(0, 360) : "";

  return (
    <EmailAuthCard
      variant="sign-up"
      title="Create your Biloo account"
      description="Create your secure account, verify your email, and continue to your business workspace."
      footer={<>Already have an account? <Link href={`/auth/login?${loginQuery.toString()}`}>Sign in</Link></>}
      eyebrow="Secure Biloo registration"
      badge="One business. One connected workspace."
      showcaseTitle="One workspace. A clearer way to run your business."
      showcaseDescription="Bring sales, finance, inventory and everyday operations together with Biloo ERP."
    >
      {!configured ? <AuthNotice type="warning">Authentication is not configured.</AuthNotice> : null}
      <AuthNotice type="error">{errorMessage}</AuthNotice>
      <AuthNotice type="success">{successMessage}</AuthNotice>

      {plan ? (
        <div className="auth-selected-plan" aria-label={`Selected ${plan.name} plan`}>
          <span>Selected plan</span><strong>Biloo ERP {plan.name}</strong><small>ETB {formatEtb(getPlanAmountEtb(plan, billingCycle))} {billingCycle === "annual" ? "per year" : "per month"}</small>
        </div>
      ) : null}

      <SocialAuthButtons language="en" next={next} disabled={!configured} dividerText="or create your account with email" />

      <form action={signUpWithEmail} className="auth-standard-form">
        <input type="hidden" name="next" value={next}/>
        <label className="auth-standard-field" htmlFor="signup-full-name">
          <span>Full name</span>
          <input id="signup-full-name" name="fullName" autoComplete="name" maxLength={120} placeholder="Your full name" required />
        </label>

        <label className="auth-standard-field" htmlFor="signup-email">
          <span>Business email</span>
          <input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="name@company.com" required />
        </label>

        <SignUpPasswordFields />

        <label className="auth-standard-consent">
          <input type="checkbox" name="acceptedTerms" value="yes" required />
          <span>I agree to the <Link href="/trust">privacy and security terms</Link> and confirm that I am authorized to represent this business.</span>
        </label>

        <button className="auth-standard-primary" type="submit" disabled={!configured}><span>{plan ? `Create account and continue to ${plan.name}` : "Create account"}</span><b aria-hidden="true">→</b></button>
      </form>
    </EmailAuthCard>
  );
}
