"use server";

import { redirect } from "next/navigation";
import { appConfig, isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";
import { optionalText, requiredText, safeNextPath } from "../validation";

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/login?error=Supabase+is+not+configured");
  const email = requiredText(formData.get("email"), "email", 254).toLowerCase();
  const password = requiredText(formData.get("password"), "password", 200);
  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/auth/sign-up?error=Supabase+is+not+configured");
  const email = requiredText(formData.get("email"), "email", 254).toLowerCase();
  const password = requiredText(formData.get("password"), "password", 200);
  const fullName = requiredText(formData.get("fullName"), "fullName", 120);
  const organizationName = requiredText(formData.get("organizationName"), "organizationName", 160);
  const supabase = await createClient();
  const emailRedirectTo = `${appConfig.appUrl}/auth/callback?next=${encodeURIComponent("/onboarding")}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: fullName,
        organization_name: organizationName,
        phone: optionalText(formData.get("phone"), 40),
      },
    },
  });
  if (error) redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  if (data.session) redirect("/onboarding");
  redirect("/auth/login?message=Check+your+email+to+confirm+your+account");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/auth/login");
}
