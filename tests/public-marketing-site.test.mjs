import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("serves a public HisabERP website to signed-out visitors", async () => {
  const page = await read("app/page.tsx");
  assert.match(page, /function MarketingHome/);
  assert.match(page, /Request a demo/);
  assert.match(page, /Get started free/);
  assert.match(page, /ProductPreview/);
  assert.match(page, /id="integrations"/);
  assert.match(page, /marketing-footer/);
  assert.match(page, /if \(!user\) return <MarketingHome\/>/);
  assert.match(page, /return <Dashboard snapshot=\{snapshot\} user=\{user\}/);
  assert.doesNotMatch(page, /redirect\("\/auth\/login"\)/);
});

test("provides a responsive demo request journey", async () => {
  const [demo, styles, layout] = await Promise.all([
    read("app/request-demo/page.tsx"),
    read("app/request-demo.css"),
    read("app/layout.tsx"),
  ]);
  assert.match(demo, /mailto:mahir@hisabtech\.com/);
  assert.match(demo, /tel:\+251924093037/);
  assert.match(demo, /Request my HisabERP demo/);
  assert.match(styles, /@media\(max-width:600px\)/);
  assert.match(layout, /import "\.\/marketing-site\.css"/);
  assert.match(layout, /import "\.\/request-demo\.css"/);
});
