import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".md", ".css", ".html"]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else if (extensions.has(path.extname(entry.name))) files.push(absolute);
  }

  return files;
}

test("public website uses the shared info inbox", async () => {
  const legacy = ["mahir", "hisabtech.com"].join("@");
  const files = (await Promise.all(sourceRoots.map((directory) => collectFiles(path.join(root, directory))))).flat();
  const matches = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    if (content.includes(legacy)) matches.push(path.relative(root, file));
  }

  assert.deepEqual(matches, []);

  const about = await readFile(path.join(root, "app/about/page.tsx"), "utf8");
  const chrome = await readFile(path.join(root, "components/marketing-site-chrome.tsx"), "utf8");

  assert.match(about, /info@hisabtech\.com/);
  assert.match(chrome, /info@hisabtech\.com/);
});
