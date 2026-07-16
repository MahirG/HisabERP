"use server";

import { redirect } from "next/navigation";
import { appConfig, isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";
import { requiredText, safeNextPath, ValidationError } from "../validation";

function errorMessage(error: unknown) {
  if (error instanceof ValidationError) return Object.values(error.fields)[0] || error.message;
  return error instanceof Error ? error.message : "We could not complete that request.";
}

function normalizePhone(countryCodeValue: FormDataEntryValue | null, phoneValue: FormDataEntryValue | null) {
  const countryCode = requiredText(countryCodeValue, "country code", 6).replace(/[^+\d]/g, "");
  let nationalNumber = requiredText(phoneValue, "phone number", 20).replace(/\D/g, "");

  if (!/^\+\d{1,4}$/.test(countryCode)) {
    throw new ValidationError({ phone: "Choose a valid country calling code." });
  }

  if (countryCode === "+251") {
    if (nationalNumber.startsWith("0")) nationalNumber = nationalNumber.slice(1);
    if (!/^9\d{8}$/.test(nationalNumber)) {
      throw new ValidationError({ phone: "Ethiopian mobile numbers must be 9 digits after +251 and start with 9." });
    }
  } else if (!/^\d{6,14}$/.test(nationalNumber)) {
    throw new ValidationError({ phone: "Enter a valid mobile number using 6 to 14 digits." });
  }

  return `${countryCode}${nationalNumber}`;
}

function readCredentials(formData: FormData, mode: "sign-in" | "sign-up") {
  const phone = normalizePhone(formData.get("countryCode"), formData.get("phone"));
  const password = requiredText(formData.get("password"), "password", 200);

  if (password.length < (mode === "sign-up" ? 10 : 8)) {
    throw new ValidationError({ password: `Password must contain at least ${mode === "sign-up" ? 10 : 8} characters.` });
  }

  if (mode === "sign-up") {
    const confirmation = requiredText(formData.get("confirmPassword"), "confirm password", 200);
    if (password !== confirmation) throw new ValidationError({ confirmPassword: "Passwords must match." });
  }

  return { phone, password };
}

export async function signInWithOAuthProvider(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/login?error=Supabase+is+not+configured");

  const providerValue = typeof formData.get("provider") === "string" ? String(formData.get("provider")) : "";
  const provider = providerValue === "google" || providerValue === "apple" ? providerValue : null;
  const next = safeNextPath(formData.get("next"));

  if (!provider) redirect("/auth/login?error=Unsupported+sign-in+provider");

  const supabase = await createClient();
  const redirectTo = `${appConfig.appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error || !data.url) {
    const message = error?.message || "The selected sign-in provider is not available.";
    redirect(`/auth/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(data.url);
}

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/login?error=Supabase+is+not+configured");

  let credentials: ReturnType<typeof readCredentials>;
  try {
    credentials = readCredentials(formData, "sign-in");
  } catch (error) {
    redirect(`/auth/login?error=${encodeURIComponent(errorMessage(error))}`);
  }

  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/sign-up?error=Supabase+is+not+configured");

  let credentials: ReturnType<typeof readCredentials>;
  let fullName: string;
  let organizationName: string;

  try {
    credentials = readCredentials(formData, "sign-up");
    fullName = requiredText(formData.get("fullName"), "full name", 120);
    organizationName = requiredText(formData.get("organizationName"), "organization name", 160);
  } catch (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(errorMessage(error))}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    phone: credentials.phone,
    password: credentials.password,
    options: {
      channel: "sms",
      data: {
        full_name: fullName,
        organization_name: organizationName,
        phone: credentials.phone,
      },
    },
  });

  if (error) redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  if (data.session) redirect("/onboarding");
  redirect(`/auth/verify-phone?phone=${encodeURIComponent(credentials.phone)}&message=${encodeURIComponent("Enter the 6-digit code sent to your phone.")}`);
}

export async function verifyPhoneOtp(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/verify-phone?error=Supabase+is+not+configured");

  let phone: string;
  let token: string;
  try {
    phone = requiredText(formData.get("phone"), "phone number", 20);
    token = requiredText(formData.get("token"), "verification code", 6).replace(/\D/g, "");
    if (!/^\+\d{7,15}$/.test(phone)) throw new ValidationError({ phone: "The phone number is invalid." });
    if (!/^\d{6}$/.test(token)) throw new ValidationError({ token: "Enter the 6-digit verification code." });
  } catch (error) {
    redirect(`/auth/verify-phone?phone=${encodeURIComponent(typeof formData.get("phone") === "string" ? String(formData.get("phone")) : "")}&error=${encodeURIComponent(errorMessage(error))}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) redirect(`/auth/verify-phone?phone=${encodeURIComponent(phone)}&error=${encodeURIComponent(error.message)}`);
  redirect("/onboarding");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/auth/login");
}
