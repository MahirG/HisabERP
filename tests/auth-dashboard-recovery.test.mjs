import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("email authentication redirects even when optional audit storage fails",async()=>{
  const a=await read("lib/actions/email-auth.ts");
  assert.match(a,/safeNextPath\(formData\.get\("next"\) \|\| "\/workspace-home"\)/);
  assert.match(a,/biloo\.auth\.audit_unavailable/);
  assert.match(a,/redirect\(next\);/);
});
test("administrator verification takes place before protected dashboard RPCs",async()=>{
  const s=await read("app/workspace-home/page.tsx");
  const m=s.indexOf('if (user.mfaRequired && user.aal !== "aal2")');
  const q=s.indexOf("await getDashboardSnapshot()");
  assert.ok(m>=0&&q>m);
  assert.match(s,/redirect\("\/account\?verify=mfa&next=%2Fworkspace-home"\)/);
});
test("database membership failure is not confused with no company",async()=>{
  const s=await read("lib/data/context.ts");
  assert.match(s,/membership_lookup_failed/);
  assert.match(s,/if \(!data\) \{\s*if \(options\.required\) redirect\("\/onboarding"\)/);
});
test("dashboard errors show retry instead of a blank screen",async()=>{
  const [s,l,c]=await Promise.all([read("app/workspace-home/error.tsx"),read("app/workspace-home/layout.tsx"),read("app/workspace-home/dashboard-error.css")]);
  assert.match(s,/Retry dashboard/);
  assert.match(s,/reset\(\)/);
  assert.match(s,/role="alert"/);
  assert.match(l,/dashboard-error\.css/);
  assert.match(c,/biloo-dashboard-recovery/);
});