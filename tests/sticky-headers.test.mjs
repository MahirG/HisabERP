import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("public and workspace headers remain pinned on desktop and mobile", async () => {
  const [layout, styles, marketing, workspace, commandCenter] = await Promise.all([
    read("app/layout.tsx"),
    read("app/sticky-header-lock.css"),
    read("components/marketing-site-chrome.tsx"),
    read("components/workspace-shell.tsx"),
    read("components/workspace-command-center.tsx"),
  ]);

  assert.match(layout, /import "\.\/sticky-header-lock\.css";/);
  assert.ok(
    layout.lastIndexOf("./sticky-header-lock.css") > layout.lastIndexOf("./brand-typography-color-lock.css"),
    "sticky positioning must load after all visual layers",
  );

  assert.match(styles, /\.marketing-site-v2 > \.marketing-nav[\s\S]*position:\s*sticky !important/);
  assert.match(styles, /\.marketing-site-v2 > \.marketing-nav[\s\S]*top:\s*0 !important/);
  assert.match(styles, /\.workspace-command-header[\s\S]*position:\s*fixed !important/);
  assert.match(styles, /\.mobile-workspace-header[\s\S]*position:\s*fixed !important/);
  assert.match(styles, /--hisab-public-header-height/);
  assert.match(styles, /scroll-margin-top/);
  assert.match(styles, /env\(safe-area-inset-top\)/);

  assert.match(marketing, /<header className="marketing-nav marketing-nav-v2">/);
  assert.match(workspace, /<header className="mobile-workspace-header">/);
  assert.match(commandCenter, /<header className="workspace-command-header"/);
});
