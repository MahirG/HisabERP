import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("marketing header stays sticky and exposes Book a demo on desktop and mobile", async () => {
  const [chrome, styles, logo] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("public/biloo-marketing-sticky-header.css"),
    read("public/hisab-logo.svg"),
  ]);

  assert.match(chrome, /demo: "Book a demo"/);
  assert.match(chrome, /biloo-marketing-sticky-header\.css\?v=20260802-2/);
  assert.match(chrome, /className="marketing-mobile-demo"/);
  assert.match(chrome, /className="marketing-demo">\{c\.demo\}<\/Link>/);

  assert.match(styles, /\.marketing-nav-v2 \{[\s\S]*position: sticky !important/);
  assert.match(styles, /top: 0 !important/);
  assert.match(styles, /z-index: 1000 !important/);
  assert.match(styles, /backdrop-filter: blur\(20px\) saturate\(165%\)/);
  assert.match(styles, /min-height: 76px !important/);
  assert.match(styles, /\.marketing-desktop-nav a \{[\s\S]*min-height: 44px !important[\s\S]*font-size: 14px !important/);
  assert.match(styles, /\.marketing-signin,[\s\S]*\.marketing-demo,[\s\S]*\.marketing-start[\s\S]*min-height: 44px !important[\s\S]*font-size: 13\.5px !important/);
  assert.match(styles, /@media \(max-width: 960px\)/);
  assert.match(styles, /\.marketing-desktop-nav,[\s\S]*\.marketing-desktop-actions \{[\s\S]*display: none !important/);
  assert.match(styles, /\.marketing-brand-copy \{[\s\S]*display: none !important/);
  assert.match(styles, /\.marketing-mobile-demo \{[\s\S]*display: inline-flex !important/);
  assert.match(styles, /grid-template-rows: 70px !important/);
  assert.match(styles, /\.hisab-logo \{[\s\S]*width: 84px !important[\s\S]*height: 44px !important/);

  // Keep the horizontal wordmark tightly cropped so its visible text fills the
  // existing header logo box instead of being reduced by a square SVG canvas.
  assert.match(logo, /viewBox="101 179 328 163"/);
});
