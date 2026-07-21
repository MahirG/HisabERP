import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("welcomes anonymous visitors while preserving the signed-in dashboard", async () => {
  const page = await read("app/page.tsx");

  assert.match(page, /MarketingHome/);
  assert.match(page, /if \(!user\) return <MarketingHome/);
  assert.match(page, /getDashboardSnapshot/);
  assert.match(page, /<Dashboard snapshot=\{snapshot\} user=\{user\}/);
  assert.doesNotMatch(page, /redirect\("\/auth\/login/);
});

test("publishes complete product, CTA, graph, integration, and footer sections", async () => {
  const site = await read("components/marketing-home.tsx");

  assert.match(site, /href="\/request-demo"/);
  assert.match(site, /href="\/auth\/email-sign-up"/);
  assert.match(site, /id="product"/);
  assert.match(site, /id="how-it-works"/);
  assert.match(site, /id="benefits"/);
  assert.match(site, /id="integrations"/);
  assert.match(site, /Illustrative product preview/);
  assert.match(site, /<svg viewBox="0 0 520 190"/);
  assert.match(site, /telebirr/);
  assert.match(site, /M-Pesa/);
  assert.match(site, /mahir@hisabtech\.com/);
  assert.match(site, /0924093037/);
  assert.match(site, /marketing-footer/);
});

test("keeps the public website responsive and visually scoped", async () => {
  const [styles, layout] = await Promise.all([
    read("app/marketing-site.css"),
    read("app/layout.tsx"),
  ]);

  assert.match(layout, /import "\.\/marketing-site\.css"/);
  assert.match(layout, /import "\.\/request-demo\.css"/);
  assert.match(styles, /\.marketing-site/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /html\[data-theme="dark"\] \.marketing-site/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("captures demo requests without requesting public read access", async () => {
  const [action, page] = await Promise.all([
    read("lib/actions/demo-request.ts"),
    read("app/request-demo/page.tsx"),
  ]);

  assert.match(action, /from\("demo_requests"\)\.insert/);
  assert.doesNotMatch(action, /\.select\(/);
  assert.match(action, /honeypot/);
  assert.match(action, /TEAM_SIZES/);
  assert.match(page, /action=\{submitDemoRequest\}/);
  assert.match(page, /preferred_contact/);
  assert.match(page, /Request received/);
  assert.match(page, /stored securely and is not publicly accessible/);
});
