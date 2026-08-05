import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public header keeps every required customer utility", async () => {
  const component = await source("components/marketing-site-chrome.tsx");
  const styles = await source("public/biloo-whitebit-header.css");

  for (const requiredLabel of ["Search", "Dashboard", "Account", "Help Center", "Language", "Color mode"]) {
    assert.match(component, new RegExp(requiredLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(component, /wb-search-overlay/);
  assert.match(component, /wb-account-popover/);
  assert.match(component, /wb-language-popover/);
  assert.match(component, /biloo-public-theme/);
  assert.match(component, /wb-mobile-drawer/);
  assert.match(styles, /--wb-black:\s*#08090b/);
  assert.match(styles, /--wb-gold:\s*#fca311/);
  assert.match(styles, /html\[data-public-theme="dark"\]/);
});
