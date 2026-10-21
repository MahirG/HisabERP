import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Hisab Technologies is identified as the company behind Biloo", async () => {
  const [home, chrome, layout] = await Promise.all([
    read("components/campfire-marketing-home.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("app/layout.tsx"),
  ]);
  assert.match(home, /Your entire business/);
  assert.match(home, /One powerful operating system/);
  assert.match(home, /INTERACTIVE SAMPLE/);
  assert.match(home, /Illustrative data/);
  assert.match(home, /THE COMPANY BEHIND BILOO/);
  assert.match(home, /href="\/services"/);
  assert.match(chrome, /name: "Hisab Technologies"/);
  assert.match(chrome, /provider: \{ "@type": "Organization", name: "Hisab Technologies"/);
  assert.match(chrome, /Hisab Technologies services/);
  assert.match(chrome, /by Hisab Technologies/);
  assert.match(layout, /publisher: "Hisab Technologies"/);
  assert.doesNotMatch(chrome, /lowPrice: "1500"/);
});

test("Services is a true public page and never mounts the ERP workspace shell", async () => {
  const [page, css, publicStyles, proxy, workspace, marketing] = await Promise.all([
    read("app/services/page.tsx"),
    read("app/hisabtech-fundingpips-marketing.css"),
    read("app/public-styles.ts"),
    read("lib/supabase/proxy.ts"),
    read("components/workspace-shell.tsx"),
    read("components/marketing-experience-controller.tsx"),
  ]);
  assert.match(page, /<MarketingPageShell>/);
  assert.match(page, /canonical: "\/services"/);
  assert.match(page, /href="\/request-demo\?source=hisab-services"/);
  assert.match(page, /href="\/product-tour"/);
  assert.equal((page.match(/id: "0[1-8]"/g) ?? []).length, 8);
  assert.match(publicStyles, /hisabtech-fundingpips-marketing\.css/);
  assert.match(proxy, /"\/services"/);
  assert.match(workspace, /"\/services"/);
  assert.match(marketing, /"\/services"/);
  assert.match(css, /\.marketing-site-v2 \.hisab-services-hero/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /\.workspace-shell|\.workspace-app/);
});
