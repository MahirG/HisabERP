import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminEmail = "mahir@hisabtech.com";

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("demo requests are emailed directly to the admin inbox", async () => {
  const emailDelivery = await source("lib/email/demo-request-email.ts");
  const action = await source("lib/actions/demo-request.ts");
  const requestPage = await source("app/request-demo/page.tsx");

  assert.match(emailDelivery, new RegExp(`ADMIN_CONTACT_EMAIL = ["']${adminEmail.replace(".", "\\.")}["']`));
  assert.match(emailDelivery, /https:\/\/api\.resend\.com\/emails/);
  assert.match(emailDelivery, /reply_to:\s*request\.email/);
  assert.match(action, /sendDemoRequestEmail\(request\)/);
  assert.match(action, /submitted=1&delivered=1/);
  assert.match(requestPage, /mailto:mahir@hisabtech\.com/);
});

test("all public admin mail links are normalized to Mahir", async () => {
  const controller = await source("components/marketing-experience-controller.tsx");

  assert.match(controller, /const ADMIN_CONTACT_EMAIL = "mahir@hisabtech\.com"/);
  assert.match(controller, /address !== "info@hisabtech\.com"/);
  assert.match(controller, /anchor\.href = `mailto:\$\{ADMIN_CONTACT_EMAIL\}/);
});
