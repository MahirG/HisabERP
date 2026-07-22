import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("mobile menu keeps About and Help Center visible before lower-priority links", async () => {
  const marketing = await read("components/marketing-site-chrome.tsx");

  assert.match(marketing, /const mobileNavItems = \[[\s\S]*\["about", "\/about"\][\s\S]*\["help", "\/help-center"\]/);
  assert.ok(
    marketing.indexOf('["about", "/about"]', marketing.indexOf("const mobileNavItems")) <
      marketing.indexOf('["industries", "/industries"]', marketing.indexOf("const mobileNavItems")),
    "About must appear before lower-priority mobile navigation items",
  );
  assert.match(marketing, /mobile-menu-priority-link/);
  assert.match(marketing, /data-mobile-nav-key=\{key\}/);
  assert.match(marketing, /help: "Help Center"/);
});

test("the final surface contract normalizes borders, corners and mobile drawer scrolling", async () => {
  const [layout, styles] = await Promise.all([
    read("app/layout.tsx"),
    read("app/surface-uniformity-lock.css"),
  ]);

  assert.match(layout, /import "\.\/surface-uniformity-lock\.css";/);
  assert.ok(
    layout.lastIndexOf("./surface-uniformity-lock.css") > layout.lastIndexOf("./sticky-header-lock.css"),
    "surface contract must load after the sticky header and earlier visual layers",
  );
  assert.match(styles, /--hisab-surface-radius:\s*16px/);
  assert.match(styles, /border-width:\s*1px !important/);
  assert.match(styles, /border-top-width:\s*1px !important/);
  assert.match(styles, /grid-template-rows:\s*minmax\(0, 1fr\) auto !important/);
  assert.match(styles, /overflow-y:\s*auto !important/);
  assert.match(styles, /\.mobile-menu-priority-link/);
  assert.match(styles, /position:\s*sticky/);
});
