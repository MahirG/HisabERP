import Link from "next/link";
import { MfaSecurityPanel } from "../../components/mfa-security-panel";
import { signOut } from "../../lib/actions/auth";
import { getCurrentUserContext } from "../../lib/data/context";

export const metadata = { title: "Account & security" };
export const dynamic = "force-dynamic";

function initials(name: string) {
  const value = name.trim();
  if (!value) return "U";
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default async function AccountPage() {
  const user = await getCurrentUserContext({ required: true });
  if (!user) return null;

  return (
    <main className="security-account-page">
      <header className="security-account-hero">
        <div><p className="eyebrow">IDENTITY & ACCESS</p><h1>Account security</h1><p>Protect privileged ERP activity and review the identity currently connected to this workspace.</p></div>
        <div className="setup-top-actions"><Link className="secondary action-link" href="/security">Production controls</Link><form action={signOut}><button className="secondary" type="submit">Log out securely</button></form></div>
      </header>

      <section className="security-account-grid">
        <article className="security-identity-card">
          <span className="security-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}</span>
          <div><small>Signed in as</small><h2>{user.fullName}</h2><p>{user.email || "Verified HisabTech account"}</p></div>
          <dl>
            <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>
            <div><dt>Role</dt><dd>{user.role}</dd></div>
            <div><dt>Provider</dt><dd>{user.provider || "Supabase"}</dd></div>
            <div><dt>Session assurance</dt><dd>{user.aal.toUpperCase()}</dd></div>
            <div><dt>Account ID</dt><dd>{user.userId}</dd></div>
          </dl>
        </article>

        <MfaSecurityPanel organizationId={user.organizationId} required={user.mfaRequired} initialAal={user.aal} />
      </section>

      <section className="security-account-note">
        <strong>How administrator MFA works</strong>
        <p>Owners and administrators can read organization data after normal sign-in, but all privileged changes require a verified authenticator code. The database enforces the same rule even when a request bypasses the interface.</p>
      </section>
    </main>
  );
}
