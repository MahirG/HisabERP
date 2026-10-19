import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Demo route retains real submission, validation, contact consent and honest delivery state", async()=>{
 const [page,actions,layout,css] = await Promise.all([
   read("app/request-demo/page.tsx"),
   read("lib/actions/demo-request.ts"),
   read("app/request-demo/layout.tsx"),
   read("app/request-demo/demo-finish.css"),
 ]);
 for(const key of ['action={submitDemoRequest}','name="full_name"','name="business_name"',
  'name="email"','name="phone"','name="business_type"','name="team_size"',
  'name="preferred_contact"','name="contact_consent"','name="request_id"',
  'className="demo-request-honeypot"'])assert.ok(page.includes(key),key);
 for(const key of ['sendDemoRequestEmail','sendDemoConfirmationEmail','from("demo_requests").insert','UUID_PATTERN','preferredContact'])
  assert.ok(actions.includes(key),key);
 assert.match(page,/errorMessage = typeof params\.error/);
 assert.match(layout,/import "\.\/demo-finish\.css"/);
 for(const key of ['demo-booking-hero','demo-booking-card','demo-booking-success','demo-contact-method','demo-booking-submit',
  'font-size:16px!important','@media(max-width:600px)',':focus-visible'])
  assert.ok(css.includes(key),key);
});
test("Pricing mobile plan cards retain all live source prices and checkout links",async()=>{
 const [page,plan,component,layout,css]=await Promise.all([
  read("app/pricing/page.tsx"),read("lib/marketing-pricing.ts"),
  read("components/pricing-experience.tsx"),read("app/pricing/layout.tsx"),
  read("app/pricing/pricing-finish.css")
 ]);
 assert.match(page,/className="biloo-pricing-page"/);
 assert.doesNotMatch(page,/InteractiveErpOffice/);
 assert.match(layout,/pricing-finish\.css/);
 assert.match(component,/pricing-mobile-plans/);
 assert.match(component,/billing === 'annual'/);
 assert.match(component,/annual \? plan\.annualEtb : plan\.monthlyEtb/);
 assert.match(component,/\/checkout\?plan=\$\{plan\.code\}&billing=\$\{billing\}/);
 assert.match(component,/pricingPlans\.map/);
 for(const label of ["Starter","Growth","Business","Enterprise"])assert.ok(plan.includes(`name: "${label}"`),label);
 assert.doesNotMatch(plan,/English and Amharic access/);
 assert.match(css,/@media\(max-width:780px\)/);
 assert.match(css,/pricing-mobile-plans/);
 assert.match(css,/pricing-comparison-wrap\{display:none!important/);
 assert.match(css,/:focus-visible/);
});
test("Inventory preview is illustrative, stock oriented and mobile responsive",async()=>{
 const [page,source,layout,css,marketing]=await Promise.all([
  read("app/product/[slug]/page.tsx"),read("components/interactive-erp-office.tsx"),
  read("app/product/[slug]/layout.tsx"),read("app/product/[slug]/finance-cashflow-finish.css"),
  read("lib/marketing-modules.ts"),
 ]);
 assert.match(page,/inventory-product-hero/);
 assert.match(page,/illustrative=\{module\.slug === "finance-cashflow" \|\| module\.slug === "inventory" \|\| module\.slug === "sales-invoicing"\}/);
 assert.match(page,/\/request-demo\?topic=inventory/);
 assert.match(source,/inventoryPreview \? 'Stock items' : 'Records'/);
 assert.match(source,/inventoryPreview \? 'Movement' : 'Performance'/);
 assert.match(source,/inventoryPreview \? 'Quantity' : 'Amount'/);
 assert.match(source,/Illustrative figures and sample records only/);
 assert.match(marketing,/slug: "inventory"/);
 assert.match(layout,/finance-cashflow-finish\.css/);
 assert.match(css,/\.inventory-product-hero/);
 assert.match(css,/@media\(max-width:520px\)/);
});
