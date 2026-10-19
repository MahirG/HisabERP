import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = path => readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("Password recovery uses the sign-in layout and retains secure Supabase action", async()=>{
 const [forgot,layout,card,login,style,server] = await Promise.all([
  read("app/auth/forgot-password/page.tsx"),
  read("app/auth/forgot-password/layout.tsx"),
  read("components/email-auth-card.tsx"),
  read("app/auth/login/page.tsx"),
  read("app/auth/forgot-password/recovery-finish.css"),
  read("lib/actions/email-auth.ts")
 ]);
 assert.match(layout,/import "\.\.\/login\/login-finish\.css"/);
 assert.match(layout,/import "\.\/recovery-finish\.css"/);
 assert.match(card,/variant === "sign-up" \|\| variant === "recovery"/);
 assert.match(card,/biloo-login-shell/);
 assert.match(card,/biloo-login-form-pane/);
 assert.match(card,/biloo-login-benefits/);
 assert.match(forgot,/variant="recovery"/);
 assert.match(forgot,/className="biloo-login-form"/);
 assert.match(forgot,/className="biloo-login-input-shell"/);
 assert.match(forgot,/className="biloo-login-primary"/);
 assert.match(forgot,/action=\{requestPasswordReset\}/);
 assert.match(forgot,/safeNextPath\(p\.next \|\| "\/workspace-home"\)/);
 assert.match(forgot,/Back to sign in/);
 assert.match(login,/className="biloo-login-input-shell"/);
 assert.match(style,/input#recovery-email/);
 assert.match(style,/font-size:16px!important/);
 assert.match(style,/@media\(max-width:620px\)/);
 assert.match(server,/supabase\.auth\.resetPasswordForEmail/);
 assert.match(server,/redirectTo: confirmationUrl\("\/auth\/reset-password"\)/);
 assert.match(server,/Deliberately identical response to prevent account enumeration/);
});

test("Help Center search preserves search filtering and supports category deep links",async()=>{
 const [page,component]=await Promise.all([
  read("app/help-center/page.tsx"),
  read("components/public-help-center.tsx")
 ]);
 assert.match(page,/PublicHelpCenter articles=\{helpArticles\} categories=\{helpCategories\}/);
 assert.match(page,/\/help-center\?category=\$\{encodeURIComponent\(category\.slug\)\}#guides/);
 assert.match(component,/new URLSearchParams\(window\.location\.search\)\.get\("category"\)/);
 assert.match(component,/categories\.some\(item => item\.slug === requested\)/);
 assert.match(component,/setCategory\(requested\)/);
 assert.match(component,/article\.category === category/);
 assert.match(component,/role="group"/);
 assert.match(component,/type="search"/);
 assert.match(component,/role="status"/);
});

test("All five pages retain shared Biloo header/footer and coherent responsive page styles",async()=>{
 const paths=[
  "app/help-center/page.tsx",
  "app/industries/page.tsx",
  "app/industries/[slug]/page.tsx",
  "app/customer-stories/page.tsx",
 ];
 const [base,design,entry] = await Promise.all([
  read("app/public-seven-pages.css"),read("app/public-five-pages.css"),read("app/public-styles.ts")
 ]);
 for(const path of paths){
  const page=await read(path);
  assert.match(page,/<MarketingPageShell className="biloo-seven-page biloo-five-page">/);
  assert.match(page,/compact illustrative informational/);
 }
 assert.match(base,/erp-evidence-information/);
 assert.ok(entry.indexOf('import "./public-five-pages.css"') > entry.indexOf('import "./public-seven-pages.css"'));
 for(const selector of [
  "help-public-hero","industry-index-hero","industry-detail-hero","proof-page-hero",
  "public-help-search","public-help-filter","industry-card-grid","industry-workflow-grid",
  "proof-standard-grid","marketing-cta-v2","erp-evidence-compact"
 ])assert.ok(design.includes(selector),selector);
 for(const breakpoint of ["@media(max-width:1020px)","@media(max-width:820px)",
  "@media(max-width:600px)","prefers-reduced-motion"])
  assert.ok(design.includes(breakpoint),breakpoint);
 assert.match(design,/:focus-visible/);
 assert.match(design,/min-height:44px!important/);
 assert.match(design,/#14213d/);
 assert.match(design,/#fca311/);
});

test("Industries, Retail detail and customer proof preserve facts and navigation",async()=>{
 const [index,detail,stories,industries]=await Promise.all([
  read("app/industries/page.tsx"),
  read("app/industries/[slug]/page.tsx"),
  read("app/customer-stories/page.tsx"),
  read("lib/marketing-industries.ts"),
 ]);
 assert.match(index,/marketingIndustries\.map/);
 assert.match(index,/href=\{\`\/industries\/\$\{industry\.slug\}\`\}/);
 assert.match(detail,/generateStaticParams/);
 assert.match(detail,/getMarketingIndustry\(slug\)/);
 assert.match(detail,/industry\.capabilities\.map/);
 assert.match(detail,/industry\.workflow\.map/);
 assert.match(detail,/industry\.modules\.map/);
 assert.match(detail,/\/request-demo\?industry=\$\{industry\.slug\}/);
 assert.match(industries,/slug: "retail"/);
 assert.match(stories,/inspectableProof\.map/);
 assert.match(stories,/referencePrograms\.map/);
 assert.match(stories,/proofStandards\.map/);
 assert.match(stories,/does not use invented company logos/);
});
