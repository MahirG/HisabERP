import { test, expect } from "@playwright/test";
import { widths, checkPageWidth, checkCards, checkInputs } from "./layout-checks";
const fixture = "http://127.0.0.1:41774";
const routes = ["/", "/finance", "/sales", "/purchasing", "/inventory", "/hr", "/reconciliation", "/e-invoicing", "/docs/setup"];
for (const route of routes) test(`read-only workspace responsive: ${route}`, async ({page}) => {
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(fixture+route); await expect(page.locator("main")).toBeVisible();
  for(const width of widths){
    await page.setViewportSize({width,height:900});
    await checkPageWidth(page);
    await checkCards(page,'.finance-kpis > article,.sales-kpis > article,.core-kpis > article,.recon-kpis > article,.einvoice-kpis > article,.help-featured-grid > a,.help-learning-path li');
    await checkInputs(page);
  }
  expect(errors).toEqual([]);
});

test("Help Center search, guide layout, modal focus, dismissal and reduced viewport", async ({page}) => {
 await page.setViewportSize({width:390,height:844});await page.goto(fixture+"/purchasing");
 const trigger=page.getByTitle("Help Center",{exact:true});await trigger.click();
 const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();
 for(const width of widths){
  await page.setViewportSize({width,height:844});
  const box=await dialog.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);expect(box!.y+box!.height).toBeLessThanOrEqual(845);
  await checkCards(page,'.help-featured-grid > a,.help-learning-path li');await checkInputs(page);
  const overlap=await page.locator('.help-guide-copy').evaluateAll(items=>items.some(item=>{const title=item.querySelector('strong')!.getBoundingClientRect();const copy=item.querySelector('small')!.getBoundingClientRect();return title.bottom>copy.top;}));expect(overlap).toBe(false);
 }
 await page.setViewportSize({width:390,height:844});
 const search=page.getByRole("searchbox",{name:"Search help articles"});await search.fill("invoice");await expect(page.locator('[id$=help-library-title]')).toContainText("matching articles");
 await search.fill("no-guide-matches-this-unique-query");await expect(page.getByText("No help articles match your search.",{exact:true})).toBeVisible();await page.getByRole("button",{name:"Clear search",exact:true}).click();
 await page.locator('.help-article-list summary').first().click();await expect(page.locator('.help-article-list details').first()).toHaveAttribute('open','');
 await search.focus();await page.setViewportSize({width:390,height:420});await expect(dialog.getByRole('button',{name:'Close active panel'})).toBeInViewport();
 await page.locator('.help-safety-note').scrollIntoViewIfNeeded();await expect(page.locator('.help-safety-note')).toBeInViewport();
 const controls=dialog.locator('a[href],button,input,summary');await controls.last().focus();await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await page.locator('.help-featured-grid a[href="/sales/invoices/new"]').click();await expect(page).toHaveURL(/\/sales\/invoices\/new/);await expect(page.getByRole('dialog')).toHaveCount(0);
});

