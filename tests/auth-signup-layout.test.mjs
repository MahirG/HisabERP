import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("Signup reuses exact sign-in header, logo, content width and primary button classes",async()=>{
  const [login,shared,signup,layout,loginCss,signupCss] = await Promise.all([
    read("app/auth/login/page.tsx"),read("components/email-auth-card.tsx"),
    read("app/auth/email-sign-up/page.tsx"),read("app/auth/email-sign-up/layout.tsx"),
    read("app/auth/login/login-finish.css"),read("app/auth/email-sign-up/signup-finish.css"),
  ]);
  for(const klass of ["biloo-login-page","biloo-login-shell","biloo-login-visual","biloo-login-form-pane","biloo-login-topbar",
    "biloo-login-mobile-wordmark","biloo-login-form-wrap","biloo-login-card","biloo-login-heading",
    "biloo-login-primary","biloo-login-legal"]) {
    assert.ok(login.includes(klass), "sign-in must have "+klass);
    assert.ok(shared.includes(klass)||signup.includes(klass), "signup must have "+klass);
  }
  assert.ok(layout.includes('import "../login/login-finish.css"'));
  assert.ok(layout.includes('import "./signup-finish.css"'));
  assert.ok(shared.includes('href="/help-center"'));
  assert.ok(shared.includes('src="/biloo-header-logo.svg"'));
  assert.ok(signup.includes('className="biloo-login-form biloo-signup-form"'));
  assert.ok(signup.includes('className="biloo-login-primary"'));
  assert.ok(signupCss.includes("max-width:440px"));
  assert.ok(loginCss.includes("min-height:48px"));
  assert.ok(loginCss.includes("biloo-login-topbar"));
});
test("Registration preserves backend, plan and consent controls",async()=>{
  const [page,action,shared] = await Promise.all([
    read("app/auth/email-sign-up/page.tsx"),read("lib/actions/email-auth.ts"),read("components/email-auth-card.tsx")
  ]);
  for(const token of ['action={signUpWithEmail}','getBillingPlan(p.plan)','getPlanAmountEtb(plan, billingCycle)',
    'name="acceptedTerms"','name="next" value={next}','safeNextPath(p.next || planDestination)',
    'type="email"','maxLength={254}','variant="sign-up"','SignUpPasswordFields']) assert.ok(page.includes(token),token);
  assert.ok(action.includes("emailRedirectTo: confirmationUrl(next)"));
  assert.ok(action.includes("assertPasswordIsSafe(secret)"));
  assert.ok(action.includes("secret !== confirmation"));
  assert.ok(shared.includes('variant === "sign-up"'));
  assert.ok(!page.includes("autoFocus"));
});
test("New password controls share sign-in dimensions, are accessible, never store credentials",async()=>{
  const s=await read("components/signup-password-fields.tsx");
  for(const token of ['name="password"','name="confirmPassword"','type={visible ? "text" : "password"}',
    'aria-pressed={visible}','type="button"','aria-describedby="signup-password-help"','minLength={10}',
    'className="biloo-login-password-toggle"','className="biloo-login-input-shell biloo-login-password-shell"']) assert.ok(s.includes(token),token);
  assert.ok(!s.includes("setPassword("));
});

test("Signup uses the same icon slots and centers its form on narrow phones",async()=>{
  const [page,pw,sharedCss,css]=await Promise.all([
    read("app/auth/email-sign-up/page.tsx"),read("components/signup-password-fields.tsx"),
    read("app/auth/login/login-finish.css"),read("app/auth/email-sign-up/signup-finish.css")
  ]);
  assert.ok(page.includes('biloo-login-field-icon is-name'));
  assert.ok(page.includes('biloo-login-field-icon is-email'));
  assert.ok(pw.includes('biloo-login-field-icon is-password'));
  assert.ok(!pw.includes('biloo-signup-confirm-indicator'));
  assert.ok(sharedCss.includes('main.biloo-login-page .biloo-login-field .biloo-login-input-shell > input'));
  assert.ok(css.includes('width:calc(100% - 42px)!important'));
  assert.ok(css.includes('@media (max-width:620px)'));
});
