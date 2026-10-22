import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read=p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("Sales and invoicing marketing page uses shared Biloo shell and genuine lead routes",async()=>{
 const [page,modules,shell]=await Promise.all([
  read("app/product/[slug]/page.tsx"),
  read("lib/marketing-modules.ts"),
  read("components/marketing-site-chrome.tsx")
 ]);
 assert.match(modules,/slug: "sales-invoicing"/);
 assert.match(page,/<MarketingPageShell>/);
 assert.match(page,/sales-invoicing-hero/);
 assert.match(page,/sales-hero-steps/);
 assert.match(page,/\/request-demo\?topic=sales-invoicing/);
 assert.match(page,/href="\/auth\/email-sign-up"/);
 assert.match(page,/href="\/product-tour"/);
 assert.match(shell,/id="public-main-content"/);
});
test("Sales page previews genuine illustrative invoice values, not unrelated sales amounts",async()=>{
 const [page,preview,modules]=await Promise.all([
  read("app/product/[slug]/page.tsx"),
  read("components/interactive-erp-office.tsx"),
  read("lib/marketing-modules.ts")
 ]);
 assert.match(page,/\n\s+illustrative\n/);
 for(const s of ["INV-1048","INV-1047","INV-1046","ETB 18,900","ETB 12,400","ETB 8,750"])assert.ok(modules.includes(s),s);
 assert.match(preview,/row\.label\.match\(\/\^\(INV-/);
 assert.match(preview,/status: salesPreview \? \(row\.meta \|\| 'Unspecified'\)/);
 assert.match(preview,/salesPreview \? 'Invoices'/);
 assert.match(preview,/salesPreview \? 'Customer'/);
 assert.match(preview,/salesPreview \? 'Collections'/);
 assert.match(preview,/salesRevenueData/);
 assert.match(preview,/Illustrative sales revenue/);
 assert.match(preview,/Sample week, Monday–Saturday/);
 assert.match(preview,/Illustrative figures and sample records only/);
 assert.match(preview,/role="tab"/);
 assert.match(preview,/onClick=\{\(\) => setView\(id\)\}/);
});
test("Sales marketing finishes share premium visual system without affecting authenticated app",async()=>{
 const [layout,css,salesStyles]=await Promise.all([
  read("app/product/[slug]/layout.tsx"),
  read("app/product/[slug]/finance-cashflow-finish.css"),
  read("app/product/[slug]/sales-invoicing-finish.css"),
 ]);
 assert.match(layout,/import "\.\/finance-cashflow-finish\.css"/);
 assert.match(layout,/import "\.\/sales-invoicing-finish\.css"/);
 assert.match(css,/\.sales-invoicing-hero/);
 assert.match(salesStyles,/\.sales-invoicing-hero/);
 assert.match(salesStyles,/@media\(max-width:520px\)/);
 assert.match(salesStyles,/erp-evidence-table/);
 assert.match(css,/min-height:44px!important/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/#14213d/);
 assert.match(css,/#fca311/);
});
