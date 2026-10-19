import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relative => readFile(new URL(`../${relative}`,import.meta.url),"utf8");

test("Finance cash-flow route retains the shared product header and navigation",async()=>{
  const [page,modules,shell] = await Promise.all([
    read("app/product/[slug]/page.tsx"),
    read("lib/marketing-modules.ts"),
    read("components/marketing-site-chrome.tsx"),
  ]);
  assert.match(modules,/slug: "finance-cashflow"/);
  assert.match(page,/<MarketingPageShell>/);
  assert.match(page,/finance-cashflow-hero/);
  assert.match(page,/illustrative=\{module\.slug === "finance-cashflow"\}/);
  assert.match(page,/module\.workflow\.map/);
  assert.match(page,/module\.features\.map/);
  assert.match(page,/href="\/request-demo"/);
  assert.match(page,/href="\/auth\/email-sign-up"/);
  assert.match(shell,/id="public-main-content"/);
});

test("Finance product preview labels all sample data and does not expose fake actions",async()=>{
  const preview = await read("components/interactive-erp-office.tsx");
  assert.match(preview,/illustrative\?: boolean/);
  assert.match(preview,/erp-evidence-sample-indicator/);
  assert.match(preview,/Illustrative figures and sample records only/);
  assert.match(preview,/label === selectedPreviewNav \? 'active'/);
  assert.match(preview,/financeCashflowData/);
  assert.match(preview,/Sample net cash flow/);
  assert.match(preview,/financePreview \? 'Transactions' : 'Records'/);
  assert.match(preview,/role="tab"/);
  assert.match(preview,/onClick=\{\(\) => setView\(id\)\}/);
  assert.match(preview,/illustrative \? <span className="erp-evidence-preview-label"/);
});

test("Finance design authority is route scoped and responsive to small phones",async()=>{
  const [layout,css] = await Promise.all([
    read("app/product/[slug]/layout.tsx"),
    read("app/product/[slug]/finance-cashflow-finish.css"),
  ]);
  assert.match(layout,/import "\.\/finance-cashflow-finish\.css"/);
  assert.match(css,/#public-main-content:has\(\.finance-cashflow-hero\)/);
  for(const selector of [
    "finance-cashflow-hero","module-problem-outcome","module-capability-grid",
    "module-workflow-grid","module-audience-section","related-module-grid",
    "erp-evidence-table","erp-evidence-disclaimer","marketing-cta-v2",
  ])assert.ok(css.includes(selector),selector);
  for(const query of ["@media(max-width:980px)","@media(max-width:740px)","@media(max-width:520px)","prefers-reduced-motion"])assert.ok(css.includes(query),query);
  assert.match(css,/overflow-x:auto!important/);
  assert.match(css,/min-height:44px!important/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/#14213d/);
  assert.match(css,/#fca311/);
});
