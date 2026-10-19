import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = [
  ["Migration", "app/migration/page.tsx"],
  ["Resources", "app/resources/page.tsx"],
  ["Compare", "app/compare/page.tsx"],
  ["Trust", "app/trust/page.tsx"],
  ["About", "app/about/page.tsx"],
  ["Integrations", "app/integrations/page.tsx"],
  ["Pricing", "app/pricing/page.tsx"],
];

test("all seven Biloo pages share the existing public header, footer and final design authority", async () => {
  const [css, imports, shell] = await Promise.all([
    read("app/public-seven-pages.css"),
    read("app/public-styles.ts"),
    read("components/marketing-site-chrome.tsx"),
  ]);
  assert.match(shell, /<MarketingHeader \/>/);
  assert.match(shell, /<MarketingFooter \/>/);
  assert.match(css, /\.marketing-site-v2\.biloo-seven-page #public-main-content/);
  assert.ok(imports.indexOf('import "./public-seven-pages.css"') > imports.indexOf('import "./public-navy-header.css"'));
  for (const [name, path] of pages) {
    const source = await read(path);
    assert.match(source, /<MarketingPageShell className=/, name);
    assert.match(source, /biloo-seven-page/, name);
    assert.match(source, /<\/MarketingPageShell>/, name);
  }
});

test("six informational hero previews show real public-page context, not invented financial data", async () => {
  const source = await read("components/interactive-erp-office.tsx");
  for (const [, path] of pages.filter(([name]) => name !== "Pricing")) {
    const page = await read(path);
    assert.match(page, /compact illustrative informational \/>/, path);
  }
  assert.match(source, /informational\?: boolean/);
  assert.match(source, /informational \? 'Summary'/);
  assert.match(source, /informational \? 'Highlights'/);
  assert.match(source, /informational \? 'Context'/);
  assert.match(source, /view === 'records' && informational/);
  assert.match(source, /view === 'trend' && informational/);
  assert.match(source, /view === 'controls' && informational/);
  assert.match(source, /rows\.slice\(0, 4\)\.map/);
  assert.match(source, /metrics\.slice\(0, 3\)\.map/);
  assert.match(source, /Public information preview only\. No customer data is shown\./);
  assert.match(source, /onClick=\{\(\) => setView\(id\)\}/);
});

test("consistent accessible navy-on-white typography and gold CTA contrast", async () => {
  const css = await read("app/public-seven-pages.css");
  for (const rule of [
    "migration-hero", "resources-hero", "comparison-hub-hero", "trust-page-hero",
    "about-hero", "integration-page-hero", "marketing-section-heading",
    "marketing-hero-actions", "marketing-cta-v2", "erp-evidence-information",
    "migration-source-grid", "comparison-index-grid", "trust-control-grid",
    "integration-directory-grid", "resources-grid", "about-principles-grid",
    "pricing-faq-grid", "pricing-mobile-plan",
  ])assert.ok(css.includes(rule), rule);
  for(const size of ["@media(max-width:1050px)", "@media(max-width:820px)",
    "@media(max-width:600px)", "prefers-reduced-motion"])assert.ok(css.includes(size),size);
  assert.match(css, /color:#14213d!important/);
  assert.match(css, /color:#475467!important/);
  assert.match(css, /background:#fca311!important/);
  assert.match(css, /min-height:44px!important/);
  assert.match(css, /:focus-visible/);
  const luminance = hex => {
    const values = hex.slice(1).match(/../g).map(s => parseInt(s,16)/255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055)/1.055)**2.4);
    return .2126*values[0] + .7152*values[1] + .0722*values[2];
  };
  const contrast = (a,b) => {
    const aa=luminance(a),bb=luminance(b);
    return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05);
  };
  assert.ok(contrast("#475467", "#ffffff") >= 4.5, "Body contrast needs WCAG AA");
  assert.ok(contrast("#14213d", "#fca311") >= 4.5, "Gold CTA needs readable navy text");
});

test("pricing keeps actual ETB plans, Chapa handoff and paid feature comparisons", async () => {
  const [page,pricing,plans] = await Promise.all([
    read("app/pricing/page.tsx"),
    read("components/pricing-experience.tsx"),
    read("lib/marketing-pricing.ts"),
  ]);
  assert.match(page, /biloo-pricing-page biloo-seven-page/);
  assert.match(page, /<PricingExperience \/>/);
  assert.match(page, /Chapa-verified activation/);
  assert.match(pricing, /pricingPlans\.map/);
  assert.match(pricing, /\/checkout\?plan=\$\{plan\.code\}&billing=\$\{billing\}/);
  assert.match(pricing, /annual \? plan\.annualEtb : plan\.monthlyEtb/);
  for (const name of ["Starter","Growth","Business","Enterprise"])
    assert.ok(plans.includes(`name: "${name}"`), name);
});

test("navigation, statuses, and real downloads remain intact", async () => {
  const [migration, compare, trust, integrations, resources, about] = await Promise.all(
    [0, 2, 3, 5, 1, 4].map(i => read(pages[i][1]))
  );
  // Explicit page references instead of guessed API action names.
  assert.match(migration, /hisaberp-customers-import\.csv/);
  assert.match(migration, /hisaberp-suppliers-import\.csv/);
  assert.match(migration, /hisaberp-products-import\.csv/);
  assert.match(compare, /marketingComparisons\.map/);
  assert.match(trust, /trustControls\.map/);
  assert.match(trust, /data-status=\{control\.status\}/);
  assert.match(integrations, /marketingIntegrations\.map/);
  assert.match(integrations, /data-status=\{integration\.status\}/);
  assert.match(resources, /marketingResources\.map/);
  assert.match(about, /request-demo\?source=about/);
  assert.doesNotMatch(about, /multilingual access/);
});
