import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Biloo homepage preserves its production shell, metadata and links",async()=>{
 const [page,home,chrome] = await Promise.all([
  read("app/page.tsx"),read("components/campfire-marketing-home.tsx"),
  read("components/marketing-site-chrome.tsx")
 ]);
 assert.match(page,/<MarketingPageShell>/);
 assert.match(page,/<CampfireMarketingHome \/>/);
 assert.match(page,/publicMetadata\("\/", "ERP Software in Ethiopia"/);
 assert.match(page,/import "\.\/home-award-2026\.css"/);
 assert.match(chrome,/<MarketingHeader \/>/);
 assert.match(chrome,/<MarketingFooter \/>/);
 for(const href of [
  "/auth/email-sign-up", "/request-demo?source=homepage-hero",
  "/request-demo?source=homepage-final", "/product-tour", "/pricing", "/industries", "/trust"
 ]) assert.ok(home.includes(href),href);
});

test("Premium homepage has product modules, connected decisions, industries and trust",async()=>{
 const home=await read("components/campfire-marketing-home.tsx");
 for(const title of [
  "ERP software.", "Built for Ethiopian businesses.",
  "Built by Hisab Technologies.", "Designed around your business.",
  "Every part of your business.", "One clear picture.",
  "Decision-ready records, without the spreadsheet relay.",
  "The right system for", "Trust what happens between the numbers.",
  "Ready for the way Ethiopian businesses operate.",
  "A better way to run your business starts here."
 ]) assert.ok(home.includes(title),title);
 for(const slug of [
  "/product/sales-invoicing","/product/inventory",
  "/product/finance-cashflow","/product/reports-analytics",
  "wholesale-distribution","restaurants-hospitality","manufacturing","retail"
 ]) assert.ok(home.includes(slug),slug);
 for(const step of ["Transaction","Validation","Posting","Ledger","Decision"])
  assert.ok(home.includes(step),step);
 for(const label of ["Role-based access","Connected records","Reviewable workflows","Local onboarding support"])
  assert.ok(home.includes(label),label);
});

test("Product evidence remains genuinely interactive and clearly labeled illustrative",async()=>{
 const home=await read("components/campfire-marketing-home.tsx");
 assert.match(home,/role="tablist"/);
 assert.match(home,/role="tab"/);
 assert.match(home,/aria-controls=/);
 assert.match(home,/aria-selected=/);
 assert.match(home,/moveProductFocus/);
 assert.match(home,/onKeyDown=\{\(event\) => moveProductFocus\(event, index\)\}/);
 assert.match(home,/InteractiveErpOffice[\s\S]*compact illustrative/);
 assert.match(home,/INTERACTIVE SAMPLE/);
 assert.match(home,/Sample data/);
 assert.match(home,/DEMO/);
 assert.doesNotMatch(home,/Live business view/);
 assert.doesNotMatch(home,/>Live<\/b>/);
 assert.match(home,/Illustrative approvals and activity/);
 assert.match(home,/ETB-first records/);
 assert.match(home,/Multi-branch visibility/);
});

test("Homepage CSS is route scoped, readable and mobile-first",async()=>{
 const css=await read("app/home-award-2026.css");
 assert.match(css,/#public-main-content \.cf-site\.ah-home/);
 assert.match(css,/#14213d/);
 assert.match(css,/#fca311/);
 assert.match(css,/color:#dce5f2!important/);
 assert.match(css,/color:#475467!important/);
 for(const selector of [
  "ah-hero-board","cf-hero-capabilities","ah-module-grid","cf-record-flow",
  "cf-product-explorer","ah-industry-grid","ah-trust-grid","cf-local-facts",
  "cf-final-cta","erp-evidence-table-wrap"
 ])assert.ok(css.includes(selector),selector);
 for(const breakpoint of ["@media(max-width:1080px)","@media(max-width:800px)",
  "@media(max-width:560px)","prefers-reduced-motion"])
  assert.ok(css.includes(breakpoint),breakpoint);
 assert.match(css,/:focus-visible/);
 assert.match(css,/min-height:48px!important/);
 assert.match(css,/overflow-x:auto!important/);
 const luminance=hex=>{
  const channels=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255)
   .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
 };
 const contrast=(a,b)=>{
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
 };
 assert.ok(contrast("#dce5f2","#14213d")>=4.5);
 assert.ok(contrast("#14213d","#fca311")>=4.5);
 assert.ok(contrast("#475467","#ffffff")>=4.5);
});


test("Navy hero headline stays readable, not covered by legacy white editorial background",async()=>{
 const [css,legacy,home] = await Promise.all([
  read("app/home-award-2026.css"),
  read("app/public-marketing-final-fixes.css"),
  read("components/campfire-marketing-home.tsx")
 ]);
 // Regression: the older CSS deliberately specifies a white .cf-hero-copy.
 assert.match(legacy,/:where\(\.cf-hero,\.cf-hero-layout,\.cf-hero-copy/);
 assert.match(legacy,/background: #ffffff !important/);
 // Higher-specificity home scope overrides the opaque block, without
 // changing the white ERP preview's intentional content surface.
 const copyRule=css.match(/\.marketing-site-v2 #public-main-content \.cf-site\.ah-home \.cf-hero-copy\{([^}]*)\}/)?.[1];
 assert.ok(copyRule,"Homepage hero copy rule exists");
 assert.match(copyRule,/background:transparent!important/);
 assert.match(copyRule,/background-image:none!important/);
 assert.match(copyRule,/color:#fff!important/);
 assert.match(css,/\.cf-hero :is\([\s\S]*?\.cf-hero-actions,[\s\S]*?\.ah-hero-assurances[\s\S]*?\)\{/);
 assert.match(css,/\.cf-hero-product\.ah-hero-board\{[\s\S]*?background:#fff!important/);
 assert.match(home,/className="cf-hero-copy"/);
 assert.match(home,/className="cf-hero-product ah-hero-board"/);
});
