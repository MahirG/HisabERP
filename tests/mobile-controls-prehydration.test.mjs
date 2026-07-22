import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public mobile controls remain available before React hydration", async () => {
  const [header, layout, controls, menu] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/layout.tsx"),
    read("app/mobile-controls-recovery.css"),
    read("app/mobile-controls-menu.css"),
  ]);

  assert.match(header, /<details className="mobile-language-control language-icon-selector">/);
  assert.match(header, /data-mobile-language="en"/);
  assert.match(header, /data-mobile-language="am"/);
  assert.match(header, /data-mobile-theme-toggle/);
  assert.match(header, /<details className="marketing-mobile-menu">/);

  assert.match(layout, /mobileControlsBootstrap/);
  assert.match(layout, /hisab-theme/);
  assert.match(layout, /hisab-erp-language/);
  assert.match(layout, /data-mobile-theme-toggle/);
  assert.match(layout, /data-mobile-language/);
  assert.match(layout, /mobile-controls-recovery\.css/);
  assert.match(layout, /mobile-controls-menu\.css/);

  assert.match(controls, /marketing-mobile-header-controls\{display:none\}/);
  assert.match(controls, /marketing-mobile-header-controls\{display:inline-flex!important/);
  assert.match(controls, /marketing-desktop-nav[\s\S]*display:none!important/);
  assert.match(controls, /marketing-mobile-menu\[open\][\s\S]*display:grid/);
  assert.match(menu, /marketing-mobile-menu\[open\]/);
});
