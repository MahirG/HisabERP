import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { signInWithEmail } from "../../../lib/actions/email-auth";

export const metadata = { title: "Email sign in" };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const p = await searchParams;
  return <EmailAuthCard title="Sign in with email" description="Use your verified business email and password." footer={<>New to HisabTech? <Link href="/auth/email-sign-up">Create an account</Link></>}><AuthNotice type="error">{p.error}</AuthNotice><AuthNotice type="success">{p.message}</AuthNotice><form action={signInWithEmail} className="erp-form premium-auth-form"><input type="hidden" name="next" value={p.next || "/"}/><label className="premium-field"><span className="field-label">Email</span><span className="field-control"><input name="email" type="email" autoComplete="email" required/></span></label><label className="premium-field"><span className="field-label">Password</span><span className="field-control"><input name="password" type="password" autoComplete="current-password" required/></span></label><div className="auth-switch"><Link href="/auth/forgot-password">Forgot password?</Link> · <Link href="/auth/magic-link">Use a magic link</Link></div><button className="primary auth-submit" type="submit">Sign in securely</button></form></EmailAuthCard>;
}
