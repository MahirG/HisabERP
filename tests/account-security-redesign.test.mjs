import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
const read=p=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
test("Account still requires authentication and retains Supabase MFA and logout",async()=>{
const s=await read("app/account/page.tsx");
assert.match(s,/getCurrentUserContext\(\{ required: true \}\)/);
assert.match(s,/supabase\.auth\.mfa\.listFactors\(\)/);
assert.match(s,/<MfaSecurityPanel/);
assert.match(s,/organizationId=\{user\.organizationId\}/);
assert.match(s,/initialAal=\{user\.aal\}/);
assert.match(s,/<form action=\{signOut\}>/);
});
test("Security checks are factual and factor lookup errors are explicit",async()=>{
const s=await read("app/account/page.tsx");
assert.doesNotMatch(s,/postureScore|Security score/);
assert.match(s,/factorStatusKnown = !factorResult\.error/);
assert.match(s,/Authenticator status could not be loaded/);
assert.match(s,/acct2-security-facts/);
assert.match(s,/Signed-in identity/);
});
test("Account stays in protected ERP and recovers access",async()=>{
const s=await read("app/account/page.tsx");
assert.match(s,/safeNextPath\(query\.next \|\| "\/workspace-home"\)/);
assert.match(s,/<Link href="\/workspace-home"/);
assert.match(s,/user\.mfaRequired \? <Link href="\/security"/);
assert.match(s,/Create or reset password/);
});
