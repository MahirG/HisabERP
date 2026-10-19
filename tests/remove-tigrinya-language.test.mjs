import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("website and ERP ship an English-only locale selector", async () => {
  const [provider,marketing,config]=await Promise.all([
    read("components/language-provider.tsx"),
    read("components/marketing-site-chrome.tsx"),
    read("lib/config.ts"),
  ]);
  assert.match(provider,/root\.lang = "en"/);
  assert.match(provider,/return null;/);
  assert.match(marketing,/const c = copy\.en;/);
  assert.doesNotMatch(marketing,/changeLocale|wb-language-switch|wb-utility-language/);
  assert.match(config,/supportedLocales: \["en"\]/);
});

test("server and client ignore previously saved non-English language preferences", async () => {
  const [layout,server,requests]=await Promise.all([
    read("app/layout.tsx"),read("lib/server-locale.ts"),read("lib/server-translations.ts")
  ]);
  assert.match(layout,/dataset\.publicLanguage = 'en'/);
  assert.doesNotMatch(layout,/storedLanguage === 'am'|publicLanguage === 'am'/);
  assert.match(server,/return "en"/);
  assert.match(requests,/return "en"/);
});

test("translation runtime does not bundle unused languages", async () => {
  const [t,ui,build]=await Promise.all([
    read("lib/translations.ts"),read("lib/ui-translations.ts"),read("scripts/build-i18n-index.mjs")
  ]);
  assert.doesNotMatch(t,/import am from/);
  assert.doesNotMatch(ui,/ui-catalog-01\.json|amharic-fallback/);
  assert.match(ui,/languages: \["en"\]/);
  assert.doesNotMatch(build,/ui\.am\.json/);
});
