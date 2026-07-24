import Link from "next/link";
import { BillingSuccessStatus } from "../../../components/billing-success-status";

export const metadata = { title: "Verifying subscription" };
export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId = "" } = await searchParams;
  const valid = /^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId);

  return (
    <main className="commerce-page billing-result-page">
      <header className="commerce-topbar">
        <Link href="/" className="commerce-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42"/><span><strong>HisabTech</strong><small>Subscription verification</small></span></Link>
        <Link href="/billing">Billing center</Link>
      </header>
      {valid ? <BillingSuccessStatus sessionId={sessionId}/> : (
        <section className="billing-success-card failed">
          <div className="billing-verification-visual" aria-hidden="true"><b>!</b></div>
          <span className="commerce-kicker">Invalid checkout return</span>
          <h1>This subscription link cannot be verified.</h1>
          <p>Open the billing center to review the authoritative subscription state associated with your account.</p>
          <div className="billing-success-actions"><Link href="/billing" className="commerce-primary">Open billing center <b aria-hidden="true">→</b></Link><Link href="/pricing" className="commerce-secondary">View pricing</Link></div>
        </section>
      )}
    </main>
  );
}