test("workspace hamburger stays above utility bars and navigates without losing controls",async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto(fixture+'/finance');
 // Reproduce the reported utility-bar stacking conflict, including extreme z-index values.
 await page.locator('.workspace-command-header').evaluate(element=>(element as HTMLElement).style.setProperty('z-index','2147483647','important'));
 const trigger=page.locator('.mobile-menu-trigger');await trigger.click();
 const drawer=page.getByRole('dialog',{name:'Workspace menu'});await expect(drawer).toBeVisible();
 await expect(page.locator('#primary-sidebar')).not.toBeVisible();
 await expect(drawer.locator('img[alt="Biloo"]')).toHaveCount(1);
 await expect(drawer.getByRole('link',{name:'Finance',exact:true})).toHaveAttribute('aria-current','page');
 expect(await drawer.evaluate(element=>element.matches(':modal'))).toBe(true);
 const topmost=await drawer.locator('header').evaluate(element=>{const rect=element.getBoundingClientRect();return element.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2))});expect(topmost).toBe(true);
 const close=drawer.getByRole('button',{name:'Close navigation'});await expect(close).toBeFocused();
 const lastControl=drawer.locator('footer a');await lastControl.focus();await page.keyboard.press('Tab');expect(await drawer.evaluate(e=>e.contains(document.activeElement))).toBe(true);
 await drawer.getByRole('link',{name:'Inventory',exact:true}).click();await expect(page).toHaveURL(/\/inventory/);await expect(drawer).not.toBeVisible();await expect(page.locator('.core-page')).toBeVisible();
 await trigger.click();await page.keyboard.press('Escape');await expect(drawer).not.toBeVisible();await expect(trigger).toBeFocused();
 await trigger.click();await expect(drawer).toBeVisible();const bounds=await drawer.boundingBox();await page.mouse.click(bounds!.x+bounds!.width-12,200);await expect(drawer).not.toBeVisible();await expect(trigger).toBeFocused();
 await page.locator('.mobile-bottom-nav button').click();await expect(drawer).toBeVisible();
 await page.setViewportSize({width:1024,height:740});await expect(drawer).not.toBeVisible();await expect(page.locator('#primary-sidebar')).toBeVisible();
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});

for(const width of [320,360,375,390,430,768]) test(`mobile navigation containment and scrolling ${width}`,async({page})=>{
 await page.setViewportSize({width,height:740});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(fixture+'/e-invoicing');await page.locator('.mobile-menu-trigger').click();
 const drawer=page.getByRole('dialog',{name:'Workspace menu'});
 await expect(drawer).toBeVisible();await checkPageWidth(page);
 const layout=await drawer.evaluate(element=>{
  const nav=element.querySelector('nav')!;const footer=element.querySelector('footer')!;const header=element.querySelector('header')!;
  const n=nav.getBoundingClientRect(),f=footer.getBoundingClientRect(),h=header.getBoundingClientRect();
  return {navTop:n.top,navBottom:n.bottom,footerTop:f.top,footerBottom:f.bottom,headerBottom:h.bottom,scrollable:nav.scrollHeight>nav.clientHeight,
   icons:[...nav.querySelectorAll('svg')].map(icon=>({width:icon.getBoundingClientRect().width,height:icon.getBoundingClientRect().height})),
   links:[...nav.querySelectorAll('a')].map(link=>({left:link.getBoundingClientRect().left,right:link.getBoundingClientRect().right,height:link.getBoundingClientRect().height}))};
 });
 expect(layout.headerBottom).toBeLessThanOrEqual(layout.navTop+0.5);expect(layout.navBottom).toBeLessThanOrEqual(layout.footerTop+0.5);expect(layout.footerBottom).toBeLessThanOrEqual(741);expect(layout.scrollable).toBe(true);
 for(const icon of layout.icons){expect(icon.width).toBe(21);expect(icon.height).toBe(21)}
 for(const link of layout.links){expect(link.left).toBeGreaterThanOrEqual(0);expect(link.right).toBeLessThanOrEqual(width);expect(link.height).toBeGreaterThanOrEqual(44)}
 const lastLink=drawer.locator('nav a').last();await lastLink.scrollIntoViewIfNeeded();await expect(lastLink).toBeInViewport();
 const hit=await lastLink.evaluate(element=>{const r=element.getBoundingClientRect();return element.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))});expect(hit).toBe(true);
 await expect(drawer.getByRole('button',{name:'Close navigation'})).toBeInViewport();
});

