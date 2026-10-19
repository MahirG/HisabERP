import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
const read = path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
test("Marketing menus expose no language controls or Amharic copy",async()=>{
 const s=await read("components/marketing-site-chrome.tsx");
 assert.doesNotMatch(s,/changeLocale|wb-utility-language|wb-language-switch|\bLocale\b|[\u1200-\u137f]/);
 assert.match(s,/const c = copy\.en/);
});
test("Legacy saved preferences are ignored during server and client startup",async()=>{
 const [layout,server,trans,config]=await Promise.all([
 read("app/layout.tsx"),read("lib/server-locale.ts"),read("lib/server-translations.ts"),read("lib/config.ts")]);
 assert.doesNotMatch(layout,/storedLanguage === 'am'|publicLanguage === 'am'/);
 assert.match(layout,/dataset\.publicLanguage = 'en'/);
 assert.match(server,/return "en"/);
 assert.match(trans,/return "en"/);
 assert.match(config,/supportedLocales: \["en"\]/);
});
test("Marketing pages render only English source copy",async()=>{
 const [about,resources,publicLocal]=await Promise.all([
 read("app/about/page.tsx"),read("app/resources/page.tsx"),read("lib/public-localization.ts")]);
 assert.doesNotMatch(about+resources,/[\u1200-\u137f]/);
 assert.doesNotMatch(about+resources,/language === "am"/);
 assert.match(publicLocal,/return value\.en/);
});
