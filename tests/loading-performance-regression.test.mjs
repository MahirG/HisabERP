import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const providerPath = new URL("../components/app-experience-provider.tsx", import.meta.url);
const loaderCssPath = new URL("../app/brand-loading.css", import.meta.url);
const progressCssPath = new URL("../app/public-route-progress.css", import.meta.url);
const bootstrapPath = new URL("../public/biloo-brand-bootstrap.js", import.meta.url);

test("navigation loading cannot monkey-patch browser history or block for 20 seconds", async () => {
  const source = await readFile(providerPath, "utf8");

  assert.doesNotMatch(source, /window\.history\.pushState\s*=/);
  assert.doesNotMatch(source, /window\.history\.replaceState\s*=/);
  assert.doesNotMatch(source, /20_000/);
  assert.match(source, /mode === "navigation" \? 4_000 : 12_000/);
  assert.match(source, /busyMode === "navigation"/);
  assert.match(source, /busyMode === "operation"/);
  assert.match(source, /requestAnimationFrame/);
});

test("route navigation feedback is a non-blocking Biloo progress bar", async () => {
  const source = await readFile(progressCssPath, "utf8");

  assert.match(source, /pointer-events:\s*none/);
  assert.match(source, /#14213d/i);
  assert.match(source, /#fca311/i);
  assert.match(source, /contain:\s*strict/);
});

test("operation feedback is compact instead of a full-screen overlay", async () => {
  const source = await readFile(loaderCssPath, "utf8");

  assert.match(source, /\.experience-operation-status/);
  assert.match(source, /inset:\s*auto 18px 18px auto/);
  assert.match(source, /pointer-events:\s*none/);
  assert.doesNotMatch(source, /inset:\s*0;[\s\S]*place-items:\s*center/);
  assert.doesNotMatch(source, /rgba\(255,\s*250,\s*247/);
});

test("runtime brand migration is deferred and batched", async () => {
  const source = await readFile(bootstrapPath, "utf8");

  assert.match(source, /requestIdleCallback/);
  assert.match(source, /queuedRoots/);
  assert.match(source, /observer\.observe\(document\.body/);
  assert.doesNotMatch(source, /characterData:\s*true/);
  assert.doesNotMatch(source, /attributes:\s*true/);
});
