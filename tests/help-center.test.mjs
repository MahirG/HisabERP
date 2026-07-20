import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("header help surface mounts the complete searchable knowledge center", async () => {
  const [commandCenter, helpCenter] = await Promise.all([
    read("components/workspace-command-center.tsx"),
    read("components/help-center-panel.tsx"),
  ]);

  assert.match(commandCenter, /import \{ HelpCenterPanel \} from "\.\/help-center-panel"/);
  assert.match(commandCenter, /surface === "help" && <HelpCenterPanel activeLabel=\{activeLabel\} onNavigate=\{closeSurface\} \/>/);
  assert.match(helpCenter, /const helpCategories: HelpCategory\[\]/);
  assert.match(helpCenter, /const \[helpQuery, setHelpQuery\] = useState\(""\)/);
  assert.match(helpCenter, /Search setup, invoices, stock, reports, security/);
  assert.match(helpCenter, /<details key=\{article\.title\}>/);
  assert.match(helpCenter, /<summary>/);
  assert.match(helpCenter, /Help content is read-only/);
});

test("help center covers core ERP workflows and troubleshooting", async () => {
  const helpCenter = await read("components/help-center-panel.tsx");

  for (const category of [
    "getting-started",
    "sales-customers",
    "inventory-purchasing",
    "finance-reporting",
    "operations-compliance",
    "security-admin",
    "troubleshooting",
  ]) {
    assert.match(helpCenter, new RegExp(`id: "${category}"`));
  }

  for (const route of [
    "/onboarding",
    "/sales/invoices/new",
    "/customers",
    "/inventory",
    "/purchasing",
    "/finance",
    "/finance/journals",
    "/reconciliation",
    "/reports",
    "/hr",
    "/e-invoicing",
    "/account",
    "/security",
  ]) {
    assert.match(helpCenter, new RegExp(route.replaceAll("/", "\\/")));
  }

  for (const topic of [
    "First-time setup checklist",
    "Create a sales invoice",
    "Warehouse and stock controls",
    "Journal entries and period locks",
    "Production controls and database health",
    "Totals or reports do not match",
    "Stock quantity looks wrong",
  ]) {
    assert.match(helpCenter, new RegExp(topic));
  }
});

test("dedicated setup documentation route renders the full help center", async () => {
  const [page, wrapper, layout, css] = await Promise.all([
    read("app/docs/setup/page.tsx"),
    read("components/help-center-page.tsx"),
    read("app/layout.tsx"),
    read("app/help-center.css"),
  ]);

  assert.match(page, /import \{ HelpCenterPage \}/);
  assert.match(page, /return <HelpCenterPage \/>/);
  assert.match(wrapper, /<HelpCenterPanel activeLabel=\{t\("Help Center"\)\}/);
  assert.match(layout, /workspace-command-center\.css";\nimport "\.\/help-center\.css";/);
  assert.match(css, /\.workspace-assistance-help/);
  assert.match(css, /\.help-featured-grid/);
  assert.match(css, /\.help-learning-path/);
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("help center English and Amharic catalogs are loaded", async () => {
  const translations = await read("lib/ui-translations.ts");

  assert.match(translations, /import catalog12 from "\.\/locales\/ui-catalog-12\.json"/);
  assert.match(translations, /import catalog16 from "\.\/locales\/ui-catalog-16\.json"/);
  assert.match(translations, /catalog12,/);
  assert.match(translations, /catalog16,/);

  const catalog12 = JSON.parse(await read("lib/locales/ui-catalog-12.json"));
  const catalog16 = JSON.parse(await read("lib/locales/ui-catalog-16.json"));
  assert.ok(catalog12.length >= 35);
  assert.ok(catalog16.length >= 10);
  assert.ok(catalog12.every((entry) => entry.source && entry.am));
  assert.ok(catalog16.every((entry) => entry.source && entry.am));
});
