import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("loads strict Hisab branding after every application stylesheet", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);

  assert.equal(imports.at(-2), "official-brand.css");
  assert.equal(imports.at(-1), "strict-brand.css");
  assert.match(layout, /themeColor: "#DA7757"/);
  assert.match(layout, /\/hisab-logo\.svg/);
});

test("enforces the selected palette throughout the authenticated ERP", async () => {
  const css = await read("app/strict-brand.css");

  assert.match(css, /--hisab-500: #da7757/);
  assert.match(css, /--hisab-950: #171717/);
  assert.match(css, /--fin-success: var\(--hisab-500\)/);
  assert.match(css, /--fin-warning: var\(--hisab-600\)/);
  assert.match(css, /--fin-danger: var\(--hisab-800\)/);
  assert.match(css, /--fin-info: var\(--hisab-700\)/);
  assert.match(css, /\.mobile-bottom-nav a\[aria-current="page"\]/);
  assert.match(css, /\[class\*="chart"\]/);
  assert.match(css, /\.social-provider-icon path/);
});

test("keeps the official logo transparent on the website, auth and workspace", async () => {
  const css = await read("app/strict-brand.css");
  const logo = await read("public/hisab-logo.svg");

  assert.match(css, /background-color: transparent !important/);
  assert.match(css, /background: transparent !important/);
  assert.match(css, /background-image: url\('\/hisab-logo\.svg'\)/);
  assert.doesNotMatch(logo, /<rect\b/i);
  assert.match(logo, /background:transparent/);
  assert.match(logo, /fill="#DA7757"/);
  assert.match(logo, /fill="#171717"/);
});
