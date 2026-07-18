"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appConfig, isSupabaseConfigured } from "../config";
import { assertPasswordIsSafe } from "../security/password-safety";
import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { requiredText, safeNextPath, ValidationError } from "../validation";

const genericMessage = "If the account can receive email, we sent the next step.";
const genericLoginError = "The email or password is incorrect, or the account is not ready.";

function normalizeEmail(value: FormDataEntryValue | null) {
  const email = requiredText(value, "email", 254).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError({ email: "Enter a valid email address." });
  return email;
}

function readPassword(value: FormDataEntryValue | null, min = 10) {
  const result = requiredText(value, "password", 200);
  if (result.length < min || !/[a-z]/.test(result) || !/[A-Z]/.test(result) || !/\d/.test(result)) {
    throw new ValidationError({ password: `Use at least ${min} characters with uppercase, lowercase and a number.` });
  }
  return result;
}

function validationMessage(error: unknown, fallback: string) {
  return error instanceof ValidationError ? Object.values(error.fields)[0] || error.message : fallback;
}

async function requestMetadata() {
  const requestHeaders = await headers();
  return {
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: requestHeaders.get("user-agent")?.slice(0, 500) || null,
  };
}

async function recordLoginAttempt(email: string, succeeded: boolean, userId: string | null, reason: string | null, metadata: Awaited<ReturnType<typeof requestMetadata>>) {
  try {
    const admin = createAdminClient();
    await admin.from("login_attempts").insert({
      user_id: userId,
      identifier_hash: createHash("sha256").update(email).digest("hex"),
      succeeded,
      failure_reason: reason,
      ip_address: metadata.ip,
      user_agent: metadata.userAgent,
    });
  } catch {
    // The optional service-role audit path must never disclose account state or block authentication.
  }
}

export async function signUpWithEmail(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/email-sign-up?error=Authentication+is+not+configured");

  let email: string;
  let secret: string;
  let fullName: string;
  try {
    email = normalizeEmail(formData.get("email"));
    secret = readPassword(formData.get("password"));
    await assertPasswordIsSafe(secret);
    const confirmation = requiredText(formData.get("confirmPassword"), "confirm password", 200);
    if (secret !== confirmation) throw new ValidationError({ confirmPassword: "Passwords must match." });
    fullName = requiredText(formData.get("fullName"), "full name", 120);
  } catch (error) {
    redirect(`/auth/email-sign-up?error=${encodeURIComponent(validationMessage(error, "Check the form and try again."))}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: secret,
    options: {
      emailRedirectTo: `${appConfig.appUrl}/auth/callback?next=${encodeURIComponent("/onboarding")}`,
      data: { full_name: fullName },
    },
  });
  if (error) redirect(`/auth/email-sign-up?message=${encodeURIComponent(genericMessage)}`);
  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}

export async function signInWithEmail(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/email-login?error=Authentication+is+not+configured");
  const next = safeNextPath(formData.get("next"));

  let email: string;
  let secret: string;
  try {
    email = normalizeEmail(formData.get("email"));
    secret = requiredText(formData.get("password"), "password", 200);
  } catch {
    redirect(`/auth/email-login?error=${encodeURIComponent(genericLoginError)}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const metadata = await requestMetadata();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: secret });
  if (error || !data.user) {
    await recordLoginAttempt(email, false, null, "invalid_credentials", metadata);
    redirect(`/auth/email-login?error=${encodeURIComponent(genericLoginError)}&next=${encodeURIComponent(next)}`);
  }

  await recordLoginAttempt(email, true, data.user.id, null, metadata);
  const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", data.user.id).eq("is_active", true).order("is_default", { ascending: false }).limit(1).maybeSingle();
  await supabase.rpc("record_auth_audit", {
    p_event_type: "auth.sign_in.succeeded",
    p_organization_id: membership?.organization_id || null,
    p_ip_address: metadata.ip,
    p_user_agent: metadata.userAgent,
    p_metadata: { provider: "email" },
  });
  redirect(next);
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/forgot-password?error=Authentication+is+not+configured");
  try {
    const email = normalizeEmail(formData.get("email"));
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appConfig.appUrl}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
    });
  } catch {
    // Deliberately identical response to prevent account enumeration.
  }
  redirect(`/auth/forgot-password?message=${encodeURIComponent(genericMessage)}`);
}

export async function requestMagicLink(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/magic-link?error=Authentication+is+not+configured");
  try {
    const email = normalizeEmail(formData.get("email"));
    const next = safeNextPath(formData.get("next"));
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appConfig.appUrl}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: false },
    });
  } catch {
    // Deliberately identical response to prevent account enumeration.
  }
  redirect(`/auth/magic-link?message=${encodeURIComponent(genericMessage)}`);
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/reset-password?error=Authentication+is+not+configured");

  let secret: string;
  try {
    secret = readPassword(formData.get("password"), 12);
    await assertPasswordIsSafe(secret);
    const confirmation = requiredText(formData.get("confirmPassword"), "confirm password", 200);
    if (secret !== confirmation) throw new ValidationError({ confirmPassword: "Passwords must match." });
  } catch (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(validationMessage(error, "Check the new password and try again."))}`);
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/auth/invalid-link");
  const { error } = await supabase.auth.updateUser({ password: secret });
  if (error) redirect(`/auth/reset-password?error=${encodeURIComponent("The reset link is invalid or expired.")}`);
  await supabase.rpc("record_auth_audit", { p_event_type: "auth.password.changed", p_metadata: { source: "recovery" } });
  await supabase.auth.signOut({ scope: "others" });
  redirect("/auth/login?message=Password+updated.+Other+sessions+were+signed+out.");
}
