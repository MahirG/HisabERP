"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../config";
import { ADMIN_CONTACT_EMAIL, sendDemoConfirmationEmail, sendDemoRequestEmail } from "../email/demo-request-email";
import { createClient } from "../supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM_SIZES = new Set(["1-5", "6-20", "21-50", "51-200", "200+"]);
const CONTACT_METHODS = new Set(["phone", "email"]);
const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function value(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function fail(message: string): never {
  redirect(`/request-demo?error=${encodeURIComponent(message)}`);
}

export async function submitDemoRequest(formData: FormData) {
  // Never send email for honeypot submissions, or claim they were delivered.
  if (value(formData, "website", 200)) redirect("/");

  const fullName = value(formData, "full_name", 120);
  const businessName = value(formData, "business_name", 160);
  const email = value(formData, "email", 254).toLowerCase();
  const phone = value(formData, "phone", 32);
  const businessType = value(formData, "business_type", 80);
  const teamSize = value(formData, "team_size", 20);
  const preferredContact = value(formData, "preferred_contact", 20);
  const message = value(formData, "message", 2000);
  const requestContext = value(formData, "request_context", 300);
  const submittedId = value(formData, "request_id", 36);
  const submissionId = UUID_PATTERN.test(submittedId) ? submittedId : randomUUID();
  const isContact = value(formData, "request_kind", 12) === "contact";

  if (fullName.length < 2 || businessName.length < 2) fail("Please enter your name and business name.");
  if (!EMAIL_PATTERN.test(email)) fail("Please enter a valid business email address.");
  if (phone.length < 7) fail("Please enter a valid telephone number.");
  if (businessType.length < 2) fail("Please select your business type.");
  if (!TEAM_SIZES.has(teamSize)) fail("Please select your team size.");
  if (!CONTACT_METHODS.has(preferredContact)) fail("Please choose how we should contact you.");

  const request = { fullName, businessName, email, phone, businessType, teamSize, preferredContact, message, requestContext };

  // Saving the request and notifying the business are independent safety nets.
  // Never promise inbox delivery on a provider failure or a database-only success.
  const [deliveryResult, storageResult] = await Promise.all([
    sendDemoRequestEmail(request, submissionId),
    isSupabaseConfigured()
      ? createClient()
          .then((supabase) => supabase.from("demo_requests").insert({
            id: submissionId,
            full_name: fullName,
            business_name: businessName,
            email, phone, business_type: businessType, team_size: teamSize,
            preferred_contact: preferredContact,
            message: [requestContext ? `Context: ${requestContext}` : "", message].filter(Boolean).join("\n\n") || null,
          }))
          .catch(() => ({ error: { code: "storage_unavailable" } }))
      : Promise.resolve({ error: { code: "not_configured" } }),
  ]);

  if (storageResult.error) {
    console.error("biloo.contact.storage_failed", { code: storageResult.error.code });
  }

  const saved = !storageResult.error;
  if (!deliveryResult.ok && !saved) {
    fail(`We couldn't submit your request right now. Please email ${ADMIN_CONTACT_EMAIL} directly.`);
  }

  // Only acknowledge a request if it was accepted by the email provider or saved.
  const customerResult = await sendDemoConfirmationEmail(request, submissionId);
  const query = new URLSearchParams({
    submitted: "1",
    notification: deliveryResult.ok ? "sent" : "pending",
    confirmation: customerResult.ok ? "sent" : "pending",
    saved: saved ? "1" : "0",
  });
  if (isContact) query.set("source", "contact");
  redirect(`/request-demo?${query.toString()}`);
}
