import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import postcss from 'postcss';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('every protected route family loads shared styles from a server layout',async()=>{
 for(const route of ['auth','workspace-home','modules','finance','sales','purchasing','inventory','customers','hr','billing','reports','reconciliation','account','onboarding','security','e-invoicing','checkout','docs']){
  assert.match(await read(`app/${route}/layout.tsx`),/import "\.\.\/internal-styles"/,'Missing before-paint styles: '+route);
 }
 const css=await read('app/internal-styles.ts');assert.match(css,/import "\.\/help-center\.css"/);
 assert.doesNotMatch(await read('components/internal-style-loader.tsx'),/"\/security"/,'Production Controls is an internal page');
});

test('restored public styles cannot escape the public component boundary',async()=>{
 for(const file of ['market-expansion','proof-trust-integrations','migration-comparisons-help']){
  postcss.parse(await read('app/'+file+'.css')).walkRules(rule=>{
   if(rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
   for(const selector of rule.selectors)assert.ok(selector.includes('.marketing-site-v2'),selector);
  });
 }
});

test('Help Center controls use valid accessible markup and no duplicate label target',async()=>{
 const source=await read('components/help-center-panel.tsx');assert.match(source,/role="search"/);assert.match(source,/useId\(\)/);assert.match(source,/htmlFor=\{searchId\}/);assert.match(source,/id=\{searchId\}/);assert.match(source,/type="search"/);
 const css=await read('app/help-center.css');assert.doesNotMatch(css,/font:\s*\d+.*inherit/);assert.doesNotMatch(css,/margin-top:\s*-\d/);
});

test('fonts are bundled with licenses and never fetched from Google during build',async()=>{
 assert.match(await read('app/layout.tsx'),/next\/font\/local/);assert.doesNotMatch(await read('app/marketing-editorial-system.css'),/fonts\.googleapis\.com/);
 for(const name of ['manrope-latin-wght-normal.woff2','nunito-sans-latin-wght-normal.woff2','Manrope-LICENSE.txt','NunitoSans-LICENSE.txt']) assert.ok((await readFile(new URL('../public/fonts/'+name,import.meta.url))).length>100);
});

test('public authentication links do not spend sign-in rate limits on speculative requests',async()=>{
 const source=await read('components/marketing-site-chrome.tsx');
 assert.match(source,/<Link prefetch=\{false\} href="\/auth\/login/);
 assert.match(source,/<Link prefetch=\{false\} href="\/auth\/email-sign-up/);
});
