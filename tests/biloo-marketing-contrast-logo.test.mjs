import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("marketing pages keep readable contrast and one visible official logo", async () => {
  const [styles, bootstrap, home, chrome] = await Promise.all([
    read("public/biloo-marketing-contrast-logo-authority.css"),
    read("public/biloo-brand-bootstrap.js"),
    read("components/wishpond-marketing-home.tsx"),
    read("components/marketing-site-chrome.tsx"),
  ]);

  assert.match(bootstrap, /biloo-marketing-contrast-logo-authority\.css\?v=20260802-1/);
  assert.match(styles, /--biloo-public-on-dark-muted: rgba\(255, 255, 255, 0\.84\)/);
  assert.match(styles, /\.wp-local-row small/);
  assert.match(styles, /\.wp-security-center small/);
  assert.match(styles, /\.wp-security-badge\.badge-two/);
  assert.match(styles, /fill: none !important/);
  assert.match(styles, /stroke: currentColor !important/);

  assert.match(styles, /img\[src\*="hisab-logo\.svg"\][\s\S]*display: none !important/);
  assert.match(styles, /\.marketing-nav > \.marketing-brand img\[src\*="hisab-logo\.svg"\][\s\S]*display: block !important/);
  assert.match(styles, /\.marketing-home-unified \.wp-site > \.wp-header[\s\S]*display: none !important/);
  assert.match(styles, /\.wp-app-sidebar \.wp-sidebar-logo/);
  assert.match(styles, /\.wp-map-center > span/);
  assert.match(styles, /\.wp-footer \.wp-brand-mark/);

  assert.match(styles, /Neutralize generic card rules on structural marketing copy wrappers/);
  assert.match(styles, /\.wp-product-explorer \.wp-section-heading/);
  assert.match(styles, /\.wp-product-explorer \.wp-heading-split/);
  assert.match(styles, /background: transparent !important/);
  assert.match(styles, /\.wp-product-explorer \.wp-heading-split h2[\s\S]*color: #ffffff !important/);
  assert.match(styles, /\.wp-product-explorer \.wp-heading-split > p[\s\S]*rgba\(255, 255, 255, 0\.84\)/);
  assert.match(styles, /\.wp-product-explorer \.wp-kicker-light/);
  assert.match(styles, /Explicit light-section contract/);
  assert.match(styles, /Explicit dark-section contract/);
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /\.wp-product-explorer \.wp-heading-split \{[\s\S]*display: block !important/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\) !important/);

  assert.match(home, /className="wp-product-explorer"/);
  assert.match(home, /className="wp-heading-split"/);
  assert.match(home, /className="wp-security-center"/);
  assert.match(home, /className="wp-local-row"/);
  assert.match(chrome, /className="marketing-nav marketing-nav-v2"/);
  assert.match(chrome, /src="\/hisab-logo\.svg"/);
});
