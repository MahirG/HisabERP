import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Chapa checkout uses ETB and verifies every successful transaction server-side", async () => {
  const [catalog, chapa, signature, settlement, webhook, proxy, migration, env] = await Promise.all([
    read("lib/billing/catalog.ts"),
    read("lib/chapa/api.ts"),
    read("lib/chapa/webhook.ts"),
    read("lib/chapa/settlement.ts"),
    read("app/api/chapa/webhook/route.ts"),
    read("lib/supabase/proxy.ts"),
    read("supabase/migrations/20260724_hisab_chapa_billing_foundation.sql"),
    read(".env.example"),
  ]);

  assert.match(catalog, /monthlyAmountEtb:\s*1500/);
  assert.match(catalog, /annualAmountEtb:\s*95000/);
  assert.match(chapa, /https:\/\/api\.chapa\.co\/v1/);
  assert.match(chapa, /transaction\/initialize/);
  assert.match(chapa, /transaction\/verify/);
  assert.match(chapa, /currency:\s*"ETB"/);
  assert.match(signature, /x-chapa-signature/);
  assert.match(signature, /createHmac\("sha256"/);
  assert.match(settlement, /verifiedTxRef !== txRef/);
  assert.match(settlement, /currency !== "ETB"/);
  assert.match(settlement, /unexpected payment amount/);
  assert.match(settlement, /hisab_apply_chapa_transaction/);
  assert.match(webhook, /parseVerifiedChapaWebhook/);
  assert.match(webhook, /verifyAndApplyChapaPayment/);
  assert.match(proxy, /"\/api\/chapa\/webhook"/);
  assert.match(proxy, /hisab_billing_access/);
  assert.match(migration, /provider text not null default 'chapa'/);
  assert.match(migration, /Users can read their own Chapa payment attempts/);
  assert.match(migration, /No client access to Chapa webhook ledger/);
  assert.match(env, /CHAPA_SECRET_KEY=/);
  assert.match(env, /CHAPA_WEBHOOK_SECRET=/);
  assert.doesNotMatch(env, /STRIPE_/);
  assert.match(env, /BILLING_ENFORCEMENT_ENABLED=false/);
});

test("sign-up preserves checkout intent across every identity provider", async () => {
  const [signup, actions, verify, social] = await Promise.all([
    read("app/auth/email-sign-up/page.tsx"),
    read("lib/actions/email-auth.ts"),
    read("app/auth/verify-email/page.tsx"),
    read("components/social-auth-buttons.tsx"),
  ]);

  assert.match(signup, /<SocialAuthButtons/);
  assert.match(signup, /name="next"/);
  assert.match(signup, /getBillingPlan/);
  assert.match(signup, /Create account and continue/);
  assert.match(actions, /emailRedirectTo:\s*confirmationUrl\(next\)/);
  assert.match(actions, /formData\.get\("acceptedTerms"\) !== "yes"/);
  assert.match(actions, /auth\/verify-email\?email=.*next=/s);
  assert.match(verify, /name="next"/);
  assert.match(social, /value="apple"/);
  assert.match(social, /value="google"/);
});

test("paid-access UI states that Chapa renewal is manual", async () => {
  const [checkout, billing, success, status, pricing, userMenu, actions, orbit] = await Promise.all([
    read("app/checkout/page.tsx"),
    read("app/billing/page.tsx"),
    read("components/billing-success-status.tsx"),
    read("app/api/billing/status/route.ts"),
    read("components/pricing-experience.tsx"),
    read("components/user-menu.tsx"),
    read("lib/actions/billing.ts"),
    read("components/provider-orbit.tsx"),
  ]);

  assert.match(checkout, /createChapaCheckout/);
  assert.match(checkout, /does not authorize automatic recurring charges/);
  assert.match(billing, /Manual payment through Chapa/);
  assert.match(success, /api\/billing\/status\?tx_ref/);
  assert.match(success, /state === "verified"/);
  assert.match(status, /verifyAndApplyChapaPayment/);
  assert.match(pricing, /manual renewal · no automatic charge/);
  assert.match(userMenu, /Payments &amp; paid access/);
  assert.match(actions, /initializeChapaPayment/);
  assert.match(actions, /hisab_billing_payment_attempts/);
  assert.match(orbit, /provider-chapa/);
  assert.doesNotMatch(checkout + billing + success + status + pricing + userMenu + actions + orbit, /Stripe|stripe/);
});

test("premium Hisab mobile navigation and commercial motion remain accessible", async () => {
  const [menu, styles, layout] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/commercial-platform.css"),
    read("app/layout.tsx"),
  ]);

  assert.match(menu, /premium-mobile-menu/);
  assert.match(menu, /aria-modal="true"/);
  assert.match(menu, /event\.key === "Escape"/);
  assert.match(menu, /event\.key !== "Tab"/);
  assert.match(menu, /querySelectorAll<HTMLElement>/);
  assert.match(menu, /toggleButtonRef\.current\?\.focus/);
  assert.match(menu, /document\.body\.style\.overflow = "hidden"/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /--commerce-accent:\s*#DA7757/);
  assert.match(styles, /--commerce-ink:\s*#171717/);
  assert.match(layout, /import "\.\/commercial-platform\.css";/);
  assert.ok(layout.lastIndexOf("./commercial-platform.css") > layout.lastIndexOf("./home-imac-showcase.css"));
});


test("Billing access failures are not silently presented as unpaid records", async () => {
  const [data, page] = await Promise.all([read("lib/data/billing.ts"), read("app/billing/page.tsx")]);
  assert.match(data, /readError: boolean/);
  assert.match(data, /signedIn: boolean/);
  assert.match(data, /if \(error\) return \{ configured, enforcementEnabled, signedIn: true, readError: true, access: null \}/);
  assert.match(page, /Billing records are temporarily unavailable/);
  assert.match(page, /snapshot\.readError \? "Status unavailable"/);
  assert.match(page, /snapshot\.readError \? "Retry billing status"/);
});
test("Billing statuses and paid dates are truthful and readable", async () => {
  const source = await read("app/billing/page.tsx");
  assert.match(source, /billingGrantsAccess\(access\?\.status, access\?\.currentPeriodEnd\)/);
  assert.match(source, /access\?\.status === "active" \? "Expired"/);
  assert.match(source, /Number\.isFinite\(date\.getTime\(\)\)/);
  assert.match(source, /<strong>Provider: Chapa<\/strong>/);
  assert.doesNotMatch(source, /<strong>Chapa verified<\/strong>/);
  assert.match(source, /safeNextPath\(params\.next \|\| "\/workspace-home"\)/);
  assert.match(source, /Manual payment through Chapa/);
});
test("Billing UI is isolated to the route and uses responsive Biloo contrast", async () => {
  const [layout, css] = await Promise.all([read("app/billing/layout.tsx"),read("app/billing/billing-finish.css")]);
  assert.match(layout, /import "\.\/billing-finish\.css";/);
  for (const cls of ["billing-hero","billing-status","billing-grid","billing-price","billing-detail-card","billing-security-card","billing-card-actions"]) assert.match(css,new RegExp(cls));
  assert.match(css, /font-size:clamp\(27px,3\.2vw,36px\)/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /-webkit-text-fill-color/);
  assert.match(css, /min-height:44px/);
});
