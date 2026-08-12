import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public header uses conventional navigation and restrained customer actions", async () => {
  const component = await source("components/marketing-site-chrome.tsx");
  const styles = await source("public/biloo-whitebit-header.css");

  for (const requiredLabel of ["Product", "Solutions", "Resources", "Company", "Pricing", "Search", "Sign in", "Start free"]) {
    assert.match(component, new RegExp(requiredLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(component, /wb-search-overlay/);
  assert.match(component, /wb-dropdown/);
  assert.match(component, /wb-mobile-drawer/);
  assert.match(styles, /\.wb-dropdown\s*\{/);
  assert.match(styles, /width:\s*264px/);
  assert.doesNotMatch(component, /wb-mega-menu|wb-mega-intro|wb-account-popover|wb-dashboard-button|wb-icon-button/);
  assert.doesNotMatch(styles, /grid-template-columns:\s*minmax\(230px/);
});
