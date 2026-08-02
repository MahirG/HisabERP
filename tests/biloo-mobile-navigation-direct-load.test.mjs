import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const bootstrap = readFileSync(new URL("../public/biloo-brand-bootstrap.js", import.meta.url), "utf8");
const navigation = readFileSync(new URL("../public/biloo-mobile-navigation-v4.css", import.meta.url), "utf8");

test("premium hamburger navigation is linked directly from the root layout", () => {
  assert.match(layout, /id="biloo-mobile-navigation-v4"/);
  assert.match(layout, /href="\/biloo-mobile-navigation-v4\.css\?v=20260802-2"/);
  assert.match(layout, /biloo-brand-bootstrap\.js\?v=20260802-2/);
});

test("the runtime expands the premium design across the complete hamburger breakpoint", () => {
  assert.match(layout, /max-width: 760px/);
  assert.match(layout, /rule\.media\.mediaText = '\(max-width: 960px\)'/);
  assert.match(layout, /addEventListener\('load', expandHamburgerBreakpoint/);
});

test("the stylesheet and fallback bootstrap retain the premium navigation authority", () => {
  assert.match(navigation, /Biloo mobile navigation v4/);
  assert.match(navigation, /data-mobile-nav-open="true"/);
  assert.match(navigation, /sidebar-workspace-switcher/);
  assert.match(navigation, /sidebar-group-items > a\[aria-current="page"\]/);
  assert.match(bootstrap, /biloo-mobile-navigation-v4/);
});
