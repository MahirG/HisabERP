"use client";

import { useEffect } from "react";
import Link from "next/link";

/** A failed business-data query must not produce an empty dashboard. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("biloo.dashboard.render_failed", { digest: error.digest || "unavailable" });
  }, [error]);

  return (
    <main className="biloo-dashboard-recovery" role="alert">
      <section className="biloo-dashboard-recovery-card" aria-labelledby="biloo-recovery-heading">
        <span className="biloo-dashboard-recovery-icon" aria-hidden="true">!</span>
        <p className="biloo-dashboard-recovery-eyebrow">Biloo workspace</p>
        <h1 id="biloo-recovery-heading">We couldn&apos;t load your dashboard</h1>
        <p>Your sign-in may already be complete, but business data is temporarily unavailable. Retry to load the latest records; no data has been changed.</p>
        <div className="biloo-dashboard-recovery-actions">
          <button type="button" onClick={() => reset()}>Retry dashboard</button>
          <Link href="/account">Account &amp; security</Link>
          <Link href="/help-center">Get help</Link>
        </div>
      </section>
    </main>
  );
}
