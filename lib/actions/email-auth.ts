"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appConfig, isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";
import { requiredText, safeNextPath, ValidationError } from "../validation";

const genericMessage = "If the account can receive email, we sent the next step.";

function normalizeEmail(value: FormDataEntryValue | null) {
  const email = requiredText(value, "email", 254).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError({ email: "Enter a valid email address." });
  return email;
}

function password(value: FormDataEntryValue | null, min = 10) {
  const result = requiredText(value, "password", 200);
  if (result.length < min || !/[a-z]/.test(result) || !/[A-Z]/.test(result) || !/\d/.test(result)) {
    throw new ValidationError({ password: `Use at least ${min} characters with uppercase, lowercase and a number.` });
  }
  return result;
}

async function requestMetadata() {
  const requestHeaders = await headers();
  return {
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: requestHeaders.get("user-agent")?.slice(0, 500) || null,
  };
}

export async function signUpWithEmail(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/email-sign-up?error=Authentication+is+not+configured");
  try {
    const email = normalizeEmail(formData.get("email"));
    const secret = password(formData.get("password"));
    const confirmation = requiredText(formData.get("confirmPassword"), "confirm password", 200);
    if (secret !== confirmation) throw new ValidationError({ confirmPassword: "Passwords must match." });
    const fullName = requiredText(formData.get("fullName"), "full name", 120);
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    redirect(`/auth/email-sign-up?error=${encodeURIComponent(message)}`);
  }
}

export async function signInWithEmail(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/email-login?error=Authentication+is+not+configured");
  const next = safeNextPath(formData.get("next"));
  try {
    const email = normalizeEmail(formData.get("email"));
    const secret = requiredText(formData.get("password"), "password", 200);
    const supabase = await createClient();
    const metadata = await requestMetadata();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: secret });
    if (error || !data.user) redirect(`/auth/email-login?error=${encodeURIComponent("The email or password is incorrect, or the account is not ready.")}&next=${encodeURIComponent(next)}`);
    await supabase.from("auth_audit_events").insert({
      user_id: data.user.id,
      event_type: "auth.sign_in.succeeded",
      ip_address: metadata.ip,
      user_agent: metadata.userAgent,
      metadata: { provider: "email" },
    });
    redirect(next);
  } catch {
    redirect(`/auth/email-login?error=${encodeURIComponent("The email or password is incorrect, or the account is not ready.")}&next=${encodeURIComponent(next)}`);
  }
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/forgot-password?error=Authentication+is+not+configured");
  try {
    const email = normalizeEmail(formData.get("email"));
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appConfig.appUrl}/auth/reset-password` });
  } catch {
    // Deliberately return the same response to prevent account enumeration.
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
    // Deliberately generic.
  }
  redirect(`/auth/magic-link?message=${encodeURIComponent(genericMessage)}`);
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/reset-password?error=Authentication+is+not+configured");
  try {
    const secret = password(formData.get("password"), 12);
    const confirmation = requiredText(formData.get("confirmPassword"), "confirm password", 200);
    if (secret !== confirmation) throw new ValidationError({ confirmPassword: "Passwords must match." });
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) redirect("/auth/invalid-link");
    const { error } = await supabase.auth.updateUser({ password: secret });
    if (error) redirect(`/auth/reset-password?error=${encodeURIComponent("The reset link is invalid or expired.")}`);
    await supabase.auth.signOut({ scope: "others" });
    redirect("/auth/login?message=Password+updated.+Sign+in+again+on+your+other+devices.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "The reset link is invalid or expired.";
    redirect(`/auth/reset-password?error=${encodeURIComponent(message)}`);
  }
}
