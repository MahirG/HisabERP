import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowedRenderFile = path.join(root, "components", "workspace-header-preferences.tsx");

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(target));
    else if (/\.(?:tsx|jsx)$/.test(entry.name)) files.push(target);
  }

  return files;
}

test("renders language and theme controls only inside the global header", async () => {
  const files = [
    ...await sourceFiles(path.join(root, "app")),
    ...await sourceFiles(path.join(root, "components")),
  ];
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (file !== allowedRenderFile && /<(?:LanguageSelector|ThemeToggle)\b/.test(source)) {
      offenders.push(path.relative(root, file));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `preference controls must render only in components/workspace-header-preferences.tsx; found: ${offenders.join(", ")}`,
  );
});

test("loads the global visibility guard as the final stylesheet", async () => {
  const layout = await readFile(path.join(root, "app", "layout.tsx"), "utf8");
  const guardImport = 'import "./header-only-preferences.css";';
  const position = layout.indexOf(guardImport);

  assert.ok(position >= 0, "layout must load the header-only preference guard");
  assert.equal(
    layout.slice(position + guardImport.length).match(/import "\.\/.*\.css";/g)?.length ?? 0,
    0,
    "header-only-preferences.css must remain the final CSS import",
  );
});

test("hides duplicate controls and restores only header descendants", async () => {
  const css = await readFile(path.join(root, "app", "header-only-preferences.css"), "utf8");

  assert.match(css, /\.language-selector,\s*\n\.theme-toggle\s*\{\s*display:\s*none\s*!important;/);
  assert.match(css, /\.workspace-header-preferences \.language-selector\s*\{\s*display:\s*grid\s*!important;/);
  assert.match(css, /\.workspace-header-preferences \.theme-toggle\s*\{\s*display:\s*flex\s*!important;/);
});
