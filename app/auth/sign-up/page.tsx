import Link from "next/link";
import { LanguageSelector } from "../../../components/language-provider";
import { signUp } from "../../../lib/actions/auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const c = localized.copy.auth;
  return <main className="auth-page"><section className="auth-card wide"><div className="auth-top"><Link href="/" className="auth-brand"><span>H</span><strong>Hisab ERP</strong></Link><LanguageSelector/></div><p className="eyebrow">{c.onboardingLabel}</p><h1>{c.signupTitle}</h1><p>{c.signupDescription}</p>{params.error && <div className="form-alert error">{params.error}</div>}<form action={signUp} className="erp-form two-column"><label>{c.fullName}<input name="fullName" required maxLength={120}/></label><label>{c.organizationName}<input name="organizationName" required maxLength={160}/></label><label>{c.email}<input name="email" type="email" autoComplete="email" required/></label><label>{c.phone}<input name="phone" type="tel" maxLength={40}/></label><label className="full">{c.password}<input name="password" type="password" autoComplete="new-password" minLength={10} required/><small>{c.passwordHelp}</small></label><button className="primary full" type="submit" disabled={!isSupabaseConfigured()}>{c.create}</button></form><p className="auth-switch">{c.existing} <Link href="/auth/login">{c.signIn}</Link></p></section></main>;
}
