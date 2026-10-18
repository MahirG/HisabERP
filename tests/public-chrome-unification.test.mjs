import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("sticky marketing header has no obsolete fixed-header top spacer", async () => {
  const [imports, css] = await Promise.all([read("app/public-styles.ts"), read("app/public-chrome-unification.css")]);
  assert.ok(imports.indexOf("public-chrome-unification.css") > imports.indexOf("public-marketing-final-fixes.css"));
  assert.match(css, /\.marketing-site-v2\s*\{[\s\S]*?padding-top:\s*0\s*!important/);
  assert.match(css, /\.marketing-site-v2\s*>\s*\.wb-header\s*\{[\s\S]*?position:\s*sticky\s*!important/);
  assert.match(css, /@media \(max-width:\s*900px\)/);
  assert.match(css, /\.wb-utility-bar\s*\{[\s\S]*?display:\s*none\s*!important/);
  assert.match(css, /height:\s*64px\s*!important/);
  assert.doesNotMatch(css, /\.erp-shell|\.biloo-login-page/);
});

test("same single shared header and footer appear across marketing routes including walkthrough", async () => {
  const [chrome, demo, home, pricing, legal, resources] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/request-demo/page.tsx"),
    read("app/page.tsx"),
    read("app/pricing/page.tsx"),
    read("components/legal-document-page.tsx"),
    read("app/resources/page.tsx"),
  ]);
  assert.match(chrome, /export function MarketingPageShell/);
  assert.match(chrome, /<MarketingStructuredData\s*\/>\s*<MarketingHeader\s*\/>\s*<main id="public-main-content">\{children\}<\/main>\s*<MarketingFooter\s*\/>/);
  assert.match(demo, /<MarketingPageShell className="demo-request-page">/);
  assert.doesNotMatch(demo, /<MarketingHeader\s*\/>|<MarketingFooter\s*\/>/);
  assert.match(home, /<MarketingPageShell>/);
  assert.match(pricing, /<MarketingPageShell>/);
  assert.match(legal, /<MarketingPageShell>/);
  assert.match(resources, /<MarketingPageShell>/);
});
