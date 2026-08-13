import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("product tour keeps the Biloo brand and uses direct product evidence", async () => {
  const [page, experience, styles] = await Promise.all([
    read("app/product-tour/page.tsx"),
    read("components/product-tour-experience.tsx"),
    read("app/marketing-editorial-system.css"),
  ]);

  assert.match(page, /title: "Biloo ERP Product Tour"/);
  assert.match(page, /import "\.\/product-tour-phase-2-4\.css"/);
  assert.match(page, /className="product-tour-phase-2-4"/);
  assert.doesNotMatch(page, /Interactive HisabERP product tour/);

  assert.match(experience, /role="tablist"/);
  assert.match(experience, /event\.key === ['"]ArrowRight['"]/);
  assert.match(experience, /event\.key === ['"]Home['"]/);
  assert.match(experience, /event\.key === ['"]End['"]/);
  assert.match(experience, /InteractiveErpOffice/);
  assert.match(experience, /Direct product evidence/);
  assert.doesNotMatch(experience, /tour-macbook|tour-iphone|device frame/i);
  assert.match(experience, /aria-live="polite"/);
  assert.match(experience, /Show previous product area/);
  assert.match(experience, /Show next product area/);

  assert.match(styles, /\.product-tour-stage/);
  assert.match(styles, /\.product-tour-tabs/);
  assert.match(styles, /grid-template-columns: minmax\(280px, \.62fr\) minmax\(560px, 1\.38fr\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});
