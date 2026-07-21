import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowedWorkspaceRenderFile = path.join(root, "components", "workspace-header-preferences.tsx");

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

test("keeps reusable language and theme controls out of ordinary components", async () => {
  const files = await sourceFiles(path.join(root, "components"));
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (file !== allowedWorkspaceRenderFile && /<(?:LanguageSelector|ThemeToggle)\b/.test(source)) {
      offenders.push(path.relative(root, file));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `reusable preference controls must render only in components/workspace-header-preferences.tsx within the components directory; found: ${offenders.join(", ")}`,
  );
});

test("mounts a dedicated standard preference pair only on authentication routes", async () => {
  const [layout, component, css] = await Promise.all([
    readFile(path.join(root, "app", "layout.tsx"), "utf8"),
    readFile(path.join(root, "components", "auth-page-preferences.tsx"), "utf8"),
    readFile(path.join(root, "app", "auth-page-preferences.css"), "utf8"),
  ]);

  assert.match(layout, /import \{ AuthPagePreferences \} from "\.\.\/components\/auth-page-preferences";/);
  assert.match(layout, /<AuthPagePreferences\s*\/>/);
  assert.match(layout, /import "\.\/auth-page-preferences\.css";/);
  assert.match(component, /const isAuthRoute = pathname === "\/auth" \|\| pathname\.startsWith\("\/auth\/"\);/);
  assert.match(component, /if \(!isAuthRoute\) return null;/);
  assert.match(component, /className="auth-preference-button auth-theme-button"/);
  assert.match(component, /name=\{theme === "dark" \? "sun" : "moon"\}/);
  assert.match(component, />Lang<\/span>/);
  assert.match(component, /className="auth-language-options"/);
  assert.match(css, /\.auth-page-preferences\s*\{[\s\S]*position:\s*fixed;[\s\S]*top:[\s\S]*right:/);
  assert.match(css, /\.auth-preference-button\s*\{[\s\S]*height:\s*40px;/);
});

test("loads auth styling before the final duplicate-control guard", async () => {
  const layout = await readFile(path.join(root, "app", "layout.tsx"), "utf8");
  const authImport = 'import "./auth-page-preferences.css";';
  const guardImport = 'import "./header-only-preferences.css";';
  const authPosition = layout.indexOf(authImport);
  const guardPosition = layout.indexOf(guardImport);

  assert.ok(authPosition >= 0, "layout must load auth page preference styling");
  assert.ok(guardPosition > authPosition, "duplicate-control guard must load after auth preference styling");
  assert.equal(
    layout.slice(guardPosition + guardImport.length).match(/import "\.\/.*\.css";/g)?.length ?? 0,
    0,
    "header-only-preferences.css must remain the final CSS import",
  );
});

test("hides legacy controls and restores only approved header descendants", async () => {
  const [css, onboarding] = await Promise.all([
    readFile(path.join(root, "app", "header-only-preferences.css"), "utf8"),
    readFile(path.join(root, "app", "onboarding", "page.tsx"), "utf8"),
  ]);

  assert.match(css, /\.language-selector,\s*\n\.theme-toggle\s*\{\s*display:\s*none\s*!important;/);
  assert.match(css, /\.workspace-header-preferences \.language-selector,\s*\n\.launch-header-preferences \.language-selector\s*\{\s*display:\s*grid\s*!important;/);
  assert.match(css, /\.workspace-header-preferences \.theme-toggle,\s*\n\.launch-header-preferences \.theme-toggle\s*\{\s*display:\s*flex\s*!important;/);
  assert.match(css, /company launch uses its own\s*\n \* launch header/);
  assert.match(onboarding, /className="launch-header-preferences"/);
  assert.match(onboarding, /<LanguageSelector compact \/>/);
  assert.match(onboarding, /<ThemeToggle \/>/);
});
