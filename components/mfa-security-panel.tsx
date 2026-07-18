"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type MfaFactor = { id: string; friendly_name?: string | null; status: string; factor_type: string };
type Enrollment = { id: string; qr: string; secret: string };

export function MfaSecurityPanel({ organizationId, required, initialAal }: { organizationId: string; required: boolean; initialAal: "aal1" | "aal2" }) {
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [aal, setAal] = useState(initialAal);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshStatus() {
    const supabase = createClient();
    const [factorResult, assuranceResult] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    if (factorResult.error) throw factorResult.error;
    if (assuranceResult.error) throw assuranceResult.error;
    setFactors([...(factorResult.data.totp || []), ...(factorResult.data.phone || [])] as MfaFactor[]);
    setAal(assuranceResult.data.currentLevel === "aal2" ? "aal2" : "aal1");
  }

  useEffect(() => {
    refreshStatus().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load MFA status."));
  }, []);

  async function startEnrollment() {
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "HisabTech Authenticator" });
      if (enrollError) throw enrollError;
      setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start authenticator enrollment.");
    } finally { setBusy(false); }
  }

  async function verifyFactor(factorId: string, eventType: "auth.mfa.enrolled" | "auth.mfa.verified") {
    if (!/^\d{6,8}$/.test(code.trim())) { setError("Enter the current code from your authenticator app."); return; }
    setBusy(true); setError(""); setMessage("");
    const supabase = createClient();
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const verification = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code: code.trim() });
      if (verification.error) throw verification.error;
      await supabase.rpc("record_auth_audit", { p_event_type: eventType, p_organization_id: organizationId, p_metadata: { factor_type: "totp" } });
      setEnrollment(null); setCode(""); setMessage("Authenticator verification succeeded. Your privileged session is protected.");
      await refreshStatus();
      window.setTimeout(() => window.location.reload(), 600);
    } catch (reason) {
      await supabase.rpc("record_auth_audit", { p_event_type: "auth.mfa.challenge_failed", p_organization_id: organizationId, p_severity: "critical", p_metadata: { factor_type: "totp" } });
      setError(reason instanceof Error ? reason.message : "The verification code was not accepted.");
    } finally { setBusy(false); }
  }

  async function cancelEnrollment() {
    if (!enrollment) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: enrollment.id });
      setEnrollment(null); setCode("");
      await refreshStatus();
    } finally { setBusy(false); }
  }

  const verified = factors.filter((factor) => factor.status === "verified");
  const activeFactor = verified[0];
  const protectedSession = aal === "aal2";

  return (
    <section className="security-mfa-panel" aria-labelledby="mfa-heading">
      <div className="security-panel-head">
        <div><p className="eyebrow">ADMINISTRATOR PROTECTION</p><h2 id="mfa-heading">Authenticator MFA</h2></div>
        <span className={`control-state ${protectedSession ? "ready" : required ? "critical" : "attention"}`}>
          {protectedSession ? "AAL2 verified" : verified.length ? "Verification required" : required ? "Enrollment required" : "Optional"}
        </span>
      </div>
      <p className="control-description">Owner and administrator changes require a time-based code from an authenticator app. Read access remains available while a strong session is established.</p>
      {error ? <p className="control-message error" role="alert">{error}</p> : null}
      {message ? <p className="control-message success" role="status">{message}</p> : null}

      {enrollment ? (
        <div className="mfa-enrollment">
          <div className="mfa-qr"><img src={enrollment.qr} alt="Authenticator enrollment QR code" /></div>
          <div className="mfa-enrollment-copy">
            <strong>Scan with Google Authenticator, Microsoft Authenticator, 1Password or another TOTP app.</strong>
            <small>Manual key</small><code>{enrollment.secret}</code>
            <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="000000" /></label>
            <div className="control-actions"><button type="button" className="primary" disabled={busy} onClick={() => verifyFactor(enrollment.id, "auth.mfa.enrolled")}>Enable authenticator</button><button type="button" disabled={busy} onClick={cancelEnrollment}>Cancel</button></div>
          </div>
        </div>
      ) : !verified.length ? (
        <button type="button" className="primary" disabled={busy} onClick={startEnrollment}>Set up authenticator MFA</button>
      ) : !protectedSession && activeFactor ? (
        <div className="mfa-challenge"><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="000000" /></label><button type="button" className="primary" disabled={busy} onClick={() => verifyFactor(activeFactor.id, "auth.mfa.verified")}>Verify this session</button></div>
      ) : (
        <div className="mfa-ready"><span>✓</span><div><strong>Strong administrator session active</strong><small>{verified.length} verified factor{verified.length === 1 ? "" : "s"} enrolled.</small></div></div>
      )}
    </section>
  );
}
