import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("business learning center and company pages are bilingual and substantive", async () => {
  const [resources, article, about, data] = await Promise.all([
    read("app/resources/page.tsx"),
    read("app/resources/[slug]/page.tsx"),
    read("app/about/page.tsx"),
    read("lib/marketing-resources.ts"),
  ]);
  assert.match(resources, /HisabTech Business Learning Center/);
  assert.match(resources, /የHisabTech የንግድ ትምህርት ማዕከል/);
  assert.match(article, /generateStaticParams/);
  assert.match(data, /move-from-excel-to-erp/);
  assert.match(data, /choose-erp-for-ethiopian-business/);
  assert.match(about, /Mahir Aman/);
  assert.match(about, /ማሂር አማን/);
  assert.match(about, /No fabricated testimonials, certifications or performance claims/);
});

test("public language switching translates text, attributes, metadata and uncatalogued copy", async () => {
  const [provider, translations, fallback, chrome] = await Promise.all([
    read("components/language-provider.tsx"),
    read("lib/ui-translations.ts"),
    read("lib/amharic-fallback.ts"),
    read("components/marketing-site-chrome.tsx"),
  ]);
  assert.match(provider, /localizeHead/);
  assert.match(provider, /HTMLInputElement/);
  assert.match(provider, /i18n-switching/);
  assert.match(provider, /router\.refresh/);
  assert.match(translations, /translateUnknownAmharic/);
  assert.match(fallback, /Business operating system/);
  assert.match(fallback, /የንግድ ማስኬጃ ስርዓት/);
  assert.match(chrome, /LanguageSelector compact/);
  assert.match(chrome, /የንግድ ማስኬጃ ስርዓት/);
});

test("website has conversion, structured data, discovery and direct-contact paths", async () => {
  const [chrome, home, demo, layout] = await Promise.all([
    read("components/marketing-site-chrome.tsx"),
    read("components/marketing-home.tsx"),
    read("app/request-demo/page.tsx"),
    read("app/layout.tsx"),
  ]);
  assert.match(chrome, /SoftwareApplication/);
  assert.match(chrome, /Organization/);
  assert.match(chrome, /marketing-conversion-bar/);
  assert.match(chrome, /wa\.me\/251924093037/);
  assert.match(home, /home-final-recommendations/);
  assert.match(home, /Business Learning Center/);
  assert.match(home, /About HisabTech/);
  assert.match(demo, /MarketingHeader/);
  assert.match(demo, /WhatsApp HisabTech/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /openGraph/);
});

test("public experience includes smooth motion, accessibility and reduced-motion protection", async () => {
  const [styles, homeStyles, layout] = await Promise.all([
    read("app/public-experience-final.css"),
    read("app/home-final-recommendations.css"),
    read("app/layout.tsx"),
  ]);
  assert.match(styles, /scroll-behavior:smooth/);
  assert.match(styles, /public-skip-link/);
  assert.match(styles, /focus-visible/);
  assert.match(styles, /content-visibility:auto/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(homeStyles, /home-final-recommendation-grid/);
  assert.ok(layout.indexOf("public-experience-final.css") < layout.indexOf("brand-final-lock.css"));
});

test("final public routes are public, shell-free and discoverable", async () => {
  const [proxy, shell, sitemap, chrome] = await Promise.all([
    read("lib/supabase/proxy.ts"),
    read("components/workspace-shell.tsx"),
    read("app/sitemap.ts"),
    read("components/marketing-site-chrome.tsx"),
  ]);
  for (const route of ["/resources", "/about"]) {
    assert.ok(proxy.includes(`"${route}"`), `missing public route ${route}`);
    assert.ok(shell.includes(`"${route}"`), `missing shell exclusion ${route}`);
    assert.ok(sitemap.includes(`path: "${route}"`), `missing sitemap route ${route}`);
    assert.ok(chrome.includes(`href="${route}"`), `missing navigation route ${route}`);
  }
  assert.match(proxy, /"\/resources\/"/);
  assert.match(sitemap, /marketingResources/);
});

test("web manifest and crawler policy are present", async () => {
  const [manifest, robots] = await Promise.all([read("app/manifest.ts"), read("app/robots.ts")]);
  assert.match(manifest, /HisabERP/);
  assert.match(manifest, /#DA7757/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /\/api\//);
});
