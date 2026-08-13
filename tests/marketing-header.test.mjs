import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public header uses one polished search control and an icon-only hamburger", async () => {
  const component = await source("components/marketing-site-chrome.tsx");
  const styles = await source("app/marketing-editorial-system.css");

  assert.match(component, /wb-search-overlay/);
  assert.match(component, /wb-mobile-drawer/);
  assert.match(component, /className="wb-search-trigger"[\s\S]*className="wb-search-label"[\s\S]*className="wb-search-shortcut"/);
  assert.match(component, /className="wb-mobile-toggle"[\s\S]*className="wb-visually-hidden"/);
  assert.match(component, /aria-controls="wb-site-search"/);
  assert.match(component, /aria-controls="wb-site-navigation"/);
  assert.doesNotMatch(component, /className="wb-primary-nav"|className="wb-header-actions"/);
  assert.doesNotMatch(component, />\s*Menu\s*</);
  assert.match(styles, /\.wb-search-trigger\s*\{[\s\S]*width:\s*min\(640px, 100%\)[\s\S]*border:\s*1px solid var\(--ms-line-strong\)[\s\S]*box-shadow:\s*var\(--ms-shadow-sm\)/);
  assert.match(styles, /\.wb-mobile-toggle\s*\{[\s\S]*width:\s*44px[\s\S]*border:\s*1px solid var\(--ms-line-strong\)/);
  assert.doesNotMatch(component, /wb-mega-menu|wb-mega-intro|wb-account-popover|wb-dashboard-button|wb-icon-button/);
  assert.doesNotMatch(component, /<link[^>]+stylesheet/);
});
