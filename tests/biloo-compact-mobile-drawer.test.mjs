import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("mobile drawer remains compact, legible, scrollable and correctly credited", async () => {
  const [styles, bootstrap, shell] = await Promise.all([
    read("public/biloo-mobile-compact-drawer.css"),
    read("public/biloo-brand-bootstrap.js"),
    read("components/workspace-shell.tsx"),
  ]);

  assert.match(styles, /width: min\(86vw, 330px\) !important/);
  assert.match(styles, /min-height: 44px !important/);
  assert.match(styles, /grid-template-columns: 30px minmax\(0, 1fr\) !important/);
  assert.match(styles, /width: 30px !important/);
  assert.match(styles, /height: 30px !important/);
  assert.match(styles, /font-size: 10px !important/);
  assert.match(styles, /a::after[\s\S]*content: none !important/);
  assert.match(styles, /sidebar-footer/);
  assert.match(styles, /font-size: 7\.5px !important/);

  assert.match(styles, /@media \(max-width: 960px\)/);
  assert.match(styles, /\.erp-shell > \.workspace/);
  assert.match(styles, /height: 100dvh !important/);
  assert.match(styles, /min-height: 0 !important/);
  assert.match(styles, /overflow-y: auto !important/);
  assert.match(styles, /-webkit-overflow-scrolling: touch !important/);
  assert.match(styles, /overscroll-behavior-y: contain !important/);
  assert.match(styles, /touch-action: pan-y !important/);
  assert.match(styles, /height: auto !important/);
  assert.match(styles, /overflow: visible !important/);

  assert.match(bootstrap, /biloo-mobile-compact-drawer\.css\?v=20260802-1/);
  assert.match(bootstrap, /function updateWorkspaceCredit\(\)/);
  assert.match(bootstrap, /credit\.setAttribute\("data-brand-legacy", "true"\)/);
  assert.match(bootstrap, /link\.textContent = "Hisab Technologies"/);
  assert.match(bootstrap, /https:\/\/www\.hisabtechnologies\.com/);
  assert.match(bootstrap, /link\.setAttribute\("target", "_blank"\)/);
  assert.match(bootstrap, /link\.setAttribute\("rel", "noopener noreferrer"\)/);

  assert.match(shell, /className="sidebar-footer"/);
  assert.match(shell, /className="powered-by"/);
});
