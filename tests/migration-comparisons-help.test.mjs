import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("migration center provides a controlled workflow and downloadable preparation templates", async () => {
  const page = await read("app/migration/page.tsx");
  assert.match(page, /Move into HisabERP without losing control of the source/);
  for (const stage of ["Assess", "Prepare", "Configure", "Dry run", "Validate", "Go live"]) assert.ok(page.includes(stage), `missing migration stage: ${stage}`);
  for (const template of ["hisaberp-customers-import.csv", "hisaberp-suppliers-import.csv", "hisaberp-products-import.csv"]) {
    assert.ok(page.includes(template), `migration page missing template: ${template}`);
    assert.ok((await read(`public/templates/${template}`)).includes(","), `template is not CSV: ${template}`);
  }
  assert.match(page, /A successful technical import is not the same|technical import/);
});

test("comparison hub and static comparison pages cover five honest operating models", async () => {
  const comparisons = await read("lib/marketing-comparisons.ts");
  const hub = await read("app/compare/page.tsx");
  const detail = await read("app/compare/[slug]/page.tsx");

  for (const slug of ["excel", "notebooks", "separate-tools", "desktop-software", "small-business-vs-enterprise"]) {
    assert.ok(comparisons.includes(`slug: "${slug}"`), `missing comparison: ${slug}`);
  }
  assert.match(hub, /Compare operating models—not only feature lists/);
  assert.match(hub, /HisabTech does not claim that one ERP is correct for every organization/);
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /comparison\.caution/);
  assert.match(detail, /comparison\.decisionQuestions\.map/);
});

test("public help center is searchable and includes structured workflow articles", async () => {
  const content = await read("lib/help-center-content.ts");
  const client = await read("components/public-help-center.tsx");
  const hub = await read("app/help-center/page.tsx");
  const article = await read("app/help-center/[slug]/page.tsx");

  for (const category of ["getting-started", "sales-invoicing", "inventory", "finance", "security", "data-migration"]) {
    assert.ok(content.includes(`slug: "${category}"`), `missing help category: ${category}`);
  }
  for (const slug of ["create-your-organization", "create-your-first-customer-and-invoice", "prepare-data-for-import", "validate-opening-balances-and-cutover", "understand-audit-and-security-controls"]) {
    assert.ok(content.includes(`slug: "${slug}"`), `missing help article: ${slug}`);
  }
  assert.match(client, /useMemo/);
  assert.match(client, /type="search"/);
  assert.match(client, /setCategory/);
  assert.match(hub, /Search all documentation/);
  assert.match(article, /generateStaticParams/);
  assert.match(article, /article\.steps\.map/);
});

test("migration comparisons and help routes are public shell-free and indexed", async () => {
  const [proxy, shell, chrome, sitemap, home] = await Promise.all([
    read("lib/supabase/proxy.ts"),
    read("components/workspace-shell.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("app/sitemap.ts"),
    read("components/marketing-home.tsx"),
  ]);

  for (const route of ["/migration", "/compare", "/help-center"]) {
    assert.ok(proxy.includes(`"${route}"`), `public route missing from proxy: ${route}`);
    assert.ok(shell.includes(`"${route}"`), `route missing from shell exclusions: ${route}`);
    assert.ok(chrome.includes(`href="${route}"`), `route missing from navigation: ${route}`);
    assert.ok(sitemap.includes(`path: "${route}"`), `route missing from sitemap: ${route}`);
    assert.ok(home.includes(`href="${route}"`), `route missing from homepage: ${route}`);
  }
  assert.match(proxy, /"\/compare\/"/);
  assert.match(proxy, /"\/help-center\/"/);
  assert.match(sitemap, /marketingComparisons\.map/);
  assert.match(sitemap, /helpArticles\.map/);
});

test("new public styles load before the final brand lock", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);
  const migrationStyles = imports.indexOf("migration-comparisons-help.css");
  const homeStyles = imports.indexOf("home-implementation-resources.css");
  const finalLock = imports.indexOf("brand-final-lock.css");
  assert.ok(migrationStyles >= 0);
  assert.ok(homeStyles >= 0);
  assert.ok(finalLock > migrationStyles);
  assert.ok(finalLock > homeStyles);
});
