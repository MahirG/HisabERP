import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("marketing website exposes balanced cookie consent controls", async () => {
  const suite = await source("components/marketing-legal-suite.tsx");

  assert.match(suite, /Accept all/);
  assert.match(suite, /Essential only/);
  assert.match(suite, /Customize/);
  assert.match(suite, /biloo-cookie-consent-v1/);
  assert.match(suite, /biloo:open-cookie-preferences/);
  assert.match(suite, /Privacy Policy/);
  assert.match(suite, /Website Terms/);
  assert.match(suite, /Cookie settings/);
  assert.match(suite, /analytics:\s*boolean/);
});

test("privacy and terms pages use the shared premium legal layout", async () => {
  const privacy = await source("app/privacy/page.tsx");
  const terms = await source("app/terms/page.tsx");
  const layout = await source("components/legal-document-page.tsx");
  const sitemap = await source("app/sitemap.ts");

  assert.match(privacy, /LegalDocumentPage/);
  assert.match(privacy, /Cookies and similar technologies/);
  assert.match(privacy, /Your choices and rights/);
  assert.match(terms, /LegalDocumentPage/);
  assert.match(terms, /Acceptable use/);
  assert.match(terms, /governing law/i);
  assert.match(layout, /legal-document-shell/);
  assert.match(layout, /mahir@hisabtech\.com/);
  assert.match(sitemap, /path: "\/privacy"/);
  assert.match(sitemap, /path: "\/terms"/);
});

test("single editorial stylesheet keeps a coherent public hierarchy", async () => {
  const controller = await source("components/marketing-experience-controller.tsx");
  const marketingStyles = await source("app/marketing-editorial-system.css");

  assert.doesNotMatch(controller, /<link[^>]+stylesheet/);
  assert.match(marketingStyles, /--me-ink:\s*#11213f/);
  assert.match(marketingStyles, /\.marketing-editorial-v1/);
  assert.match(marketingStyles, /\.legal-document-shell/);
  assert.match(marketingStyles, /\.legal-contact-panel/);
});
