import Link from "next/link";
import { EmailAuthCard } from "../../../components/email-auth-card";

export const metadata = { title: "Verify email" };
export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <EmailAuthCard title="Check your email" description="Open the single-use verification link to continue to business onboarding." footer={<Link href="/auth/email-login">Return to sign in</Link>}><div className="form-alert success" role="status">A verification message was sent{email ? ` to ${email}` : ""}. The link expires according to the authentication policy.</div></EmailAuthCard>;
}
