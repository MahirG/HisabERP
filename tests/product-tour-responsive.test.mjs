import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
const read=p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("Product tour shares public navigation and links to real sign-up and demo routes",async()=>{
  const [page,shell]=await Promise.all([
    read("app/product-tour/page.tsx"),read("components/marketing-site-chrome.tsx")
  ]);
  assert.match(page,/<MarketingPageShell>/);
  assert.match(page,/href="#interactive-tour"/);
  assert.match(page,/id="interactive-tour"/);
  assert.match(page,/href="\/request-demo"/);
  assert.match(page,/href="\/auth\/email-sign-up"/);
  assert.match(shell,/id="public-main-content"/);
});

test("Tour exposes five keyboard-operable product scenes and honest sample data",async()=>{
  const [experience,page,preview]=await Promise.all([
    read("components/product-tour-experience.tsx"),
    read("app/product-tour/page.tsx"),
    read("components/interactive-erp-office.tsx")
  ]);
  for(const label of [
    "Executive dashboard","Sales & invoicing","Inventory control",
    "Finance & cash flow","Reports & analytics"
  ])assert.ok(experience.includes(label),label);
  for(const token of ['role="tablist"','role="tab"','aria-selected=','aria-controls=',
    "event.key === 'ArrowLeft'","event.key === 'ArrowRight'","event.key === 'Home'",
    "event.key === 'End'","aria-live=\"polite\"","activateIndex(activeIndex + 1)"])
    assert.ok(experience.includes(token),token);
  assert.match(experience,/Interactive sample/);
  assert.match(experience,/compact illustrative/);
  assert.match(page,/compact illustrative/);
  assert.match(preview,/Illustrative figures and sample records only/);
  assert.match(preview,/amount: illustrative \? row.value : toAmount/);
  assert.match(preview,/selectedPreviewNav/);
});

test("Tour styling is confined to product-tour and works on small phones",async()=>{
  const [layout,css]=await Promise.all([
    read("app/product-tour/layout.tsx"),read("app/product-tour/product-tour-finish.css")
  ]);
  assert.match(layout,/import "\.\/product-tour-finish\.css"/);
  assert.match(css,/#public-main-content \.product-tour-phase-2-4/);
  for(const selector of ["product-tour-hero","product-tour-page-stage","product-tour-toolbar",
    "product-tour-tabs","product-tour-stage","product-tour-scene-nav",
    "erp-evidence-compact","marketing-tour-principles","marketing-cta-v2"])
    assert.ok(css.includes(selector),selector);
  for(const breakpoint of ["@media(max-width:1100px)","@media(max-width:800px)",
    "@media(max-width:520px)","prefers-reduced-motion"])
    assert.ok(css.includes(breakpoint),breakpoint);
  assert.match(css,/overflow-x:auto!important/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css,/min-height:44px!important/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/#14213d/);
  assert.match(css,/#fca311/);
});
