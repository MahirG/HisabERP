import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("current marketing header keeps readable contrast and one official logo", async () => {
  const [styles, bootstrap, chrome] = await Promise.all([
    readFile("app/marketing-editorial-system.css", "utf8"),
    readFile("public/biloo-brand-bootstrap.js", "utf8"),
    readFile("components/marketing-site-chrome.tsx", "utf8"),
  ]);

  assert.doesNotMatch(bootstrap, /biloo-marketing-contrast-logo-authority\.css/);
  assert.match(styles, /\.marketing-editorial-v1 \.wb-header/);
  assert.match(styles, /\.wb-brand img/);
  assert.match(styles, /color:\s*var\(--me-ink\) !important/);
  assert.match(chrome, /className="wb-brand"/);
  assert.match(chrome, /src="\/biloo-header-logo\.svg"/);
  assert.doesNotMatch(chrome, /<link[^>]+stylesheet/);
});
