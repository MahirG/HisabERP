import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public hamburger uses a native branded disclosure and authenticated menu remains interactive", async () => {
  const [header, brandStyles, mobileStyles, layout, workspace] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("app/brand-hamburger-menu.css"),
    read("app/mobile-controls-menu.css"),
    read("app/layout.tsx"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(header, /<details className="marketing-mobile-menu">/);
  assert.match(header, /<summary className="marketing-menu-toggle"/);
  assert.match(header, /<span\/><span\/><span\/>/);
  assert.doesNotMatch(header, /setOpen\(/);

  assert.match(brandStyles, /color: #E17A5B !important/);
  assert.match(brandStyles, /background: transparent !important/);
  assert.match(mobileStyles, /marketing-mobile-menu\[open\]/);
  assert.match(mobileStyles, /span:nth-child\(2\)[\s\S]*width:14px/);
  assert.match(mobileStyles, /rotate\(45deg\)/);
  assert.match(mobileStyles, /rotate\(-45deg\)/);
  assert.match(brandStyles, /mobile-menu-trigger/);
  assert.match(brandStyles, /mobile-sidebar-header > button/);

  assert.match(workspace, /className="mobile-menu-trigger"/);
  assert.match(workspace, /setMobileNavOpen\(true\)/);
  assert.match(workspace, /setMobileNavOpen\(false\)/);
  assert.match(layout, /brand-hamburger-menu\.css/);
  assert.match(layout, /mobile-controls-menu\.css/);
});
