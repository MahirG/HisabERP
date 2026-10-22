import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

// Run after `npm run build`; optionally verify dynamic paths against a server.
const root = process.cwd();
const output = path.join(root, ".next/server/app");
const origin = "https://hisabtech.com";
const read = (name) => readFile(path.join(output, name), "utf8");
const sitemap = await read("sitemap.xml.body");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(urls.length > 30, "public sitemap unexpectedly small");
assert.equal(new Set(urls).size, urls.length, "duplicate sitemap entries");
const rendered = [];
const dynamic = [];
for (const url of urls) {
  assert.equal(new URL(url).origin, origin, `noncanonical sitemap origin: ${url}`);
  const route = new URL(url).pathname;
  assert.doesNotMatch(route, /^\/(auth|workspace-home|account|billing|checkout|modules|docs)(\/|$)/);
  const filename = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  let html;
  try { html = await read(filename); } catch (error) { if (error.code !== "ENOENT") throw error; dynamic.push(route); continue; }
  verifyPage(html, url);
  rendered.push(route);
}

function tag(html, field, value) {
  return [...html.matchAll(/<(?:meta|link)\s+[^>]+>/g)].map((match) => match[0]).filter((item) => item.includes(`${field}="${value}"`));
}
function verifyPage(html, url) {
  const canonicals = tag(html, "rel", "canonical");
  assert.equal(canonicals.length, 1, `canonical count: ${url}`);
  assert.ok(canonicals[0].includes(`href="${url}"`) || (url === `${origin}/` && canonicals[0].includes(`href="${origin}"`)), `wrong canonical: ${url}`);
  assert.match(tag(html, "name", "robots")[0] || "", /content="index, follow"/, `indexability: ${url}`);
  assert.ok(tag(html, "property", "og:url")[0]?.includes(url.replace(/\/$/, "")), `share URL: ${url}`);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, `share card: ${url}`);
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1, `H1 count: ${url}`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `description: ${url}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
}

for (const slug of ["biloo-vs-odoo", "biloo-vs-erpnext"]) {
  const html = await read(`compare/${slug}.html`);
  assert.match(html, /Know what is being compared/);
  assert.match(html, /Official sources/);
  assert.match(html, /may be the better fit/);
  assert.match(html, /BreadcrumbList/);
}
for (const slug of ["erp-costs-ethiopia", "multi-branch-business-controls", "inventory-software-wholesale-ethiopia", "choose-erp-for-ethiopian-business"]) {
  const html = await read(`resources/${slug}.html`);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /By <a[^>]+href="\/about"/);
  assert.match(html, /BreadcrumbList/);
}
const robots = await read("robots.txt.body");
assert.match(robots, /Sitemap: https:\/\/hisabtech.com\/sitemap.xml/);
assert.doesNotMatch(sitemap + robots, /www\.hisabtech\.com/);
assert.doesNotMatch(robots, /Disallow: \/auth/);
assert.ok(!sitemap.includes(new Date().toISOString()), "build-time lastmod must not be fabricated");
await access(path.join(root, "public/biloo-erp-social.png"));
const csv = await readFile(path.join(root, "public/templates/erp-evaluation-checklist.csv"), "utf8");
assert.ok(csv.trim().split("\n").every((line) => line.split(",").length === 8), "CSV column mismatch");

const baseIndex = process.argv.indexOf("--base-url");
if (baseIndex >= 0) {
  const base = process.argv[baseIndex + 1];
  const get = async (route) => {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(20000), redirect: "manual" });
    return { response, html: await response.text() };
  };
  for (const route of dynamic) {
    const { response, html } = await get(route);
    assert.equal(response.status, 200, `dynamic public route: ${route}`);
    verifyPage(html, new URL(route, origin).href);
  }
  for (const route of ["/auth/login", "/auth/email-sign-up", "/request-demo?submitted=1", "/request-demo?error=Example"]) {
    const { response, html } = await get(route);
    assert.equal(response.status, 200, `status: ${route}`);
    assert.match(tag(html, "name", "robots")[0] || "", /noindex/, `private/state page indexability: ${route}`);
  }
  for (const route of ["/workspace-home", "/account", "/finance", "/templates/private.csv"]) {
    const { response } = await get(route);
    assert.ok([302, 303, 307, 308].includes(response.status), `anonymous workspace must redirect: ${route}`);
    assert.match(response.headers.get("location") || "", /\/auth\/login/);
  }
  // Known public dynamic slug patterns must produce genuine 404s.
  const download = await get("/templates/erp-evaluation-checklist.csv");
  assert.equal(download.response.status, 200, "public checklist must not redirect to authentication");
  assert.match(download.html, /^Area,Requirement,Priority,/);
  assert.doesNotMatch(download.html, /<html/);
  const missing = await get("/compare/this-comparison-does-not-exist");
  assert.equal(missing.response.status, 404);
  console.log("Dynamic metadata, auth noindex, anonymous access boundaries and 404 checks passed.");
}
console.log(`SEO contract passed: ${rendered.length} prerendered public pages; ${dynamic.length} dynamic public pages; ${urls.length} sitemap URLs.`);
