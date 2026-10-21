import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [header, mobileCss, imports] = await Promise.all([
  readFile(new URL("../components/marketing-site-chrome.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/public-mobile-menu-standard.css", import.meta.url), "utf8"),
  readFile(new URL("../app/public-styles.ts", import.meta.url), "utf8"),
]);

test("marketing drawer is above its sticky site header", () => {
  assert.match(mobileCss, /\.marketing-site-v2 \.wb-mobile-drawer\s*\{[^}]*z-index:\s*12000 !important/s);
  assert.match(mobileCss, /\.marketing-site-v2 \.wb-mobile-panel\s*\{[^}]*height:\s*100dvh !important/s);
  assert.match(imports, /import "\.\/public-mobile-menu-standard\.css";/);
  assert.ok(imports.indexOf("public-mobile-menu-standard.css") > imports.indexOf("hisabtech-fundingpips-marketing.css"));
});

test("drawer has one branded header and one independent scroll region", () => {
  assert.match(header, /className="wb-mobile-panel-header"/);
  assert.match(header, /className="wb-mobile-content"/);
  assert.match(header, /className="wb-mobile-actions"/);
  assert.match(mobileCss, /\.wb-mobile-panel > \.wb-mobile-content\s*\{[^}]*overflow-y:\s*auto !important/s);
  assert.match(mobileCss, /\.wb-mobile-panel > \.wb-mobile-actions\s*\{[^}]*grid-template-columns:[^;]*1fr/s);
  assert.match(mobileCss, /\.wb-mobile-panel > \.wb-mobile-panel-header\s*\{[^}]*margin:\s*0 !important/s);
});

test("mobile menu remains accessible and interactive", () => {
  assert.match(header, /aria-expanded=\{mobileOpen\}/);
  assert.match(header, /aria-controls=\{mobilePanelId\}/);
  assert.match(header, /setMobileOpen\(\(current\) => !current\)/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /inert=\{!mobileOpen \? true : undefined\}/);
  assert.match(header, /onClick=\{\(\) => setMobileOpen\(false\)\}/);
  assert.match(header, /<details key=\{group\.id\}/);
  assert.match(header, /href="\/auth\/email-sign-up"/);
});
