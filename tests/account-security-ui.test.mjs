import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
const read=p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
test("Current Account design is scoped, responsive and keyboard accessible",async()=>{
const [layout,css]=await Promise.all([read("app/account/layout.tsx"),read("app/account/account-finish.css")]);
assert.match(layout,/import "\.\/account-finish\.css";/);
for(const k of ["acct2-heading","acct2-security-facts","acct2-grid","acct2-details","acct2-provider-links","acct2-auth"])assert.match(css,new RegExp(k));
assert.match(css,/@media\(max-width:760px\)/);
assert.match(css,/:focus-visible/);
assert.match(css,/-webkit-text-fill-color/);
});
test("MFA code input is not unexpectedly auto-focused on Android navigation",async()=>{
const s=await read("components/mfa-security-panel.tsx");
assert.doesNotMatch(s,/<input autoFocus inputMode="numeric"/);
assert.match(s,/supabase\.auth\.mfa\.verify/);
assert.match(s,/supabase\.auth\.mfa\.unenroll/);
});
