import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("brand audit layer is loaded immediately before the final lock", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);
  assert.deepEqual(imports.slice(-2), ["brand-audit-fixes.css", "brand-final-lock.css"]);
});

test("light workspace semantic colors resolve to the Hisab family", async () => {
  const css = await read("app/brand-audit-fixes.css");
  for (const token of ["primary", "success", "warning", "danger", "info"]) {
    assert.match(css, new RegExp(`--fin-${token}: var\\(--hisab-`));
  }
  for (const legacyColor of ["#0f766e", "#1d4ed8", "#8a4b08", "#b4233d", "#334155", "#172235"]) {
    assert.doesNotMatch(css, new RegExp(legacyColor, "i"));
  }
});

test("theme is established before hydration and persisted for server rendering", async () => {
  const layout = await read("app/layout.tsx");
  const toggle = await read("components/theme-toggle.tsx");
  assert.match(layout, /window\.localStorage\.getItem\("hisab-theme"\)/);
  assert.match(layout, /window\.matchMedia\("\(prefers-color-scheme: dark\)"\)/);
  assert.match(layout, /nonce=\{nonce\}/);
  assert.match(layout, /cookieStore\.get\("hisab_theme"\)/);
  assert.match(toggle, /document\.cookie = `hisab_theme=\$\{theme\}/);
});

test("metadata assets remain public and do not redirect through authentication", async () => {
  const proxy = await read("lib/supabase/proxy.ts");
  for (const route of ["/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/release.json"]) {
    assert.match(proxy, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(proxy, /publicAssetRoutes\.has\(path\)/);
});
