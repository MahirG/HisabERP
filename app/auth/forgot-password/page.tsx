import Link from "next/link";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { requestPasswordReset } from "../../../lib/actions/email-auth";

export const metadata = { title: "Forgot password" };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const p = await searchParams;
  return <EmailAuthCard title="Reset your password" description="Enter your email. The response is intentionally the same for every address." footer={<Link href="/auth/email-login">Back to sign in</Link>}><AuthNotice type="error">{p.error}</AuthNotice><AuthNotice type="success">{p.message}</AuthNotice><form action={requestPasswordReset} className="erp-form premium-auth-form"><label className="premium-field"><span className="field-label">Email</span><span className="field-control"><input name="email" type="email" autoComplete="email" required/></span></label><button className="primary auth-submit" type="submit">Send recovery link</button></form></EmailAuthCard>;
}
