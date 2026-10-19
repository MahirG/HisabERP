import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFile(path.join(root, f), "utf8");

test("website routes contact inquiries into the actual secure form", async () => {
  const chrome = await read("components/marketing-site-chrome.tsx");
  const page = await read("app/request-demo/page.tsx");
  assert.match(chrome, /Contact us", href: "\/request-demo\?source=contact"/);
  assert.match(chrome, /<Link href="\/request-demo\?source=contact">Contact us<\/Link>/);
  assert.match(page, /name="request_id"/);
  assert.match(page, /name="request_kind"/);
  assert.match(page, /Send inquiry/);
});

test("business notification reaches the intended address via Resend", async () => {
  const email = await read("lib/email/demo-request-email.ts");
  const action = await read("lib/actions/demo-request.ts");
  assert.match(email, /ADMIN_CONTACT_EMAIL = "mahir@hisabtech\.com"/);
  assert.match(email, /https:\/\/api\.resend\.com\/emails/);
  assert.match(email, /to: \[ADMIN_CONTACT_EMAIL\], reply_to: request.email/);
  assert.match(action, /sendDemoRequestEmail\(request, submissionId\)/);
});

test("customer receives branded receipt, and UI checks both sending outcomes", async () => {
  const email = await read("lib/email/demo-request-email.ts");
  const action = await read("lib/actions/demo-request.ts");
  const page = await read("app/request-demo/page.tsx");
  assert.match(email, /function sendDemoConfirmationEmail\(/);
  assert.match(email, /to: \[request.email\], reply_to: ADMIN_CONTACT_EMAIL/);
  assert.match(email, /Biloo ERP/);
  assert.match(email, /LOGO_URL/);
  assert.match(email, /Idempotency-Key/);
  assert.match(email, /submissionId}-customer/);
  assert.match(action, /sendDemoConfirmationEmail\(request, submissionId\)/);
  assert.match(action, /notification: deliveryResult.ok \? "sent" : "pending"/);
  assert.match(action, /confirmation: customerResult.ok \? "sent" : "pending"/);
  assert.match(page, /notificationSent/);
  assert.match(page, /confirmationSent/);
  assert.match(page, /mailto:mahir@hisabtech\.com/);
});

test("existing public mail links are normalized to the founder inbox", async () => {
  const controller = await read("components/marketing-experience-controller.tsx");
  assert.match(controller, /ADMIN_CONTACT_EMAIL = "mahir@hisabtech\.com"/);
});
