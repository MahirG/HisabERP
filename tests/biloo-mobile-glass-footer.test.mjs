import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("mobile workspace exposes a compact X-style icon footer", async () => {
  const [layout, shell, styles] = await Promise.all([
    read("app/layout.tsx"),
    read("components/workspace-shell.tsx"),
    read("public/biloo-mobile-glass-footer.css"),
  ]);

  assert.match(layout, /id="biloo-mobile-glass-footer"/);
  assert.match(layout, /biloo-mobile-glass-footer\.css\?v=20260802-1/);
  assert.match(shell, /className="mobile-bottom-nav"/);
  assert.match(shell, /mobileShortcuts\.map/);
  assert.match(shell, /<span>\{moreLabel\}<\/span>/);

  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(styles, /inset: auto 0 0 0 !important/);
  assert.match(styles, /border-top: 1px solid #eff3f4 !important/);
  assert.match(styles, /border-radius: 0 !important/);
  assert.match(styles, /box-shadow: none !important/);
  assert.match(styles, /backdrop-filter: none !important/);
  assert.match(styles, /width: 24px !important/);
  assert.match(styles, /clip: rect\(0 0 0 0\) !important/);
  assert.match(styles, /a\[aria-current="page"\]/);
  assert.match(styles, /stroke-width: 2\.4 !important/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /padding-bottom: calc\(var\(--biloo-mobile-x-footer-height\)/);
  assert.match(styles, /@media \(min-width: 761px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
