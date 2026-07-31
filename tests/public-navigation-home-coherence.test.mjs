import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const navigationPages = [
  ["app/product-tour/page.tsx", "marketing-page-hero"],
  ["app/industries/page.tsx", "industry-index-hero"],
  ["app/pricing/page.tsx", "pricing-hero"],
  ["app/migration/page.tsx", "migration-hero"],
  ["app/resources/page.tsx", "resources-hero"],
  ["app/about/page.tsx", "about-hero"],
  ["app/help-center/page.tsx", "help-public-hero"],
];

test("homepage-coherent navigation design loads after all legacy public styles", async () => {
  const layout = await read("app/layout.tsx");
  const blackGoldImport = 'import "./biloo-black-gold-brand-system.css";';
  const authAwardImport = 'import "./auth-login-award.css";';
  const navigationImport = 'import "./public-navigation-home-coherence.css";';

  assert.ok(layout.includes(navigationImport));
  assert.ok(layout.indexOf(navigationImport) > layout.indexOf(blackGoldImport));
  assert.ok(layout.indexOf(navigationImport) > layout.indexOf(authAwardImport));
});

test("every remaining top-level navigation route uses the shared marketing shell and a covered hero", async () => {
  const styles = await read("app/public-navigation-home-coherence.css");

  for (const [pagePath, heroClass] of navigationPages) {
    const page = await read(pagePath);
    assert.match(page, /<MarketingPageShell>/, `${pagePath} must use the shared public shell`);
    assert.ok(page.includes(heroClass), `${pagePath} must retain ${heroClass}`);
    assert.ok(styles.includes(`.${heroClass}`), `${heroClass} must be covered by the final design layer`);
  }
});

test("navigation pages inherit homepage palette, components and responsive behavior", async () => {
  const styles = await read("app/public-navigation-home-coherence.css");

  for (const color of ["#ffffff", "#e5e5e5", "#fca311", "#14213d", "#000000"]) {
    assert.ok(styles.toLowerCase().includes(color), `missing permanent brand color ${color}`);
  }

  for (const selector of [
    ".product-tour-tabs",
    ".pricing-plan-grid",
    ".migration-timeline",
    ".resources-grid",
    ".about-principles-grid",
    ".public-help-results",
    '.marketing-desktop-nav a[aria-current="page"]',
  ]) {
    assert.ok(styles.includes(selector), `missing component coverage for ${selector}`);
  }

  assert.match(styles, /@media \(max-width: 1120px\)/);
  assert.match(styles, /@media \(max-width: 820px\)/);
  assert.match(styles, /@media \(max-width: 620px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
