import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

function countCharacter(source, character) {
  return [...source].filter((value) => value === character).length;
}

test("the exact logo palette is authoritative and loaded after the broad polish layer", async () => {
  const [layout, lock, logo] = await Promise.all([
    read("app/layout.tsx"),
    read("app/brand-typography-color-lock.css"),
    read("public/hisab-logo.svg"),
  ]);

  assert.match(logo, /fill="#DA7757"/);
  assert.match(logo, /fill="#171717"/);
  assert.match(lock, /--hisab-logo-terracotta:\s*#da7757/i);
  assert.match(lock, /--hisab-logo-charcoal:\s*#171717/i);
  assert.doesNotMatch(lock, /#e17a5b/i, "the approximate terracotta must not return");
  assert.equal(countCharacter(lock, "{"), countCharacter(lock, "}"), "brand lock CSS must have balanced blocks");
  assert.ok(
    layout.lastIndexOf("./brand-typography-color-lock.css") > layout.lastIndexOf("./full-ui-polish.css"),
    "the exact brand contract must load after the broad UI polish layer",
  );
});

test("English and Ethiopic languages use bundled, explicit font variables", async () => {
  const [layout, fonts, lock] = await Promise.all([
    read("app/layout.tsx"),
    read("app/fonts.css"),
    read("app/brand-typography-color-lock.css"),
  ]);

  assert.match(layout, /Noto_Sans_Ethiopic/);
  assert.match(layout, /variable:\s*"--font-noto-ethiopic"/);
  assert.match(layout, /notoSansEthiopic\.variable/);
  assert.match(fonts, /--font-noto-ethiopic/);
  assert.match(fonts, /data-language="am"/);
  assert.match(fonts, /data-language="ti"/);
  assert.match(lock, /--font-app-latin/);
  assert.match(lock, /--font-app-ethiopic/);
});

test("light and dark semantic text, surface, input and footer colours are paired", async () => {
  const lock = await read("app/brand-typography-color-lock.css");

  assert.match(lock, /html\[data-theme="light"\][\s\S]*--ui-text:\s*#211a18/);
  assert.match(lock, /html\[data-theme="dark"\][\s\S]*--ui-text:\s*#fff8f4/);
  assert.match(lock, /--ui-surface:\s*#ffffff/);
  assert.match(lock, /--ui-surface:\s*#171311/);
  assert.match(lock, /input:not\(\[type="checkbox"\]\)/);
  assert.match(lock, /\.marketing-footer[\s\S]*var\(--hisab-logo-charcoal\)/);
});
