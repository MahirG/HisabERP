import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { widths, checkPageWidth, checkCards, checkInputs } from "./layout-checks";
const base="http://127.0.0.1:41773";
const manifest=JSON.parse(readFileSync('.next/prerender-manifest.json','utf8'));
const paths=Object.keys(manifest.routes).filter(route=>!route.startsWith('/api/')&&!route.startsWith('/_')&&!['/legacy','/robots.txt','/sitemap.xml','/manifest.webmanifest'].includes(route));
for(const route of [...paths,'/request-demo','/privacy','/terms']) test(`public route responsive: ${route}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(base+route);expect(response?.status()).toBe(200);await expect(page.locator('.wb-header')).toBeVisible();
 const essential=page.getByRole('button',{name:'Essential only',exact:true});await expect(essential).toBeVisible();await essential.click();
 for(const width of widths){await page.setViewportSize({width,height:900});await checkPageWidth(page);await checkCards(page,'.public-help-results > a,.help-featured-section > div:last-child > a,.help-category-grid > a,.comparison-index-grid > a,.integration-directory-grid > article');await checkInputs(page);}
 expect(errors).toEqual([]);
});

test('public Help Center search and article navigation',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto(base+'/help-center');
 const essential=page.getByRole('button',{name:'Essential only',exact:true});await expect(essential).toBeVisible();await essential.click();
 const search=page.getByRole('searchbox',{name:'Search the help center',exact:true});await search.fill('no-matching-document-123');await expect(page.getByRole('heading',{name:'No guide matches that search.'})).toBeVisible();await search.fill('invoice');await expect(page.locator('.public-help-results > a').first()).toBeVisible();await page.locator('.public-help-results > a').first().click();await expect(page.locator('.help-article-content')).toBeVisible();await expect(page.locator('.wb-header')).toBeVisible();
});

test('public menu, search, cookie preferences and route chrome remain accessible',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto(base);
 const essential=page.getByRole('button',{name:'Essential only',exact:true});await expect(essential).toBeVisible();await essential.click();
 const trigger=page.getByRole('button',{name:'Open menu',exact:true});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await trigger.click();await dialog.getByRole('link',{name:'Help Center',exact:true}).click();await expect(page).toHaveURL(/\/help-center/);await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Cookie settings',exact:true}).click();const preferences=page.getByRole('dialog',{name:'Choose how Biloo uses storage.'});await expect(preferences).toBeVisible();const box=await preferences.boundingBox();expect(box!.width).toBeLessThanOrEqual(320);await page.keyboard.press('Escape');await expect(preferences).toHaveCount(0);
});

test('contact form validates without submitting customer data',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto(base+'/request-demo?source=contact');
 const essential=page.getByRole('button',{name:'Essential only',exact:true});await expect(essential).toBeVisible();await essential.click();
 await page.getByRole('button',{name:'Send inquiry',exact:true}).click();expect(await page.locator('input[name=full_name]').evaluate(e=>(e as HTMLInputElement).validity.valueMissing)).toBe(true);
 await page.getByLabel('Full name *',{exact:true}).fill('Long customer name that wraps across a compact mobile screen');await page.getByLabel('Business email *',{exact:true}).fill('invalid-address');expect(await page.locator('input[name=email]').evaluate(e=>(e as HTMLInputElement).validity.typeMismatch)).toBe(true);await checkInputs(page);
});
for(const route of ['/auth/login','/auth/sign-up','/auth/forgot-password','/auth/invalid-link']) test(`authentication layout ${route}`,async({page})=>{
 const response=await page.goto(base+route);expect(response?.status()).toBe(200);for(const width of widths){await page.setViewportSize({width,height:900});await checkPageWidth(page);await checkInputs(page);}
});

for(const width of [390,1440]) test(`public Help Center visual baseline ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/help-center');await page.getByRole('button',{name:'Essential only',exact:true}).click();
 await expect(page.locator('.help-featured-section')).toHaveScreenshot(`public-help-guides-${width}.png`,{stylePath:"tests/browser/screenshot.css"});
});
