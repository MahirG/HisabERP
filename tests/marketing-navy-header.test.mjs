import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = path => readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("Biloo public pages share one navy header implementation", async () => {
  const [chrome,styles,entry] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/public-navy-header.css"),
    read("app/public-styles.ts")
  ]);
  assert.match(chrome,/export function MarketingHeader\(/);
  assert.match(chrome,/export function MarketingPageShell\(/);
  assert.match(chrome,/<MarketingHeader \/>/);
  assert.match(chrome,/className="wb-header"/);
  assert.match(styles,/\.marketing-site-v2 > \.wb-header \{/);
  assert.match(styles,/background: var\(--public-header-navy\) !important/);
  assert.match(styles,/--public-header-navy: #14213d/);
  assert.ok(entry.indexOf('import "./public-navy-header.css"') > entry.indexOf('import "./public-chrome-unification.css"'));
});

test("White Biloo wordmark appears in desktop and mobile headers, not on white footer", async () => {
  const [chrome,logo] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("public/biloo-header-logo-white.svg")
  ]);
  assert.match(logo,/fill="#FFFFFF"/);
  assert.match(logo,/fill="#FCA311"/);
  assert.ok((chrome.match(/src="\/biloo-header-logo-white\.svg"/g)??[]).length===2);
  assert.match(chrome,/marketing-footer-brand"[\s\S]*src="\/biloo-header-logo\.svg"/);
});

test("Navigation, utility bar, active menu and hamburger stay readable on navy", async () => {
  const sheet=await read("app/public-navy-header.css");
  for(const item of ["wb-utility-left a","wb-primary-nav > a","wb-nav-group > button",
    "wb-search-trigger","wb-sign-in","wb-primary-action","wb-mobile-toggle",
    "wb-mobile-toggle-icon i","wb-dropdown a","wb-mobile-panel > header"]) {
    assert.ok(sheet.includes(item),item);
  }
  assert.match(sheet,/color: #ffffff !important/);
  assert.match(sheet,/background: #fca311 !important/);
  assert.match(sheet,/wb-dropdown \{[\s\S]*background: #ffffff !important/);
  assert.match(sheet,/@media \(max-width: 900px\)/);
  assert.match(sheet,/:focus-visible/);
  assert.match(sheet,/prefers-reduced-motion/);
});
