import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("homepage hides the removed connected-system eyebrow without leaving a gap", async () => {
  const [page, styles] = await Promise.all([
    read("app/page.tsx"),
    read("app/home-hero-copy-cleanup.css"),
  ]);

  assert.match(page, /import "\.\/home-hero-copy-cleanup\.css"/);
  assert.match(styles, /\.wp-hero-copy > \.wp-kicker:first-child/);
  assert.match(styles, /display: none !important/);
  assert.match(styles, /\.wp-hero-copy > h1/);
  assert.match(styles, /margin-top: 0 !important/);
});
