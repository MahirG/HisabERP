"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM_SIZES = new Set(["1-5", "6-20", "21-50", "51-200", "200+"]);
const CONTACT_METHODS = new Set(["phone", "email"]);

function value(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function fail(message: string): never {
  redirect(`/request-demo?error=${encodeURIComponent(message)}`);
}

export async function submitDemoRequest(formData: FormData) {
  const honeypot = value(formData, "website", 200);
  if (honeypot) redirect("/request-demo?submitted=1");

  const fullName = value(formData, "full_name", 120);
  const businessName = value(formData, "business_name", 160);
  const email = value(formData, "email", 254).toLowerCase();
  const phone = value(formData, "phone", 32);
  const businessType = value(formData, "business_type", 80);
  const teamSize = value(formData, "team_size", 20);
  const preferredContact = value(formData, "preferred_contact", 20);
  const message = value(formData, "message", 2000);

  if (fullName.length < 2 || businessName.length < 2) fail("Please enter your name and business name.");
  if (!EMAIL_PATTERN.test(email)) fail("Please enter a valid business email address.");
  if (phone.length < 7) fail("Please enter a valid telephone number.");
  if (businessType.length < 2) fail("Please select your business type.");
  if (!TEAM_SIZES.has(teamSize)) fail("Please select your team size.");
  if (!CONTACT_METHODS.has(preferredContact)) fail("Please choose how we should contact you.");
  if (!isSupabaseConfigured()) fail("Demo requests are temporarily unavailable. Please email mahir@hisabtech.com.");

  const supabase = await createClient();
  const { error } = await supabase.from("demo_requests").insert({
    full_name: fullName,
    business_name: businessName,
    email,
    phone,
    business_type: businessType,
    team_size: teamSize,
    preferred_contact: preferredContact,
    message: message || null,
  });

  if (error) {
    console.error("Demo request submission failed", { code: error.code });
    fail("We could not save your request. Please try again or email mahir@hisabtech.com.");
  }

  redirect("/request-demo?submitted=1");
}
