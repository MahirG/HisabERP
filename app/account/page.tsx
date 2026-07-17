import Link from "next/link";
import { signOut } from "../../lib/actions/auth";
import { getCurrentUserContext } from "../../lib/data/context";

export const metadata = { title: "Account & security" };
export const dynamic = "force-dynamic";

function initials(name: string) {
  const value = name.trim();
  if (!value) return "U";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function providerLabel(provider: string | null) {
  if (provider === "google") return "Google OAuth";
  if (provider === "apple") return "Apple OAuth";
  if (provider === "phone") return "Mobile number and password";
  return "Supabase secure session";
}

export default async function AccountPage() {
  const user = await getCurrentUserContext({ required: true });
  if (!user) return null;

  return (
    <main className="account-page">
      <div className="account-shell">
        <Link className="account-back" href="/">← Back to dashboard</Link>

        <section className="account-card">
          <header className="account-hero">
            <div className="account-avatar" aria-hidden="true">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.fullName)}
            </div>
            <div>
              <p>Authenticated user</p>
              <h1>{user.fullName}</h1>
              <span>{user.email || "Verified Hisab ERP account"}</span>
            </div>
          </header>

          <div className="account-body">
            <div className="account-grid">
              <div className="account-field"><span>Full name</span><strong>{user.fullName}</strong></div>
              <div className="account-field"><span>Email address</span><strong>{user.email || "Not provided"}</strong></div>
              <div className="account-field"><span>Organization</span><strong>{user.organizationName}</strong></div>
              <div className="account-field"><span>Workspace role</span><strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong></div>
              <div className="account-field"><span>Authentication</span><strong>{providerLabel(user.provider)}</strong></div>
              <div className="account-field"><span>Account ID</span><strong>{user.userId}</strong></div>
            </div>

            <div className="account-security">
              <div>
                <strong>Your session is protected</strong>
                <span>Hisab ERP verifies your Supabase session before allowing access to company data and protected routes.</span>
              </div>
              <span>● Active session</span>
            </div>

            <div className="account-actions">
              <Link href="/">Return to dashboard</Link>
              <form action={signOut}><button type="submit">Log out securely</button></form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
