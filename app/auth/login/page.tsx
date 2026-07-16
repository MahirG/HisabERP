import Link from "next/link";
import { LanguageSelector } from "../../../components/language-provider";
import { signIn } from "../../../lib/actions/auth";
import { isSupabaseConfigured } from "../../../lib/config";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const [params, localized] = await Promise.all([searchParams, getServerFoundationCopy()]);
  const c = localized.copy.auth;
  return <main className="auth-page"><section className="auth-card"><div className="auth-top"><Link href="/" className="auth-brand"><span>H</span><strong>Hisab ERP</strong></Link><LanguageSelector/></div><p className="eyebrow">{c.secureWorkspace}</p><h1>{c.loginTitle}</h1><p>{c.loginDescription}</p>{!isSupabaseConfigured() && <div className="form-alert warning">{c.supabaseMissing}</div>}{params.error && <div className="form-alert error">{params.error}</div>}{params.message && <div className="form-alert success">{params.message}</div>}<form action={signIn} className="erp-form"><input type="hidden" name="next" value={params.next || "/"}/><label>{c.email}<input name="email" type="email" autoComplete="email" required/></label><label>{c.password}<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label><button className="primary" type="submit" disabled={!isSupabaseConfigured()}>{c.signIn}</button></form><p className="auth-switch">{c.newUser} <Link href="/auth/sign-up">{c.createAccount}</Link></p></section></main>;
}
