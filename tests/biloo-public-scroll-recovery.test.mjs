import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("all public marketing routes retain a vertical document scroll chain", async () => {
  const [layout, home, recovery, bootstrap] = await Promise.all([
    read("app/layout.tsx"),
    read("app/home-wishpond-redesign.css"),
    read("public/biloo-public-scroll-recovery.css"),
    read("public/biloo-brand-bootstrap.js"),
  ]);

  assert.match(home, /\.wp-site\s*\{[\s\S]*overflow:\s*clip/);

  assert.match(layout, /id="biloo-public-scroll-recovery"/);
  assert.match(layout, /biloo-public-scroll-recovery\.css\?v=20260802-1/);
  assert.match(layout, /biloo-brand-bootstrap\.js\?v=20260802-4/);

  assert.match(recovery, /body:has\(:is\(\.marketing-site/);
  assert.match(recovery, /body\[data-public-marketing="true"\]/);
  assert.match(recovery, /overflow-y: auto !important/);
  assert.match(recovery, /overflow-y: visible !important/);
  assert.match(recovery, /height: auto !important/);
  assert.match(recovery, /max-height: none !important/);
  assert.match(recovery, /touch-action: pan-y pinch-zoom !important/);
  assert.match(recovery, /-webkit-overflow-scrolling: touch !important/);
  assert.match(recovery, /#public-main-content/);
  assert.match(recovery, /\.wp-site/);

  assert.match(bootstrap, /biloo-public-scroll-recovery\.css\?v=20260802-1/);
  assert.match(bootstrap, /function syncPublicMarketingMode\(\)/);
  assert.match(bootstrap, /document\.body\.dataset\.publicMarketing = "true"/);
  assert.match(bootstrap, /data-public-marketing-root/);
});
