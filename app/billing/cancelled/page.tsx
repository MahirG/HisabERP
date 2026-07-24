import Link from "next/link";
import { getBillingPlan, isBillingCycle } from "../../../lib/billing/catalog";

export const metadata = { title: "Checkout cancelled" };

export default async function BillingCancelledPage({ searchParams }: { searchParams: Promise<{ plan?: string; billing?: string }> }) {
  const params = await searchParams;
  const plan = getBillingPlan(params.plan || "growth") || getBillingPlan("growth")!;
  const billing = isBillingCycle(params.billing) ? params.billing : "annual";

  return (
    <main className="commerce-page billing-result-page">
      <header className="commerce-topbar">
        <Link href="/" className="commerce-brand"><img src="/hisab-logo.svg" alt="" width="42" height="42"/><span><strong>HisabTech</strong><small>Secure checkout</small></span></Link>
        <Link href="/pricing">Pricing</Link>
      </header>
      <section className="billing-success-card cancelled">
        <div className="billing-verification-visual" aria-hidden="true"><b>×</b></div>
        <span className="commerce-kicker">Checkout cancelled safely</span>
        <h1>No subscription change was made.</h1>
        <p>Your {plan.name} checkout was closed before confirmation. HisabTech does not activate a plan or record a successful payment from a cancelled browser session.</p>
        <div className="billing-success-actions"><Link href={`/checkout?plan=${plan.code}&billing=${billing}`} className="commerce-primary">Return to secure checkout <b aria-hidden="true">→</b></Link><Link href="/pricing" className="commerce-secondary">Compare plans</Link></div>
      </section>
    </main>
  );
}
