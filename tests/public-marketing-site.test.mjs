import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("serves a complete public HisabERP website to signed-out visitors", async () => {
  const page = await read("app/page.tsx");

  assert.match(page, /function MarketingHome/);
  assert.match(page, /Request a demo/);
  assert.match(page, /Get started free/);
  assert.match(page, /ProductPreview/);
  assert.match(page, /id="product"/);
  assert.match(page, /id="benefits"/);
  assert.match(page, /id="how"/);
  assert.match(page, /id="integrations"/);
  assert.match(page, /marketing-footer/);
  assert.match(page, /if \(!user\) return <MarketingHome\/>/);
  assert.match(page, /return <Dashboard snapshot=\{snapshot\} user=\{user\}/);
  assert.doesNotMatch(page, /redirect\("\/auth\/login"\)/);
});

test("captures demo requests in Supabase instead of opening a mail client", async () => {
  const [demo, action, styles, layout] = await Promise.all([
    read("app/request-demo/page.tsx"),
    read("lib/actions/demo-request.ts"),
    read("app/request-demo-secure.css"),
    read("app/layout.tsx"),
  ]);

  assert.match(demo, /action=\{submitDemoRequest\}/);
  assert.match(demo, /name="preferred_contact"/);
  assert.match(demo, /name="team_size"/);
  assert.match(demo, /Request received/);
  assert.doesNotMatch(demo, /action="mailto:/);
  assert.match(action, /from\("demo_requests"\)\.insert/);
  assert.doesNotMatch(action, /\.select\(/);
  assert.match(action, /honeypot/);
  assert.match(action, /TEAM_SIZES/);
  assert.match(styles, /demo-request-success/);
  assert.match(styles, /@media\(max-width:600px\)/);
  assert.match(layout, /import "\.\/request-demo-secure\.css"/);
});

test("keeps direct business contact details available", async () => {
  const [home, demo] = await Promise.all([
    read("app/page.tsx"),
    read("app/request-demo/page.tsx"),
  ]);

  assert.match(home, /mahir@hisabtech\.com/);
  assert.match(home, /\+251924093037/);
  assert.match(demo, /mahir@hisabtech\.com/);
  assert.match(demo, /\+251924093037/);
});
