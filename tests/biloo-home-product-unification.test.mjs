import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("homepage-derived product layer loads after every public, authentication and workspace style", async () => {
  const layout = await read("app/layout.tsx");
  const productImport = 'import "./biloo-home-product-unification.css";';

  assert.ok(layout.includes(productImport));
  for (const earlierImport of [
    'import "./financial-workspace-foundation.css";',
    'import "./financial-workspace-components.css";',
    'import "./financial-dashboard.css";',
    'import "./biloo-black-gold-brand-system.css";',
    'import "./auth-login-award.css";',
    'import "./public-navigation-home-coherence.css";',
  ]) {
    assert.ok(layout.indexOf(productImport) > layout.indexOf(earlierImport), `${productImport} must load after ${earlierImport}`);
  }
});

test("authenticated product redesign covers the shell, dashboard, modules, forms and data surfaces", async () => {
  const styles = await read("app/biloo-home-product-unification.css");

  for (const color of ["#ffffff", "#e5e5e5", "#fca311", "#14213d", "#000000"]) {
    assert.ok(styles.toLowerCase().includes(color), `missing permanent Biloo color ${color}`);
  }

  for (const selector of [
    ".erp-shell",
    ".supabase-sidebar",
    ".workspace-command-header",
    ".workspace-page-header",
    ".workspace-section",
    ".financial-metric-grid",
    ".workspace-metric-tile",
    ".workspace-action-alert",
    ".revenue-line-chart",
    ".workspace-data-table",
    ".workspace-table-frame",
    ".sticky-user-popover",
    ".mobile-workspace-header",
    ".mobile-bottom-nav",
  ]) {
    assert.ok(styles.includes(selector), `missing signed-in product coverage for ${selector}`);
  }

  assert.match(styles, /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\)/);
  assert.match(styles, /\.core-tabs/);
  assert.match(styles, /\.modal-card/);
});

test("login and the remaining authentication flows share the homepage visual language", async () => {
  const [styles, login] = await Promise.all([
    read("app/biloo-home-product-unification.css"),
    read("app/auth/login/page.tsx"),
  ]);

  for (const selector of [
    ".biloo-login-page",
    ".biloo-login-visual",
    ".biloo-login-dashboard",
    ".biloo-login-card",
    ".biloo-login-input-shell",
    ".biloo-login-primary",
    ".auth-official-showcase",
    ".email-auth-card",
    ".mfa-required-card",
  ]) {
    assert.ok(styles.includes(selector), `missing authentication coverage for ${selector}`);
  }

  assert.ok(login.includes('className="biloo-login-shell"'));
  assert.ok(login.includes('className="biloo-login-dashboard"'));
  assert.ok(login.includes('className="biloo-login-card"'));
  assert.ok(login.includes("signInWithEmail"), "sign-in server action must remain intact");
  assert.ok(login.includes("SocialAuthButtons"), "social authentication must remain intact");
});

test("workspace shell uses Biloo identity while preserving session and MFA contracts", async () => {
  const shell = await read("components/workspace-shell.tsx");

  assert.ok(shell.includes('data-layout-version="biloo-home-product-v1"'));
  assert.ok(shell.includes('data-brand-experience="homepage-unified"'));
  assert.ok(shell.includes('aria-label="Biloo dashboard"'));
  assert.ok(shell.includes("Preparing your Biloo workspace"));
  assert.ok(shell.includes("Biloo requires authenticator MFA"));
  assert.ok(!shell.includes('aria-label="HisabTech dashboard"'));

  assert.ok(shell.includes('fetch("/api/session-context"'));
  assert.ok(shell.includes('user.mfaRequired && user.aal !== "aal2"'));
  assert.ok(shell.includes('<WorkspaceCommandCenter items={commandItems}'));
  assert.ok(shell.includes('<UserMenu user={user} />'));
});

test("unified product design includes responsive and reduced-motion safeguards", async () => {
  const styles = await read("app/biloo-home-product-unification.css");

  assert.match(styles, /@media \(max-width: 1100px\)/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 520px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /env\(safe-area-inset-top\)/);
});
