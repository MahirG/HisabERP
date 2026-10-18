"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AuthNotice, EmailAuthCard } from "../../../components/email-auth-card";
import { createClient } from "../../../lib/supabase/client";

const emailTypes = new Set<EmailOtpType>(["email", "signup", "magiclink", "recovery", "invite", "email_change"]);

function safeDestination(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) {
    return "/onboarding";
  }
  return value;
}

/**
 * Supabase-hosted emails can return credentials as URL fragments, PKCE codes,
 * or token hashes. Server routes cannot read URL fragments. Complete these in
 * the browser using the SSR-compatible Supabase client and its cookie store.
 */
export default function FinishAuthPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const url = new URL(window.location.href);
      const next = safeDestination(url.searchParams.get("next"));
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const otpType = url.searchParams.get("type") as EmailOtpType | null;
      const providerError = hash.get("error_description") || hash.get("error")
        || url.searchParams.get("error_description") || url.searchParams.get("error");

      // Do not leave bearer tokens or exchange codes in the history/address bar.
      for (const key of ["code", "token_hash", "type", "access_token", "refresh_token", "error_description", "error"]) {
        url.searchParams.delete(key);
      }
      window.history.replaceState(null, "", url.pathname + url.search);

      if (providerError) {
        if (!cancelled) setError("Your verification link expired or was rejected. Please request a new one.");
        return;
      }

      try {
        const supabase = createClient();
        let authError: Error | null = null;
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          authError = error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          authError = error;
        } else if (tokenHash && otpType && emailTypes.has(otpType)) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
          authError = error;
        }

        if (authError) throw authError;
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) throw new Error("No authenticated session was established");

        if (!cancelled) {
          router.replace(next);
          router.refresh();
        }
      } catch {
        if (!cancelled) setError("We couldn't finish your secure sign-in. Request a fresh email link and try again.");
      }
    }

    void finish();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <EmailAuthCard
      title={error ? "Link verification failed" : "Completing your secure sign-in"}
      description={error ? "Your account remains protected. Please use a fresh verification link." : "We're verifying your email and opening your Biloo workspace."}
      eyebrow="Biloo secure access"
      badge="Protected account verification"
      footer={<Link href="/auth/login">Return to sign in</Link>}
    >
      <AuthNotice type="error">{error}</AuthNotice>
      {!error ? <p role="status" aria-live="polite">Verifying securely…</p> : null}
      {error ? <p><Link href="/auth/forgot-password">Request a new recovery email</Link></p> : null}
    </EmailAuthCard>
  );
}
