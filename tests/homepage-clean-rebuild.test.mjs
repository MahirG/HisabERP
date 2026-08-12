import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("homepage uses the clean Biloo rebuild and shared public chrome", async () => {
  const [page, home, chrome] = await Promise.all([
    read("app/page.tsx"),
    read("components/campfire-marketing-home.tsx"),
    read("components/marketing-site-chrome.tsx"),
  ]);

  assert.match(page, /<MarketingPageShell>/);
  assert.match(page, /<CampfireMarketingHome \/>/);
  assert.match(page, /home-campfire-redesign\.css/);
  assert.doesNotMatch(page, /WishpondMarketingHome|marketing-home-unified|home-wishpond-redesign|home-apple-phase-2-3|home-office-workstation/);

  assert.match(home, /Start free/);
  assert.match(home, /Book a product walkthrough/);
  assert.match(home, /role="tablist"/);
  assert.match(home, /ArrowRight/);
  assert.match(home, /aria-controls/);
  assert.match(home, /ETB-first operations/);
  assert.doesNotMatch(home, /<header className="cf-header"|<footer className="cf-footer"|<main/);

  assert.match(chrome, /<main id="public-main-content">\{children\}<\/main>/);
  assert.match(chrome, /<MarketingHeader\/>/);
  assert.match(chrome, /<MarketingFooter\/>/);
});

test("homepage rebuild covers responsive, accessible and reduced-motion states", async () => {
  const styles = await read("app/home-campfire-redesign.css");

  assert.match(styles, /\.cf-primary,.cf-secondary\s*\{[^}]*min-height:\s*52px/s);
  assert.match(styles, /@media \(max-width: 1060px\)/);
  assert.match(styles, /@media \(max-width: 820px\)/);
  assert.match(styles, /@media \(max-width: 600px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
