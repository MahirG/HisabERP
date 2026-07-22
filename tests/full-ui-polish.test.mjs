import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function findPageFiles(directory, relative = "") {
  const absolute = path.join(directory, relative);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await findPageFiles(directory, next));
    if (entry.isFile() && entry.name === "page.tsx") files.push(path.join("app", next));
  }
  return files;
}

function countCharacter(source, character) {
  return [...source].filter((value) => value === character).length;
}

test("the final UI polish layer covers every shared route family and is loaded last", async () => {
  const [layout, styles, marketingChrome, workspaceShell] = await Promise.all([
    read("app/layout.tsx"),
    read("app/full-ui-polish.css"),
    read("components/marketing-site-chrome.tsx"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(layout, /import "\.\/full-ui-polish\.css";/);
  assert.ok(layout.lastIndexOf("./full-ui-polish.css") > layout.lastIndexOf("./standard-mobile-header.css"));
  assert.match(layout, /data-ui-polish="hisab-2026"/);

  assert.equal(countCharacter(styles, "{"), countCharacter(styles, "}"), "full-ui-polish.css must have balanced blocks");
  assert.match(styles, /\.marketing-site-v2/);
  assert.match(styles, /\.auth-page/);
  assert.match(styles, /\.guided-setup-page/);
  assert.match(styles, /\.erp-shell > \.workspace/);
  assert.match(styles, /\.marketing-footer/);
  assert.match(styles, /\.language-icon-menu/);
  assert.match(styles, /\.preference-icon-button/);
  assert.match(styles, /input:not\(\[type="checkbox"\]\)/);
  assert.match(styles, /:is\(table, \.data-table\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(styles, /#2563eb|#3b82f6|#0f766e/i, "the final brand layer must not reintroduce legacy blue or teal primary colors");

  assert.match(marketingChrome, /<footer className="marketing-footer">/);
  assert.match(marketingChrome, /<LanguageSelector compact/);
  assert.match(marketingChrome, /<ThemeToggle \/>/);
  assert.match(marketingChrome, /marketing-mobile-header-controls/);

  assert.match(workspaceShell, /<WorkspaceHeaderPreferences \/>/);
  assert.match(workspaceShell, /<UserMenu user=\{user\} \/>/);
  assert.match(workspaceShell, /className="mobile-workspace-header"/);
});

test("theme controls stay synchronized between pre-hydration mobile controls and React controls", async () => {
  const [layout, themeToggle] = await Promise.all([
    read("app/layout.tsx"),
    read("components/theme-toggle.tsx"),
  ]);

  assert.match(layout, /hisab:theme-change/);
  assert.match(layout, /announceTheme\(nextTheme\)/);
  assert.match(themeToggle, /const THEME_EVENT = "hisab:theme-change"/);
  assert.match(themeToggle, /window\.addEventListener\(THEME_EVENT, syncTheme\)/);
  assert.match(themeToggle, /window\.addEventListener\("storage", syncStoredTheme\)/);
  assert.match(themeToggle, /document\.documentElement\.style\.colorScheme = theme/);
});

test("all application pages inherit the shared font system instead of defining page-local fonts", async () => {
  const pageFiles = await findPageFiles(path.join(root, "app"));
  assert.ok(pageFiles.length >= 50, `expected a broad route inventory, found ${pageFiles.length}`);

  const sources = await Promise.all(pageFiles.map(async (file) => ({ file, source: await read(file) })));
  const localFontOverrides = sources.filter(({ source }) => /fontFamily\s*:|font-family\s*:/.test(source));
  assert.deepEqual(localFontOverrides.map(({ file }) => file), [], "page components must use the shared Space Grotesk and Ethiopic fallback stack");
});
