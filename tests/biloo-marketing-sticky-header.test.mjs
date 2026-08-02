import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("marketing header stays sticky and exposes Book a demo on desktop and mobile", async () => {
  const [chrome, styles] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("public/biloo-marketing-sticky-header.css"),
  ]);

  assert.match(chrome, /demo: "Book a demo"/);
  assert.match(chrome, /biloo-marketing-sticky-header\.css\?v=20260802-1/);
  assert.match(chrome, /className="marketing-mobile-demo"/);
  assert.match(chrome, /className="marketing-demo">\{c\.demo\}<\/Link>/);

  assert.match(styles, /\.marketing-nav-v2 \{[\s\S]*position: sticky !important/);
  assert.match(styles, /top: 0 !important/);
  assert.match(styles, /z-index: 1000 !important/);
  assert.match(styles, /backdrop-filter: blur\(20px\) saturate\(165%\)/);
  assert.match(styles, /@media \(max-width: 960px\)/);
  assert.match(styles, /\.marketing-desktop-nav,[\s\S]*\.marketing-desktop-actions \{[\s\S]*display: none !important/);
  assert.match(styles, /\.marketing-brand-copy \{[\s\S]*display: none !important/);
  assert.match(styles, /\.marketing-mobile-demo \{[\s\S]*display: inline-flex !important/);
  assert.match(styles, /grid-template-rows: 68px !important/);
});
