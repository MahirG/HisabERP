import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public marketing uses one stylesheet without runtime recovery CSS", async () => {
  const [layout, styles, bootstrap] = await Promise.all([
    readFile("app/layout.tsx", "utf8"),
    readFile("app/marketing-editorial-system.css", "utf8"),
    readFile("public/biloo-brand-bootstrap.js", "utf8"),
  ]);

  assert.doesNotMatch(layout, /<link[^>]+stylesheet/);
  assert.doesNotMatch(bootstrap, /biloo-public-scroll-recovery\.css/);
  assert.match(styles, /\.marketing-editorial-v1 #public-main-content/);
  assert.match(styles, /content-visibility:\s*visible !important/);
  assert.match(styles, /touch-action:\s*pan-y/);
});
