"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BillingState = "processing" | "activating" | "verified" | "failed" | "error";

const copy: Record<BillingState, { eyebrow: string; title: string; description: string }> = {
  processing: {
    eyebrow: "Payment received by Stripe",
    title: "Confirming the signed payment event…",
    description: "HisabTech is waiting for Stripe’s verified webhook before activating your subscription.",
  },
  activating: {
    eyebrow: "Checkout complete",
    title: "Activating your HisabERP access…",
    description: "The payment is recorded. Your subscription ledger is being synchronized securely.",
  },
  verified: {
    eyebrow: "Subscription verified",
    title: "Your HisabERP workspace is ready.",
    description: "Stripe confirmation has been validated and your paid subscription is active.",
  },
  failed: {
    eyebrow: "Checkout not completed",
    title: "The subscription could not be activated.",
    description: "The checkout session expired or failed. No browser-only state was accepted as payment.",
  },
  error: {
    eyebrow: "Verification is taking longer",
    title: "Your payment status is still being checked.",
    description: "Open the billing center to review the latest verified status or contact HisabTech support.",
  },
};

export function BillingSuccessStatus({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<BillingState>("processing");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        const response = await fetch(`/api/billing/status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Status unavailable");
        const payload = await response.json() as { state?: BillingState };
        const nextState = payload.state || "processing";
        if (cancelled) return;
        setState(nextState);
        setAttempts((current) => current + 1);
        if (nextState === "verified" || nextState === "failed") return;
        timer = setTimeout(check, 1800);
      } catch {
        if (cancelled) return;
        setAttempts((current) => current + 1);
        timer = setTimeout(check, 2500);
      }
    }

    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  useEffect(() => {
    if (attempts >= 24 && state !== "verified" && state !== "failed") setState("error");
  }, [attempts, state]);

  const content = copy[state];
  return (
    <section className={`billing-success-card ${state}`} aria-live="polite">
      <div className="billing-verification-visual" aria-hidden="true"><span/><i/><b>{state === "verified" ? "✓" : state === "failed" ? "!" : "H"}</b></div>
      <span className="commerce-kicker">{content.eyebrow}</span>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      {state === "processing" || state === "activating" ? <div className="billing-verification-progress"><span/><small>Do not close this page while confirmation is in progress.</small></div> : null}
      <div className="billing-success-actions">
        {state === "verified" ? <Link href="/onboarding" className="commerce-primary">Continue to company setup <b aria-hidden="true">→</b></Link> : null}
        {state === "failed" ? <Link href="/pricing" className="commerce-primary">Return to pricing <b aria-hidden="true">→</b></Link> : null}
        {state === "error" ? <Link href="/billing" className="commerce-primary">Open billing center <b aria-hidden="true">→</b></Link> : null}
        <Link href="/" className="commerce-secondary">Go to HisabTech</Link>
      </div>
    </section>
  );
}