for(const width of [320,390,768]) test(`mobile navigation visual baseline ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(fixture+'/e-invoicing');await page.locator('.mobile-menu-trigger').click();
 await expect(page.getByRole('dialog',{name:'Workspace menu'})).toHaveScreenshot(`mobile-navigation-${width}.png`);
});

test('mobile menu handles long organization names, enlarged labels and short landscape',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(fixture+'/finance');await page.locator('.mobile-menu-trigger').click();
 const drawer=page.getByRole('dialog',{name:'Workspace menu'});
 await drawer.locator('strong').first().evaluate(element=>element.textContent='NexRide International Transportation and Electronic Invoicing Services ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
 await drawer.locator('nav a span:nth-child(2)').evaluateAll(elements=>elements.forEach(element=>(element as HTMLElement).style.fontSize='24px'));
 await expect(drawer.getByRole('button',{name:'Close navigation'})).toBeInViewport();
 const collision=await drawer.locator('nav a').evaluateAll(elements=>elements.some(element=>{const icon=element.querySelector('span')!.getBoundingClientRect();const label=element.querySelectorAll('span')[1].getBoundingClientRect();return icon.right>label.left||element.scrollWidth>element.clientWidth}));expect(collision).toBe(false);
 await page.setViewportSize({width:740,height:360});
 const last=drawer.locator('nav a').last();await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();await expect(drawer.getByRole('button',{name:'Close navigation'})).toBeInViewport();
 expect(await drawer.evaluate(element=>element.scrollWidth<=innerWidth&&element.getBoundingClientRect().bottom<=innerHeight)).toBe(true);
});
for(const width of [390,1440]) test(`Help Center visual baseline ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(fixture+'/finance');await page.getByTitle('Help Center',{exact:true}).click();await expect(page.getByRole('dialog')).toHaveScreenshot(`help-center-${width}.png`);
});

test("live authenticated route coverage requires a safe test session",async({browser})=>{
 test.skip(!process.env.HISAB_E2E_STORAGE_STATE,"No safe authenticated test account/session was supplied; fixtures do not prove live business workflows.");
 const context=await browser.newContext({storageState:process.env.HISAB_E2E_STORAGE_STATE});const page=await context.newPage();
 for(const route of ['/','/finance','/sales','/purchasing','/inventory','/customers','/hr','/reports','/reconciliation','/account','/onboarding','/security','/billing','/modules']){
  await page.goto((process.env.HISAB_E2E_BASE_URL||'http://127.0.0.1:41773')+route);expect(new URL(page.url()).pathname).not.toMatch(/^\/auth/);await checkPageWidth(page);
 }await context.close();
});

test('long help copy and enlarged text wrap without colliding',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto(fixture+'/finance');await page.getByTitle('Help Center',{exact:true}).click();
 await page.locator('.help-guide-copy').first().evaluate(element=>{element.querySelector('strong')!.textContent='A deliberately long guide heading for a multi-branch organization with an enlarged browser font';element.querySelector('small')!.textContent='Long reference ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789: keep this entire description readable and wrapped inside its card.'});
 await page.addStyleTag({content:'.help-guide-copy strong,.help-guide-copy small,.help-learning-path strong,.help-learning-path small{font-size:24px !important}'});
 await checkInputs(page);await checkCards(page,'.help-featured-grid > a,.help-learning-path li');
 expect(await page.locator('.help-guide-copy').evaluateAll(items=>items.some(item=>item.querySelector('strong')!.getBoundingClientRect().bottom>item.querySelector('small')!.getBoundingClientRect().top))).toBe(false);
});

test('private pages retain authentication protection',async({request})=>{
 for(const path of ['/finance','/sales','/sales/invoices/new','/purchasing','/inventory','/hr','/customers','/reports','/security','/account','/billing','/checkout','/modules','/reconciliation','/docs/setup']){
  const response=await request.get('http://127.0.0.1:41773'+path,{maxRedirects:0});expect([307,303]).toContain(response.status());expect(response.headers().location).toContain('/auth/login');
 }
});


test('opening Help from documentation preserves unique accessibility IDs',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(fixture+'/docs/setup');await page.getByTitle('Help Center',{exact:true}).click();
 const duplicates=await page.locator('.help-center-body [id]').evaluateAll(elements=>{const ids=elements.map(e=>e.id);return ids.filter((id,index)=>ids.indexOf(id)!==index)});expect(duplicates).toEqual([]);await expect(page.getByRole('dialog').getByRole('searchbox',{name:'Search help articles'})).toBeVisible();
});
