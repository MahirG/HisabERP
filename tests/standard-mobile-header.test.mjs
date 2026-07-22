import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public and workspace mobile headers reserve a single standard action area", async () => {
  const [styles, layout, publicHeader, workspace] = await Promise.all([
    read("app/standard-mobile-header.css"),
    read("app/layout.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(styles, /\.marketing-mobile-header-controls[\s\S]*min-width:\s*120px/);
  assert.match(styles, /\.mobile-workspace-header[\s\S]*grid-template-columns:\s*44px minmax\(0, 1fr\) 124px/);
  assert.match(styles, /\.mobile-workspace-brand[\s\S]*display:\s*none !important/);
  assert.match(styles, /\.workspace-header-preferences[\s\S]*right:\s*48px !important/);
  assert.match(styles, /\.erp-shell \.sticky-user-menu[\s\S]*right:\s*8px !important/);
  assert.match(styles, /\.mobile-menu-trigger[\s\S]*color:\s*#e17a5b !important/i);
  assert.match(styles, /\.mobile-bottom-nav a\[aria-current="page"\]/);
  assert.match(styles, /html\[data-theme="dark"\]/);

  assert.match(publicHeader, /marketing-mobile-header-controls/);
  assert.match(publicHeader, /marketing-mobile-menu/);
  assert.match(workspace, /mobile-workspace-header/);
  assert.match(workspace, /WorkspaceHeaderPreferences/);
  assert.match(workspace, /UserMenu user=\{user\}/);
  assert.match(layout, /standard-mobile-header\.css/);
  assert.ok(
    layout.indexOf('import "./standard-mobile-header.css";') > layout.indexOf('import "./workspace-brand-completion.css";'),
    "the standard mobile header must be the final style layer",
  );
});
