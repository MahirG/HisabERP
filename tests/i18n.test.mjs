import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("English source indexing does not generate Amharic runtime assets",async()=>{
  const [index,ui,translation]=await Promise.all([
    read("scripts/build-i18n-index.mjs"),
    read("lib/ui-translations.ts"),
    read("lib/translations.ts"),
  ]);
  assert.match(index,/ui\.en\.json/);
  assert.doesNotMatch(index,/ui\.am\.json/);
  assert.doesNotMatch(ui,/amharic-fallback|ui-catalog-01\.json/);
  assert.doesNotMatch(translation,/import am from/);
});

test("English-only preference bootstrapping has no language switching",async()=>{
  const [provider,layout,publicLoc]=await Promise.all([
    read("components/language-provider.tsx"),
    read("app/layout.tsx"),
    read("lib/public-localization.ts")
  ]);
  assert.match(provider,/dictionary: dictionaries\.en/);
  assert.match(provider,/root\.lang = "en"/);
  assert.match(layout,/root\.dataset\.language = language/);
  assert.match(publicLoc,/return value\.en/);
});

test("CI still runs source integrity and build checks",async()=>{
  const [p,w,a,q]=await Promise.all([
    read("package.json"),
    read(".github/workflows/ci.yml"),
    read("scripts/i18n-audit.mjs"),
    read("scripts/translation-quality.mjs")
  ]);
  assert.match(p,/"i18n:check"/);
  assert.match(p,/"i18n:quality"/);
  assert.match(w,/Localization coverage/);
  assert.match(a,/process\.argv\.includes\("--check"\)/);
  assert.match(q,/process\.argv\.includes\("--check"\)/);
});
