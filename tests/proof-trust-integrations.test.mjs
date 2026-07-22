import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("customer proof page avoids fabricated testimonials and exposes the reference program", async () => {
  const page = await read("app/customer-stories/page.tsx");
  const proof = await read("lib/marketing-customer-proof.ts");

  assert.match(page, /does not use invented company logos, fabricated testimonials or unsupported performance numbers/);
  assert.match(page, /Reference customer program/);
  assert.match(proof, /Verified business identity/);
  assert.match(proof, /Customer approval/);
  assert.match(proof, /Reference program open/);
});

test("Trust Center distinguishes implemented controls from dependencies and limitations", async () => {
  const page = await read("app/trust/page.tsx");
  const controls = await read("lib/marketing-trust.ts");

  assert.match(page, /HisabERP Trust Center/);
  for (const control of ["Privileged administrator MFA", "Business and authentication audit trails", "Browser and application security headers", "Leaked-password screening", "Point-in-time recovery"]) {
    assert.ok(controls.includes(control), `missing trust control: ${control}`);
  }
  for (const status of ["implemented", "configuration", "operational", "upgrade"]) {
    assert.ok(controls.includes(`status: "${status}"`), `missing trust status: ${status}`);
  }
  assert.match(page, /Shared responsibility/);
});

test("integrations directory uses explicit lifecycle statuses", async () => {
  const page = await read("app/integrations/page.tsx");
  const integrations = await read("lib/marketing-integrations.ts");

  for (const status of ["available", "configuration", "beta", "planned"]) {
    assert.ok(integrations.includes(`${status}:`), `missing integration status copy: ${status}`);
  }
  for (const integration of ["Supabase platform", "Google sign-in", "Apple sign-in", "telebirr reconciliation callbacks", "M-PESA Daraja reconciliation callbacks", "Audit CSV export", "Public REST API"]) {
    assert.ok(integrations.includes(integration), `missing integration: ${integration}`);
  }
  assert.match(page, /An integration becomes “Available” only after the complete path is verified/);
});

test("new marketing routes are public, shell-free and included in navigation and sitemap", async () => {
  const [proxy, shell, chrome, sitemap, home] = await Promise.all([
    read("lib/supabase/proxy.ts"),
    read("components/workspace-shell.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("app/sitemap.ts"),
    read("components/marketing-home.tsx"),
  ]);

  for (const route of ["/customer-stories", "/trust", "/integrations"]) {
    assert.ok(proxy.includes(`"${route}"`), `public route missing from proxy: ${route}`);
    assert.ok(shell.includes(`"${route}"`), `route missing from shell exclusions: ${route}`);
    assert.ok(chrome.includes(`href="${route}"`), `route missing from website navigation: ${route}`);
    assert.ok(sitemap.includes(`path: "${route}"`), `route missing from sitemap: ${route}`);
    assert.ok(home.includes(`href="${route}"`), `route missing from homepage: ${route}`);
  }
});

test("new marketing stylesheet loads before final brand enforcement", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);
  const featureStyles = imports.indexOf("proof-trust-integrations.css");
  const finalLock = imports.indexOf("brand-final-lock.css");

  assert.ok(featureStyles >= 0);
  assert.ok(finalLock > featureStyles);
});
