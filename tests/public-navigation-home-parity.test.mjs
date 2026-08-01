import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const publicRoutes = [
  "app/product-tour/page.tsx",
  "app/industries/page.tsx",
  "app/pricing/page.tsx",
  "app/migration/page.tsx",
  "app/resources/page.tsx",
  "app/about/page.tsx",
  "app/help-center/page.tsx",
];

test("homepage parity layer is the final public marketing stylesheet", async () => {
  const layout = await read("app/layout.tsx");
  const coherence = 'import "./public-navigation-home-coherence.css";';
  const parity = 'import "./public-navigation-home-parity.css";';

  assert.ok(layout.includes(parity));
  assert.ok(layout.indexOf(parity) > layout.indexOf(coherence));
  assert.equal(layout.trim().includes('import "./biloo-home-product-unification.css";'), false);
});

test("all remaining public navigation pages continue through the shared marketing shell", async () => {
  for (const route of publicRoutes) {
    const page = await read(route);
    assert.match(page, /<MarketingPageShell>/, `${route} must use MarketingPageShell`);
  }
});

test("parity layer reproduces homepage brand, chrome, hero, cards, CTA and footer", async () => {
  const styles = await read("app/public-navigation-home-parity.css");
  const normalized = styles.toLowerCase();

  for (const color of ["#080a0d", "#14213d", "#0b1428", "#fca311", "#ffffff", "#e5e5e5"]) {
    assert.ok(normalized.includes(color), `missing homepage color ${color}`);
  }

  for (const selector of [
    ".marketing-nav-v2",
    '.marketing-desktop-nav a[aria-current="page"]',
    "#public-main-content > section:first-child",
    ".product-tour-hero-summary",
    ".industry-card-grid",
    ".pricing-plan-grid",
    ".migration-timeline",
    ".resources-grid",
    ".about-principles-grid",
    ".public-help-results",
    ".marketing-cta-v2",
    ".marketing-footer",
  ]) {
    assert.ok(styles.includes(selector), `missing homepage parity coverage for ${selector}`);
  }
});

test("public parity remains isolated from login and authenticated dashboard", async () => {
  const styles = await read("app/public-navigation-home-parity.css");

  assert.ok(styles.includes(".marketing-site-v2"));
  assert.equal(styles.includes(".biloo-login-page"), false);
  assert.equal(styles.includes(".erp-shell"), false);
  assert.equal(styles.includes(".workspace-command-center"), false);
  assert.equal(styles.includes(".dashboard-page"), false);
});

test("public parity supports desktop, tablet, phone and reduced motion", async () => {
  const styles = await read("app/public-navigation-home-parity.css");

  assert.match(styles, /@media \(max-width: 1120px\)/);
  assert.match(styles, /@media \(max-width: 820px\)/);
  assert.match(styles, /@media \(max-width: 620px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
