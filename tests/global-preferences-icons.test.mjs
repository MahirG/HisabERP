import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("language and theme controls are icon-only across public, auth and workspace surfaces", async () => {
  const [layout, language, theme, auth, workspace, marketing, styles] = await Promise.all([
    read("app/layout.tsx"),
    read("components/language-provider.tsx"),
    read("components/theme-toggle.tsx"),
    read("components/auth-page-preferences.tsx"),
    read("components/workspace-header-preferences.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("app/global-preferences-icons.css"),
  ]);

  assert.match(layout, /global-preferences-icons\.css/);
  assert.match(language, /language-icon-trigger preference-icon-button/);
  assert.match(language, /LanguageGlobeIcon/);
  assert.match(theme, /theme-toggle preference-icon-button/);
  assert.doesNotMatch(theme, /theme-toggle-track/);
  assert.match(auth, /LanguageSelector compact/);
  assert.match(auth, /ThemeToggle/);
  assert.match(auth, /onboarding/);
  assert.match(workspace, /LanguageSelector compact/);
  assert.match(workspace, /ThemeToggle/);
  assert.match(marketing, /marketing-preference-icons/);
  assert.match(marketing, /ThemeToggle/);

  assert.match(styles, /background: transparent !important/);
  assert.match(styles, /color: #E17A5B !important/);
  assert.match(styles, /html\[data-theme="light"\] \.marketing-site-v2/);
  assert.match(styles, /html\[data-theme="dark"\] \.marketing-site-v2/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});
