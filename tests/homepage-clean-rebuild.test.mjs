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
  assert.match(home, /Book a walkthrough/);
  assert.match(home, /role="tablist"/);
  assert.match(home, /ArrowRight/);
  assert.match(home, /aria-controls/);
  assert.match(home, /Local compliance built in/);
  assert.match(home, /biloo-retail-operators\.webp/);
  assert.match(home, /biloo-warehouse-leader\.webp/);
  assert.match(home, /InteractiveErpOffice/);
  assert.doesNotMatch(home, /iMac|MacBook|workstation|device frame/i);
  assert.doesNotMatch(home, /<header className="cf-header"|<footer className="cf-footer"|<main/);

  assert.match(chrome, /<main id="public-main-content">\{children\}<\/main>/);
  assert.match(chrome, /<MarketingHeader\s*\/>/);
  assert.match(chrome, /<MarketingFooter\s*\/>/);
});

test("homepage rebuild covers responsive, accessible and reduced-motion states", async () => {
  const styles = await read("app/home-campfire-redesign.css");
  const home = await read("components/campfire-marketing-home.tsx");

  assert.match(styles, /\.cf-primary,\s*\.marketing-site-v2 \.cf-secondary\s*\{[^}]*min-height:\s*40px/s);
  assert.match(styles, /@media \(max-width: 1240px\)/);
  assert.match(styles, /@media \(max-width: 820px\)/);
  assert.match(styles, /@media \(max-width: 560px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.cf-site :is\(section, article\)\s*\{[^}]*content-visibility:\s*visible !important/s);
  assert.doesNotMatch(home, /cf-hero-glow|cf-float|cf-marquee|cf-ring|cf-local-core/);
  assert.match(home, /One operating record\. Every team in control\./);
});
