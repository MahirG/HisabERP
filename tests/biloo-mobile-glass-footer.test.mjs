import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("mobile workspace exposes a flat compact X-style icon and text footer", async () => {
  const [layout, shell, styles, bootstrap] = await Promise.all([
    read("app/layout.tsx"),
    read("components/workspace-shell.tsx"),
    read("public/biloo-mobile-glass-footer.css"),
    read("public/biloo-brand-bootstrap.js"),
  ]);

  assert.match(layout, /id="biloo-mobile-glass-footer"/);
  assert.match(layout, /biloo-mobile-glass-footer\.css\?v=20260802-1/);
  assert.match(shell, /className="mobile-bottom-nav"/);
  assert.match(shell, /mobileShortcuts\.map/);
  assert.match(shell, /<span>\{moreLabel\}<\/span>/);

  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /--biloo-mobile-x-footer-height: 57px/);
  assert.match(styles, /grid-template-columns: 46px minmax\(0, 1fr\) 50px !important/);
  assert.match(styles, /\.mobile-workspace-brand \{\s*display: none !important/);
  assert.match(styles, /\.mobile-workspace-title \{\s*grid-column: 2 !important/);
  assert.match(styles, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(styles, /grid-template-rows: 24px 11px !important/);
  assert.match(styles, /inset: auto 0 0 0 !important/);
  assert.match(styles, /border-top: 1px solid #eff3f4 !important/);
  assert.match(styles, /background: #ffffff !important/);
  assert.match(styles, /border-radius: 0 !important/);
  assert.match(styles, /box-shadow: none !important/);
  assert.match(styles, /backdrop-filter: none !important/);
  assert.match(styles, /width: 22px !important/);
  assert.match(styles, /font-size: 8\.5px !important/);
  assert.match(styles, /touch-action: manipulation !important/);
  assert.match(styles, /appearance: none !important/);
  assert.match(styles, /width: 100vw !important/);
  assert.match(styles, /max-width: 100vw !important/);
  assert.match(styles, /overflow-x: hidden !important/);
  assert.doesNotMatch(styles, /clip: rect\(0 0 0 0\) !important/);
  assert.match(styles, /transient circular touch response/);
  assert.match(styles, /background: rgba\(15, 20, 25, 0\.08\) !important/);
  assert.match(styles, /button:last-child\.active/);
  assert.match(styles, /background: transparent !important/);
  assert.match(styles, /stroke-width: 2\.35 !important/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /padding-bottom: calc\(var\(--biloo-mobile-x-footer-height\)/);
  assert.match(styles, /@media \(min-width: 761px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);

  assert.match(bootstrap, /width=device-width/);
  assert.match(bootstrap, /initial-scale=1/);
  assert.match(bootstrap, /minimum-scale=1/);
  assert.match(bootstrap, /maximum-scale=1/);
  assert.match(bootstrap, /user-scalable=no/);
  assert.match(bootstrap, /viewport-fit=cover/);
  assert.match(bootstrap, /new MutationObserver\(lockViewport\)/);
  assert.match(bootstrap, /window\.addEventListener\("pageshow", lockViewport\)/);
});
