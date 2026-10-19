import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("Signup preserves Supabase registration, plan checkout, terms and email confirmation", async () => {
  const [page,actions,shared] = await Promise.all([
    read("app/auth/email-sign-up/page.tsx"),read("lib/actions/email-auth.ts"),read("components/email-auth-card.tsx")
  ]);
  for(const item of ['action={signUpWithEmail}','getBillingPlan(p.plan)','getPlanAmountEtb(plan, billingCycle)',
    'name="acceptedTerms"','name="next" value={next}','safeNextPath(p.next || planDestination)',
    'type="email"','maxLength={254}','variant="sign-up"','SignUpPasswordFields']) {
    assert.ok(page.includes(item),item);
  }
  assert.ok(actions.includes("emailRedirectTo: confirmationUrl(next)"));
  assert.ok(actions.includes("assertPasswordIsSafe(secret)"));
  assert.ok(actions.includes("secret !== confirmation"));
  assert.ok(shared.includes('variant === "sign-up"'));
  assert.ok(!page.includes("autoFocus"));
});
test("Signup passwords have native controlled visibility without storing credentials", async () => {
  const source = await read("components/signup-password-fields.tsx");
  for(const item of ['name="password"','name="confirmPassword"','autoComplete="new-password"',
    'type={visible ? "text" : "password"}','aria-pressed={visible}','type="button"',
    'aria-describedby="signup-password-help"','minLength={10}']) assert.ok(source.includes(item),item);
  assert.ok(!source.includes("setPassword("));
});
test("Signup visual authority is isolated and mobile-friendly", async () => {
  const [layout,css] = await Promise.all([
    read("app/auth/email-sign-up/layout.tsx"),read("app/auth/email-sign-up/signup-finish.css")
  ]);
  assert.ok(layout.includes('import "./signup-finish.css"'));
  for(const item of ["auth-signup-biloo","auth-standard-shell","auth-standard-showcase","auth-standard-field-grid",
    "auth-standard-consent","auth-selected-plan","social-auth-grid",":focus-visible","font-size:16px",
    "@media(max-width:620px)","prefers-reduced-motion"]) assert.ok(css.includes(item),item);
  assert.ok(css.includes("#14213d") && css.includes("#fca311"));
});
