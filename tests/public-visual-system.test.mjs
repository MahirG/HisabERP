import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public website uses the approved visual tokens and Space Grotesk", async () => {
  const [layout, visualSystem, manifest] = await Promise.all([
    read("app/layout.tsx"),
    read("app/public-visual-system.css"),
    read("app/manifest.ts"),
  ]);

  assert.match(layout, /Space_Grotesk/);
  assert.match(layout, /public-visual-system\.css/);
  assert.match(layout, /themeColor: "#000000"/);

  for (const token of ["#E17A5B", "#1A1A1A", "#000000", "#0D0D0D", "#EDEDED"]) {
    assert.ok(visualSystem.includes(token), `Missing visual token ${token}`);
  }

  assert.match(visualSystem, /--font-space-grotesk/);
  assert.match(visualSystem, /\.marketing-nav/);
  assert.match(visualSystem, /\.marketing-start/);
  assert.match(visualSystem, /article/);
  assert.match(visualSystem, /code-block/);
  assert.match(manifest, /background_color: "#000000"/);
  assert.match(manifest, /theme_color: "#000000"/);
});
