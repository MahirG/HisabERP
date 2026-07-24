import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Apple-grade workspace system loads last and keeps the HisabTech brand palette", async () => {
  const [layout, styles] = await Promise.all([
    read("app/layout.tsx"),
    read("app/apple-workspace-redesign.css"),
  ]);

  assert.match(layout, /import "\.\/apple-workspace-redesign\.css";/);
  assert.ok(layout.lastIndexOf("./apple-workspace-redesign.css") > layout.lastIndexOf("./commercial-platform.css"));
  assert.match(styles, /--fin-primary:\s*#da7757/i);
  assert.match(styles, /--fin-text:\s*#171717/i);
  assert.match(styles, /width:\s*264px\s*!important/);
  assert.match(styles, /html\[data-theme="dark"\]/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("dashboard uses premium bento hierarchy and an accessible revenue trend chart", async () => {
  const dashboard = await read("components/dashboard.tsx");

  assert.match(dashboard, /apple-grade-dashboard/);
  assert.match(dashboard, /dashboard-snapshot-card/);
  assert.match(dashboard, /dashboard-insight-grid/);
  assert.match(dashboard, /dashboard-operating-grid/);
  assert.match(dashboard, /function RevenueTrendChart/);
  assert.match(dashboard, /role="img" aria-label=\{label\}/);
  assert.match(dashboard, /dashboard-health-ring/);
  assert.doesNotMatch(dashboard, /className="chart"/);
});

test("workspace redesign applies beyond the home dashboard", async () => {
  const styles = await read("app/apple-workspace-redesign.css");

  assert.match(styles, /\.finance-page/);
  assert.match(styles, /\.sales-page/);
  assert.match(styles, /\.einvoice-page/);
  assert.match(styles, /\.recon-page/);
  assert.match(styles, /\.module-page/);
  assert.match(styles, /\.workspace-data-table/);
  assert.match(styles, /input:not\(\[type="checkbox"\]\)/);
  assert.match(styles, /\.mobile-bottom-nav/);
});
