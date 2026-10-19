import "server-only";

export const ADMIN_CONTACT_EMAIL = "mahir@hisabtech.com";
const SENDER = "Biloo ERP <notifications@hisabtech.com>";
const LOGO_URL = "https://hisabtech.com/biloo-header-logo.svg";

export type DemoRequestMessage = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  teamSize: string;
  preferredContact: string;
  message: string;
  requestContext: string;
};

export type DeliveryResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured" | "provider_error" | "network_error" };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function line(label: string, value: string) {
  return `<tr><td style="padding:10px 12px 10px 0;color:#667085;font-size:13px;font-weight:600;vertical-align:top;width:34%">${escapeHtml(label)}</td><td style="padding:10px 0;color:#14213d;font-size:14px;font-weight:600;vertical-align:top;overflow-wrap:anywhere">${escapeHtml(value || "Not provided")}</td></tr>`;
}

function frame(title: string, subtitle: string, inner: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#14213d">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${escapeHtml(subtitle)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:32px 12px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;border:1px solid #e3e8f0;border-radius:16px;overflow:hidden;background:#ffffff">
<tr><td style="background:#14213d;padding:25px 32px">
<img src="${LOGO_URL}" alt="Biloo ERP" width="108" style="display:block;max-width:108px;height:auto" />
<div style="color:#ffffff;font-size:13px;font-weight:800;letter-spacing:.4px;padding-top:8px">BILOO<span style="color:#fca311">.</span> <span style="color:#ccd6e6;font-size:10px;letter-spacing:1.4px">BY HISAB TECHNOLOGIES</span></div>
</td></tr>
<tr><td style="padding:32px 32px 18px">
<p style="margin:0 0 10px;color:#a76a08;font-weight:800;font-size:11px;letter-spacing:1.2px;text-transform:uppercase">Business communication</p>
<h1 style="margin:0 0 14px;font-size:27px;line-height:1.24;letter-spacing:-.5px">${escapeHtml(title)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#556277">${escapeHtml(subtitle)}</p>
${inner}
</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #e7ebf2;background:#fafbfd">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#14213d">Biloo ERP · Hisab Technologies</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#68758a">Addis Ababa, Ethiopia · <a href="mailto:${ADMIN_CONTACT_EMAIL}" style="color:#1463ff;text-decoration:underline">${ADMIN_CONTACT_EMAIL}</a><br><a href="https://hisabtech.com" style="color:#68758a">hisabtech.com</a></p>
</td></tr></table></td></tr></table></body></html>`;
}

function adminContent(request: DemoRequestMessage, reference: string) {
  const rows = [
    line("Contact name", request.fullName),
    line("Business", request.businessName),
    line("Email", request.email),
    line("Phone", request.phone),
    line("Business type", request.businessType),
    line("Team size", request.teamSize),
    line("Preferred contact", request.preferredContact),
    line("Origin", request.requestContext),
    line("Reference", reference),
  ].join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table>
<div style="border:1px solid #e4e9f2;background:#f7f9fd;border-radius:10px;padding:18px;margin:18px 0">
<strong style="font-size:12px;color:#596780;text-transform:uppercase;letter-spacing:1px">Customer message</strong>
<p style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.7;margin:10px 0 0;color:#14213d">${escapeHtml(request.message || "No additional message provided.")}</p></div>
<a href="mailto:${encodeURIComponent(request.email)}?subject=${encodeURIComponent("Re: Your Biloo inquiry")}" style="display:inline-block;padding:14px 20px;background:#1463ff;color:white;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px">Reply to customer</a>`;
}

function customerContent(request: DemoRequestMessage, reference: string) {
  return `<p style="margin:0 0 18px;color:#14213d;font-size:15px;line-height:1.7">Hello ${escapeHtml(request.fullName)},</p>
<p style="margin:0 0 18px;color:#556277;font-size:15px;line-height:1.7">Thank you for contacting Biloo ERP. Your inquiry about <strong style="color:#14213d">${escapeHtml(request.businessName)}</strong> has been received. Our team will review your request and get back to you through your preferred contact method.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fd;border:1px solid #e4e9f2;border-radius:10px"><tr><td style="padding:18px 20px">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#667085;font-weight:800;margin-bottom:7px">Your request reference</div>
<div style="font-size:15px;font-weight:800;color:#14213d">${escapeHtml(reference)}</div>
<div style="font-size:13px;color:#667085;margin-top:9px">Preferred reply: ${escapeHtml(request.preferredContact === "phone" ? "Phone" : "Email")}</div>
</td></tr></table>
<p style="color:#556277;font-size:14px;line-height:1.7;margin:22px 0">If you have additional details, simply reply to this email. Our team can also be reached at <a style="color:#1463ff" href="mailto:${ADMIN_CONTACT_EMAIL}">${ADMIN_CONTACT_EMAIL}</a>.</p>
<p style="color:#14213d;font-size:14px;line-height:1.7;margin:0">Kind regards,<br><strong>The Biloo Team</strong><br>Hisab Technologies</p>
<p style="color:#68758a;font-size:11px;margin:22px 0 0">You received this email because this address was entered in a Biloo inquiry form. If this wasn't you, please ignore it; we will never ask you to share a password by email.</p>`;
}

async function sendResendEmail(payload: {
  from: string; to: string[]; reply_to: string; subject: string; text: string; html: string;
}, key: string): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": key,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      // Provider errors may include customer details: log only a status code.
      console.error("biloo.contact.email_rejected", { status: response.status, purpose: key.endsWith("-customer") ? "customer" : "admin" });
      return { ok: false, reason: "provider_error" };
    }
    const data = await response.json().catch(() => null) as { id?: string } | null;
    if (typeof data?.id !== "string" || !data.id) {
      console.error("biloo.contact.email_invalid_provider_response");
      return { ok: false, reason: "provider_error" };
    }
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("biloo.contact.email_network_error", { name: error instanceof Error ? error.name : "UnknownError" });
    return { ok: false, reason: "network_error" };
  }
}

