import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoFile = (path) => new URL(`../${path}`, import.meta.url);

const publicEntryFiles = [
  "app/page.tsx",
  "app/request-demo/page.tsx",
  "app/product-tour/page.tsx",
  "app/ethiopia/page.tsx",
  "app/industries/page.tsx",
  "app/pricing/page.tsx",
  "app/customer-stories/page.tsx",
  "app/trust/page.tsx",
  "app/integrations/page.tsx",
  "app/migration/page.tsx",
  "app/compare/page.tsx",
  "app/help-center/page.tsx",
  "app/resources/page.tsx",
  "app/about/page.tsx",
];

test("every primary marketing entry uses the shared marketing navigation", async () => {
  for (const path of publicEntryFiles) {
    const source = await readFile(repoFile(path), "utf8");
    assert.match(
      source,
      /MarketingPageShell|MarketingHeader/,
      `${path} must use the shared marketing navigation`,
    );
  }
});

test("the shared marketing header carries the official logo in desktop and mobile navigation", async () => {
  const source = await readFile(repoFile("components/marketing-site-chrome.tsx"), "utf8");
  const logoMatches = source.match(/src="\/hisab-logo\.svg"/g) ?? [];

  assert.ok(logoMatches.length >= 3, "official logo must remain in header, mobile drawer and footer");
  assert.match(source, /className="marketing-brand" aria-label="Biloo home"/);
  assert.match(source, /className="marketing-desktop-nav"/);
  assert.match(source, /premium-mobile-menu-panel/);
  assert.match(source, /aria-current=/);
  assert.match(source, /Start free/);
  assert.match(source, /Request a demo/);
  assert.match(source, /Sign in/);
});

test("homepage removes its legacy navigation and renders the shared header first", async () => {
  const page = await readFile(repoFile("app/page.tsx"), "utf8");
  const css = await readFile(repoFile("app/home-unified-marketing-navigation.css"), "utf8");

  assert.match(page, /<MarketingHeader \/>/);
  assert.match(page, /marketing-home-unified/);
  assert.match(page, /id="public-main-content"/);
  assert.match(css, /\.wp-header/);
  assert.match(css, /display:\s*none\s*!important/);
  assert.match(css, /\.marketing-brand > img/);
  assert.match(css, /width:\s*44px\s*!important/);
});
