import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { signUpWithEmail } from "../../../lib/actions/email-auth";

export const metadata = { title: "Create account with email" };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const p = await searchParams;
  return <EmailAuthCard title="Create your account" description="Verify your email before creating or joining a business." footer={<>Already registered? <Link href="/auth/email-login">Sign in</Link></>}><AuthNotice type="error">{p.error}</AuthNotice><AuthNotice type="success">{p.message}</AuthNotice><form action={signUpWithEmail} className="erp-form premium-auth-form"><label className="premium-field"><span className="field-label">Full name</span><span className="field-control"><input name="fullName" autoComplete="name" maxLength={120} required/></span></label><label className="premium-field"><span className="field-label">Email</span><span className="field-control"><input name="email" type="email" autoComplete="email" required/></span></label><label className="premium-field"><span className="field-label">Password</span><span className="field-control"><input name="password" type="password" autoComplete="new-password" minLength={10} required/></span><small>Use uppercase, lowercase and a number.</small></label><label className="premium-field"><span className="field-label">Confirm password</span><span className="field-control"><input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required/></span></label><button className="primary auth-submit" type="submit">Create secure account</button></form></EmailAuthCard>;
}
