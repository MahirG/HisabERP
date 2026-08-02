import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navigationCss = await readFile(new URL("../public/biloo-mobile-navigation-v4.css", import.meta.url), "utf8");
const bootstrap = await readFile(new URL("../public/biloo-brand-bootstrap.js", import.meta.url), "utf8");
const workspaceShell = await readFile(new URL("../components/workspace-shell.tsx", import.meta.url), "utf8");

test("mobile navigation uses the Biloo navy and gold design authority", () => {
  assert.match(navigationCss, /--biloo-nav-navy:\s*#14213d/i);
  assert.match(navigationCss, /--biloo-nav-gold:\s*#fca311/i);
  assert.match(navigationCss, /#primary-sidebar\.sidebar\.supabase-sidebar/);
  assert.match(navigationCss, /linear-gradient\(135deg, var\(--biloo-nav-navy\)/);
});

test("hamburger is standard, equal width and animates into a close state", () => {
  assert.match(navigationCss, /mobile-menu-trigger i:nth-child\(1\)[\s\S]*width:\s*21px !important/);
  assert.match(navigationCss, /mobile-menu-trigger i:nth-child\(2\)[\s\S]*width:\s*21px !important/);
  assert.match(navigationCss, /mobile-menu-trigger i:nth-child\(3\)[\s\S]*width:\s*21px !important/);
  assert.match(navigationCss, /data-mobile-nav-open="true"[\s\S]*rotate\(45deg\)/);
  assert.match(navigationCss, /data-mobile-nav-open="true"[\s\S]*rotate\(-45deg\)/);
});

test("drawer lists keep labels and icons visible with an explicit active state", () => {
  assert.match(navigationCss, /sidebar-group-items > a > span:not\(\.sidebar-nav-icon\)[\s\S]*opacity:\s*1 !important/);
  assert.match(navigationCss, /sidebar-nav-icon[\s\S]*visibility:\s*visible !important/);
  assert.match(navigationCss, /a\[aria-current="page"\][\s\S]*color:\s*#ffffff !important/);
  assert.match(navigationCss, /a\[aria-current="page"\][\s\S]*var\(--biloo-nav-gold\)/);
});

test("workspace shell retains the semantic navigation hooks", () => {
  for (const hook of [
    "mobile-menu-trigger",
    "mobile-sidebar-header",
    "sidebar-workspace-switcher",
    "sidebar-nav-group",
    "sidebar-group-items",
    "sidebar-dock-status",
    "mobile-nav-backdrop",
  ]) {
    assert.ok(workspaceShell.includes(hook), `missing ${hook}`);
  }
});

test("brand bootstrap loads the premium navigation stylesheet last", () => {
  assert.match(bootstrap, /biloo-mobile-navigation-v4/);
  assert.match(bootstrap, /\/biloo-mobile-navigation-v4\.css\?v=20260802-1/);
  assert.match(bootstrap, /ensureWorkspaceStyles\(\)/);
});
