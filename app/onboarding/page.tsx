import { LanguageSelector } from "../../components/language-provider";
import { bootstrapOrganization } from "../../lib/actions/erp";
import { getCurrentUserContext } from "../../lib/data/context";
import { getServerFoundationCopy } from "../../lib/server-locale";

export const metadata = { title: "Finish setup" };

export default async function OnboardingPage() {
  const [context, localized] = await Promise.all([getCurrentUserContext(), getServerFoundationCopy()]);
  const c = localized.copy.auth;
  if (context) return <main className="auth-page"><section className="auth-card"><div className="auth-top"><div/><LanguageSelector/></div><h1>{c.complete}</h1><a className="primary action-link" href="/">{c.openDashboard}</a></section></main>;
  return <main className="auth-page"><section className="auth-card"><div className="auth-top"><div/><LanguageSelector/></div><p className="eyebrow">{c.finalStep}</p><h1>{c.createOrg}</h1><p>{c.orgExplanation}</p><form action={bootstrapOrganization} className="erp-form"><label>{c.fullName}<input name="fullName" required/></label><label>{c.organizationName}<input name="organizationName" required/></label><label>{c.tin}<input name="tin"/></label><label>{c.phone}<input name="phone"/></label><button className="primary" type="submit">{c.finish}</button></form></section></main>;
}
