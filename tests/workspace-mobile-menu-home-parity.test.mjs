import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("authenticated mobile navigation matches the Biloo homepage palette and preserves readable menu labels", async () => {
  const [styles, workspace] = await Promise.all([
    read("app/brand-hamburger-menu.css"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(workspace, /id="primary-sidebar"/);
  assert.match(workspace, /className="mobile-menu-trigger"/);
  assert.match(workspace, /data-mobile-nav-open=/);

  assert.match(styles, /--biloo-mobile-navy: #14213d/);
  assert.match(styles, /--biloo-mobile-gold: #fca311/);
  assert.match(styles, /#primary-sidebar\.sidebar\.supabase-sidebar/);
  assert.match(styles, /#primary-sidebar nav a > span/);
  assert.match(styles, /color: inherit !important/);
  assert.match(styles, /opacity: 1 !important/);
  assert.match(styles, /visibility: visible !important/);
  assert.match(styles, /nav a\[aria-current="page"\][\s\S]*color: #ffffff !important/);
  assert.match(styles, /nav a\[aria-current="page"\][\s\S]*sidebar-nav-icon[\s\S]*var\(--biloo-mobile-gold\)/);
  assert.match(styles, /mobile-menu-trigger i:nth-child\(2\)[\s\S]*var\(--biloo-mobile-gold\)/);
  assert.match(styles, /width: 21px !important/);
});
