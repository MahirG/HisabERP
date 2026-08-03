import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("marketing header uses focused premium navigation on desktop and mobile", async () => {
  const [chrome, styles, logo] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("public/biloo-marketing-sticky-header.css"),
    read("public/hisab-logo.svg"),
  ]);

  assert.match(chrome, /biloo-marketing-sticky-header\.css\?v=20260803-1/);
  assert.match(chrome, /const megaMenus:/);
  assert.match(chrome, /className="marketing-nav-inner"/);
  assert.match(chrome, /className="marketing-mega-menu"/);
  assert.match(chrome, /aria-expanded=\{open\}/);
  assert.match(chrome, /className="marketing-nav-direct"/);
  assert.match(chrome, /className="marketing-demo"><span>\{c\.demo\}<\/span>/);
  assert.match(chrome, /className="premium-mobile-menu-sections"/);
  assert.match(chrome, /className="marketing-mobile-demo"/);

  assert.match(styles, /\.marketing-nav-v2 \{[\s\S]*position: sticky !important/);
  assert.match(styles, /z-index: 1200 !important/);
  assert.match(styles, /min-height: 72px !important/);
  assert.match(styles, /backdrop-filter: blur\(26px\) saturate\(180%\)/);
  assert.match(styles, /\.marketing-nav-inner \{[\s\S]*width: min\(100%, 1440px\) !important/);
  assert.match(styles, /\.marketing-mega-menu \{[\s\S]*grid-template-columns:[\s\S]*border-radius: 26px !important/);
  assert.match(styles, /\.marketing-nav-item\.open \.marketing-mega-menu \{[\s\S]*opacity: 1 !important/);
  assert.match(styles, /\.marketing-nav-actions \.marketing-demo \{[\s\S]*min-width: 136px !important/);
  assert.match(styles, /@media \(max-width: 1080px\)/);
  assert.match(styles, /\.marketing-desktop-nav,[\s\S]*\.marketing-desktop-actions \{[\s\S]*display: none !important/);
  assert.match(styles, /\.premium-mobile-menu-panel \{[\s\S]*width: min\(92vw, 440px\) !important/);
  assert.match(styles, /\.premium-mobile-menu\.open \.premium-mobile-menu-panel \{[\s\S]*translateX\(0\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);

  assert.match(logo, /viewBox="101 179 328 163"/);
});
