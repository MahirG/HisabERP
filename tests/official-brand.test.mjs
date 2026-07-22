import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("loads the official Hisab brand after every application stylesheet", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);

  assert.equal(imports.at(-1), "official-brand.css");
  assert.match(layout, /themeColor: "#DA7757"/);
  assert.match(layout, /\/hisab-logo\.svg/);
});

test("applies official colors to the authenticated internal ERP", async () => {
  const css = await read("app/official-brand.css");

  assert.match(css, /body\[data-workspace-system="financial-os-v1"\]/);
  assert.match(css, /--fin-primary:#da7757/);
  assert.match(css, /--fin-primary-hover:#b55a3f/);
  assert.match(css, /--workspace-brand:#da7757/);
  assert.match(css, /--supabase-sidebar-accent:#da7757/);
  assert.match(css, /\.workspace-command-header/);
  assert.match(css, /\.mobile-bottom-nav a\[aria-current="page"\]/);
  assert.match(css, /\[class\*="tabs"\] button\.active/);
  assert.match(css, /\.sticky-user-avatar/);
  assert.match(css, /url\('\/hisab-logo\.svg'\)/);
});
