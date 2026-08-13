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
  assert.match(suite, /handleDialogKeyboard/);
  assert.match(suite, /aria-describedby="biloo-preferences-description"/);
  assert.match(suite, /customizeButtonRef/);
});

test("shared footer and consent UI cannot fall back to unstyled browser defaults", async () => {
  const layout = await source("app/layout.tsx");
  const styles = await source("app/marketing-editorial-system.css");
  const chrome = await source("components/marketing-site-chrome.tsx");
  const demo = await source("app/request-demo/page.tsx");

  assert.match(layout, /import "\.\/marketing-editorial-system\.css"/);
  assert.match(chrome, /marketing-footer-overview/);
  assert.match(chrome, /marketing-footer-column/);
  assert.match(chrome, /marketing-footer-contact-icon/);
  assert.match(chrome, /<Book\b/);
  assert.match(chrome, /<Box\b/);
  assert.match(chrome, /<Building\b/);
  assert.match(chrome, /Prefer direct contact\?/);
  assert.match(chrome, /\+251 924 093 037/);
  assert.match(chrome, /mahir@hisabtech\.com/);
  assert.match(chrome, /WhatsApp Biloo/);
  assert.match(chrome, /https:\/\/wa\.me\/251924093037/);
  assert.doesNotMatch(demo, /Prefer direct contact\?/);
  assert.match(styles, /\.marketing-editorial-v1 \.marketing-footer-top\s*\{[\s\S]*?display:\s*grid/);
  assert.match(styles, /\.marketing-editorial-v1 \.marketing-footer-direct-contact\s*\{/);
  assert.match(styles, /\.marketing-editorial-v1 \.biloo-footer-legal\s*\{/);
  assert.match(styles, /\.biloo-consent-banner\s*\{[\s\S]*?position:\s*fixed/);
  assert.match(styles, /\.biloo-consent-dialog\s*\{[\s\S]*?max-height:/);
  assert.match(styles, /\.biloo-consent-copy h2,[\s\S]*?font-size:\s*var\(--ms-fs-h4\)/);
  assert.match(styles, /@keyframes biloo-consent-enter/);
  assert.match(styles, /@media \(max-width:\s*680px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /PUBLIC ROUTE COMPLETENESS/);
  assert.match(styles, /\.comparison-detail-hero/);
  assert.match(styles, /\.help-article-layout/);
  assert.match(styles, /\.demo-form-row/);
  assert.match(styles, /\.industry-problem-outcome/);
  assert.match(styles, /\.module-problem-outcome/);
  assert.match(styles, /\.resource-article-body/);
  assert.match(styles, /\.legal-document-shell/);
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
  assert.match(marketingStyles, /--ms-ink-900:\s*#11213f/);
  assert.match(marketingStyles, /--me-ink:\s*var\(--ms-ink-900\)/);
  assert.match(marketingStyles, /\.marketing-editorial-v1/);
  assert.match(marketingStyles, /\.legal-document-shell/);
  assert.match(marketingStyles, /\.legal-contact-panel/);
});
