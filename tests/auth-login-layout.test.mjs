import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("Biloo login preserves email, OAuth, password recovery and optional access routes", async () => {
  const [login, passwordField, social] = await Promise.all([
    read("app/auth/login/page.tsx"),
    read("components/login-password-field.tsx"),
    read("components/social-auth-buttons.tsx"),
  ]);
  for (const component of ["LoginPasswordField", "SocialAuthButtons", "action={signInWithEmail}", "auth/magic-link", "auth/phone-login", "auth/forgot-password", "auth/email-sign-up", 'name="next" value={next}', 'inputMode="email"', 'autoComplete="email"']) {
    assert.ok(login.includes(component), component);
  }
  assert.ok(login.includes('safeNextPath(params.next || "/workspace-home")'));
  assert.ok(!login.includes("autoFocus"), "Mobile navigation must not open the keyboard on entry");
  assert.ok(passwordField.includes('autoComplete="current-password"'));
  assert.ok(passwordField.includes("aria-pressed={visible}"));
  assert.ok(passwordField.includes('type="button"'));
  assert.ok(social.includes("if (!google && !apple) return null"));
  assert.ok(social.includes("signInWithOAuthProvider"));
});

test("Login introduction has a truthful static product hierarchy instead of demo financial KPIs", async () => {
  const login = await read("app/auth/login/page.tsx");
  assert.ok(login.includes("biloo-login-benefits"));
  for (const label of ["Sales and invoicing", "Finance and reporting", "Inventory and purchasing"]) assert.ok(login.includes(label));
  assert.ok(!login.includes("biloo-login-dashboard"));
  assert.ok(!login.includes("ETB 2.48M"));
  assert.ok(!login.includes("Business health"));
  assert.ok(login.includes("<h1>{p.title}</h1>"));
  assert.ok(login.includes('className="biloo-login-form-pane"'));
});

test("Login route owns readable Biloo typography and responsive interaction states", async () => {
  const [layout, styles] = await Promise.all([
    read("app/auth/login/layout.tsx"),
    read("app/auth/login/login-finish.css"),
  ]);
  assert.ok(layout.includes('import "./login-finish.css";'));
  for (const token of ["biloo-login-benefits", "biloo-login-heading h1", "biloo-login-input-shell", "social-auth-grid", "biloo-login-password-toggle", "biloo-login-primary", ":focus-visible", "-webkit-text-fill-color", "font-size:16px", "@media(max-width:620px)", "@media(prefers-reduced-motion:reduce)"]) {
    assert.ok(styles.includes(token), token);
  }
  assert.ok(styles.includes("--biloo-login-gold:#fca311"));
  assert.ok(styles.includes("--biloo-login-navy:#14213d"));
});
