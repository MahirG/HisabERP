import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public hamburger uses branded compact lines and an interactive close state", async () => {
  const [header, styles, layout, workspace] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/brand-hamburger-menu.css"),
    read("app/layout.tsx"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(header, /className="marketing-menu-toggle"/);
  assert.match(header, /aria-expanded=\{open\}/);
  assert.match(header, /onClick=\{\(\) => setOpen\(\(value\) => !value\)\}/);
  assert.match(header, /<span\/><span\/><span\/>/);

  assert.match(styles, /color: #E17A5B !important/);
  assert.match(styles, /background: transparent !important/);
  assert.match(styles, /span:nth-child\(2\)[\s\S]*width: 14px/);
  assert.match(styles, /span:nth-child\(1\)[\s\S]*span:nth-child\(3\)[\s\S]*width: 22px/);
  assert.match(styles, /rotate\(45deg\)/);
  assert.match(styles, /rotate\(-45deg\)/);
  assert.match(styles, /mobile-menu-trigger/);
  assert.match(styles, /mobile-sidebar-header > button/);

  assert.match(workspace, /className="mobile-menu-trigger"/);
  assert.match(workspace, /setMobileNavOpen\(true\)/);
  assert.match(workspace, /setMobileNavOpen\(false\)/);
  assert.match(layout, /brand-hamburger-menu\.css/);
});