function fromAddress() {
  return process.env.DEMO_EMAIL_FROM?.trim() || SENDER;
}

export function sendDemoRequestEmail(request: DemoRequestMessage, submissionId: string) {
  const subject = `New Biloo inquiry — ${request.businessName}`;
  const text = [
    subject, "", `Name: ${request.fullName}`, `Company: ${request.businessName}`,
    `Customer email: ${request.email}`, `Phone: ${request.phone}`,
    `Business type: ${request.businessType}`, `Team size: ${request.teamSize}`,
    `Preferred contact: ${request.preferredContact}`, `Origin: ${request.requestContext}`,
    `Reference: ${submissionId}`, "", "Message:", request.message || "No additional message provided.",
  ].join("\n");
  return sendResendEmail({
    from: fromAddress(), to: [ADMIN_CONTACT_EMAIL], reply_to: request.email,
    subject, text, html: frame("New customer inquiry", "A customer contacted your business through the Biloo website.", adminContent(request, submissionId)),
  }, `biloo-inquiry-${submissionId}-admin`);
}

export function sendDemoConfirmationEmail(request: DemoRequestMessage, submissionId: string) {
  const subject = "We received your Biloo inquiry";
  const text = [
    `Hello ${request.fullName},`, "",
    "Thank you for contacting Biloo ERP. Your request has been received and our team will review it.",
    `Business: ${request.businessName}`, `Reference: ${submissionId}`,
    `Preferred reply: ${request.preferredContact}`, "",
    "You can reply to this email with additional details.", "",
    "Kind regards,", "The Biloo Team", "Hisab Technologies",
    ADMIN_CONTACT_EMAIL,
  ].join("\n");
  return sendResendEmail({
    from: fromAddress(), to: [request.email], reply_to: ADMIN_CONTACT_EMAIL,
    subject, text, html: frame("We received your message", "Thank you for contacting Biloo ERP. Our team will review your inquiry.", customerContent(request, submissionId)),
  }, `biloo-inquiry-${submissionId}-customer`);
}
