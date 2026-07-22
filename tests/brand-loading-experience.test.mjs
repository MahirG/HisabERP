import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("route and navigation loaders use the official transparent Hisab mark", async () => {
  const routeLoader = await read("app/loading.tsx");
  const experienceProvider = await read("components/app-experience-provider.tsx");

  for (const source of [routeLoader, experienceProvider]) {
    assert.match(source, /src="\/hisab-logo\.svg"/);
    assert.match(source, /brand-loader-ring/);
    assert.match(source, /brand-loader-progress/);
    assert.doesNotMatch(source, /hisab-orbit-loader/);
    assert.doesNotMatch(source, /<b>H<\/b>/);
  }
});

test("brand loader stylesheet is late in the cascade without displacing the final audit locks", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);
  assert.ok(imports.indexOf("brand-loading.css") > imports.indexOf("product-experience.css"));
  assert.deepEqual(imports.slice(-3), ["brand-loading.css", "brand-audit-fixes.css", "brand-final-lock.css"]);
});

test("loader is constrained to the Hisab palette and respects motion preferences", async () => {
  const css = await read("app/brand-loading.css");

  for (const required of ["#da7757", "#171717", "#fffaf7", "prefers-reduced-motion", "brandLoaderSpin", "brandLoaderProgress"]) {
    assert.match(css, new RegExp(required, "i"));
  }

  for (const legacyColor of ["#276ff2", "#0e9b7d", "#2979ef", "#0aa481", "#3ecf8e"]) {
    assert.doesNotMatch(css, new RegExp(legacyColor, "i"));
  }
});
