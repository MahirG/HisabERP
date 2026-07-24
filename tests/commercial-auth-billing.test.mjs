import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Stripe subscriptions use ETB hosted checkout and signed webhooks", async () => {
  const [catalog, stripe, webhook, proxy, migration, hardening, env] = await Promise.all([
    read("lib/billing/catalog.ts"),
    read("lib/stripe/api.ts"),
    read("app/api/stripe/webhook/route.ts"),
    read("lib/supabase/proxy.ts"),
    read("supabase/migrations/20260724_hisab_billing_foundation.sql"),
    read("supabase/migrations/20260724_hisab_billing_concurrency_hardening.sql"),
    read(".env.example"),
  ]);

  assert.match(catalog, /monthlyAmountEtb:\s*1500/);
  assert.match(catalog, /annualAmountEtb:\s*95000/);
  assert.match(stripe, /2026-06-24\.dahlia/);
  assert.match(stripe, /integration_identifier:\s*stripeIntegrationIdentifier\(\)/);
  assert.match(stripe, /STRIPE_INTEGRATION_IDENTIFIER/);
  assert.match(stripe, /currency\]":\s*"etb"/);
  assert.match(stripe, /mode:\s*"subscription"/);
  assert.doesNotMatch(stripe, /payment_method_types/);
  assert.match(stripe, /subscription_data\]\[metadata\]\[hisab_user_id\]/);
  assert.match(webhook, /parseVerifiedStripeEvent/);
  assert.match(webhook, /hisab_claim_stripe_webhook_event/);
  assert.match(webhook, /checkout\.session\.completed/);
  assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
  assert.match(webhook, /customer\.subscription\./);
  assert.match(webhook, /retrieveStripeSubscription\(subscriptionId\)/);
  assert.match(webhook, /invoice\.payment_failed/);
  assert.match(webhook, /Stripe Checkout Session is not registered for this Hisab user/);
  assert.doesNotMatch(webhook, /syncSubscription\(object as unknown as StripeSubscription/);
  assert.match(proxy, /"\/api\/stripe\/webhook"/);
  assert.match(migration, /enable row level security/gi);
  assert.match(migration, /Users can read their own Hisab subscription/);
  assert.match(migration, /revoke all on public\.hisab_billing_subscriptions from anon, authenticated/);
  assert.match(hardening, /hisab_billing_checkout_locks/);
  assert.match(hardening, /hisab_claim_checkout_lock/);
  assert.match(hardening, /hisab_attach_checkout_lock/);
  assert.match(hardening, /hisab_claim_stripe_webhook_event/);
  assert.match(hardening, /on conflict \(stripe_event_id\) do update/);
  assert.match(hardening, /updated_at <= now\(\) - v_lease/);
  assert.match(env, /STRIPE_SECRET_KEY=/);
  assert.match(env, /STRIPE_WEBHOOK_SECRET=/);
  assert.match(env, /STRIPE_API_VERSION=2026-06-24\.dahlia/);
  assert.match(env, /STRIPE_INTEGRATION_IDENTIFIER=hisaberp_checkout_[a-z]{8}/);
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

test("billing UI waits for webhook verification and checkout creation is serialized", async () => {
  const [checkout, billing, success, status, pricing, userMenu, actions] = await Promise.all([
    read("app/checkout/page.tsx"),
    read("app/billing/page.tsx"),
    read("components/billing-success-status.tsx"),
    read("app/api/billing/status/route.ts"),
    read("components/pricing-experience.tsx"),
    read("components/user-menu.tsx"),
    read("lib/actions/billing.ts"),
  ]);

  assert.match(checkout, /createSubscriptionCheckout/);
  assert.match(checkout, /webhook/);
  assert.match(billing, /openStripeBillingPortal/);
  assert.match(success, /api\/billing\/status/);
  assert.match(success, /state === "verified"/);
  assert.match(status, /subscriptionGrantsAccess/);
  assert.match(pricing, /\/checkout\?plan=\$\{plan\.code\}&billing=\$\{billing\}/);
  assert.match(userMenu, /Billing &amp; subscription/);
  assert.match(actions, /subscriptionGrantsAccess/);
  assert.match(actions, /retrieveStripeCheckoutSession/);
  assert.match(actions, /hisab_claim_checkout_lock/);
  assert.match(actions, /hisab_attach_checkout_lock/);
  assert.match(actions, /hisab-checkout-\$\{userId\}-\$\{claim\.checkout_token\}/);
  assert.doesNotMatch(actions, /minuteBucket/);
  assert.doesNotMatch(actions, /randomUUID/);
});

test("premium Hisab mobile navigation and commercial motion remain accessible", async () => {
  const [menu, orbit, styles, layout] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("components/provider-orbit.tsx"),
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
  assert.match(orbit, /provider-google/);
  assert.match(orbit, /provider-apple/);
  assert.match(orbit, /provider-stripe/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /--commerce-accent:\s*#DA7757/);
  assert.match(styles, /--commerce-ink:\s*#171717/);
  assert.match(layout, /import "\.\/commercial-platform\.css";/);
  assert.ok(layout.lastIndexOf("./commercial-platform.css") > layout.lastIndexOf("./home-imac-showcase.css"));
});
