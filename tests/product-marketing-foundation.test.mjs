import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("homepage uses the product-led marketing experience for signed-out visitors", async () => {
  const page = await read("app/page.tsx");
  const home = await read("components/campfire-marketing-home.tsx");

  assert.match(page, /<CampfireMarketingHome \/>/);
  assert.match(home, /One operating record\. Every team in control\./);
  assert.match(home, /href="\/product-tour"/);
  assert.match(home, /products\.map/);
});

test("interactive product tour covers core HisabERP workflows", async () => {
  const tour = await read("components/product-tour-experience.tsx");
  const page = await read("app/product-tour/page.tsx");

  for (const area of ["Executive dashboard", "Sales & invoicing", "Inventory control", "Finance & cash flow", "Reports & analytics"]) {
    assert.ok(tour.includes(area), `missing product-tour area: ${area}`);
  }
  assert.match(tour, /useState/);
  assert.match(tour, /role="tab"/);
  assert.match(page, /<ProductTourExperience \/>/);
});

test("dedicated product module pages are generated from one content model", async () => {
  const modules = await read("lib/marketing-modules.ts");
  const page = await read("app/product/[slug]/page.tsx");

  for (const slug of ["sales-invoicing", "expenses-purchasing", "inventory", "customers-suppliers", "finance-cashflow", "bank-reconciliation", "reports-analytics", "hr-payroll"]) {
    assert.ok(modules.includes(`slug: "${slug}"`), `missing module: ${slug}`);
  }
  assert.match(page, /generateStaticParams/);
  assert.match(page, /getMarketingModule/);
  assert.match(page, /module\.features\.map/);
});

test("public middleware exposes product marketing routes", async () => {
  const proxy = await read("lib/supabase/proxy.ts");
  assert.match(proxy, /"\/product-tour"/);
  assert.match(proxy, /publicPagePrefixes = \[[^\]]*"\/product\/"[^\]]*"\/industries\/"/s);
});

test("consolidated marketing stylesheet is the only marketing CSS authority", async () => {
  const layout = await read("app/layout.tsx");
  const chrome = await read("components/marketing-site-chrome.tsx");
  const controller = await read("components/marketing-experience-controller.tsx");
  const legal = await read("components/marketing-legal-suite.tsx");
  const internalStyles = await read("app/internal-styles.ts");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);

  assert.deepEqual(imports, ["marketing-editorial-system.css"]);
  assert.match(internalStyles, /brand-final-lock\.css/);
  assert.doesNotMatch(internalStyles, /marketing-editorial-system\.css/);
  assert.doesNotMatch(layout, /<link[^>]+stylesheet/);
  assert.doesNotMatch(chrome, /<link[^>]+stylesheet/);
  assert.doesNotMatch(controller, /<link[^>]+stylesheet/);
  assert.doesNotMatch(legal, /<link[^>]+stylesheet/);
});
