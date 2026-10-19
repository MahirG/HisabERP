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
 await expect(drawer.locator('img[alt="Biloo"]')).toHaveCount(0);
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


const operationalHeroRoutes = [
  "/modules/reports-analytics",
  "/modules/localization-compliance",
  "/modules/fixed-assets",
  "/modules/budgeting-projects",
  "/modules/integrations-automation",
] as const;

// The five routes share a component. Assert computed foreground AND background
// in both user themes at phone and desktop widths, not just CSS declarations.
for (const route of operationalHeroRoutes) {
  for (const theme of ["light", "dark"] as const) {
    test(`operational hero readable ${route} (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(fixture + route);
      await page.locator("html").evaluate((element, next) => { element.dataset.theme = next; }, theme);
      const hero = page.locator(".ops-page > .ops-hero");
      await expect(hero).toBeVisible();
      const contrast = await hero.evaluate((element) => {
        const rgb = (value: string) => {
          const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
          return channels.length === 3 ? channels : [0, 0, 0];
        };
        const luminance = (value: string) => {
          const channels = rgb(value).map(channel => {
            const c = channel / 255;
            return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
          });
          return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
        };
        const ratio = (foreground: string, background: string) => {
          const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
          return (values[0] + .05) / (values[1] + .05);
        };
        const darkEndpoints = ["rgb(20, 33, 61)", "rgb(11, 20, 40)"];
        const testText = (selector: string) => {
          const node = element.querySelector<HTMLElement>(selector);
          if (!node) return null;
          const styles = getComputedStyle(node);
          const color = styles.webkitTextFillColor || styles.color;
          return Math.min(...darkEndpoints.map(background => ratio(color, background)));
        };
        return {
          surface: getComputedStyle(element).backgroundColor,
          heading: testText("h1"),
          description: testText(":scope > div:first-child > p:not(.eyebrow)"),
          eyebrow: testText(".eyebrow"),
          status: testText(".ops-workspace-state strong"),
          statusLabel: testText(".ops-workspace-state small"),
          primaryContrast: (() => {
            const button = element.querySelector<HTMLElement>(".ops-primary-link")!;
            return ratio(getComputedStyle(button).color, getComputedStyle(button).backgroundColor);
          })(),
        };
      });
      expect(contrast.surface).toBe("rgb(20, 33, 61)");
      for (const label of ["heading", "description", "eyebrow", "status", "statusLabel", "primaryContrast"] as const) {
        expect(contrast[label], `${route} ${theme} ${label}`).not.toBeNull();
        expect(contrast[label]!, `${route} ${theme} ${label} must meet WCAG AA`).toBeGreaterThanOrEqual(4.5);
      }
      await checkPageWidth(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await checkPageWidth(page);
    });
  }
}


test("Company Setup overview and creation hero preserve surface contrast in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture + "/finance");
  // Standalone launch route is server-rendered with protected user state.
  // Use the real launch class structure with the production stylesheet
  // without spoofing authentication or mutating company data.
  await page.evaluate(() => {
    const main = document.createElement("main");
    main.className = "guided-setup-page launch-center";
    main.innerHTML = `
      <section class="launch-overview" style="--launch-progress:50%">
        <div class="launch-overview-copy">
          <span class="launch-kicker">Company launch center</span>
          <div class="launch-title-row"><h1>Example Company Setup</h1><span class="in-progress">Setup in progress</span></div>
          <p>Build the operating foundation once and validate the controls.</p>
          <div class="launch-overview-actions">
            <a class="launch-primary-action" href="#setup-company"><span>Continue: Company profile</span></a>
            <a class="launch-tertiary-action" href="#workspace"><span>View workspace</span></a>
          </div>
        </div>
        <aside class="launch-progress-card">
          <div class="launch-progress-ring"><div><strong>50%</strong><span>complete</span></div></div>
          <div class="launch-progress-copy"><span>Launch readiness</span><strong>4 of 8 milestones complete</strong><p>Four tasks remain</p></div>
          <div class="launch-progress-track"><span></span></div>
        </aside>
      </section>
      <section class="launch-create-shell">
        <aside class="launch-create-intro"><div class="launch-create-copy"><span class="launch-kicker light">Guided ERP launch</span><h1>Launch your company.</h1><p>Start with operating details.</p></div></aside>
      </section>
    `;
    document.body.append(main);
  });
  const selectors = [
    [".launch-overview", "rgb(20, 33, 61)"],
    [".launch-create-intro", "rgb(20, 33, 61)"],
    [".launch-title-row h1", "rgb(255, 255, 255)"],
    [".launch-overview-copy > p", "rgb(219, 228, 242)"],
    [".launch-create-copy h1", "rgb(255, 255, 255)"],
    [".launch-create-copy > p", "rgb(219, 228, 242)"],
    [".launch-progress-card", "rgb(255, 255, 255)"],
    [".launch-progress-copy > strong", "rgb(20, 33, 61)"],
    [".launch-primary-action", "rgb(252, 163, 17)"],
  ] as const;
  for (const theme of ["light", "dark"] as const) {
    await page.locator("html").evaluate((element, next) => { element.dataset.theme = next; }, theme);
    for (const [selector, expected] of selectors) {
      const value = await page.locator("main.launch-center " + selector).evaluate((element) => {
        const style = getComputedStyle(element);
        return element.matches("h1, p, strong") ? (style.webkitTextFillColor || style.color) : style.backgroundColor;
      });
      expect(value, `Company Setup ${theme}: ${selector}`).toBe(expected);
    }
    await checkPageWidth(page);
  }
});

test("Company Setup mobile masthead and finish CTA remain legible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture + "/finance");
  await page.evaluate(() => {
    const main = document.createElement("main");
    main.className = "guided-setup-page launch-center";
    main.innerHTML = `
      <header class="launch-topbar">
        <a class="launch-brand" href="/"><div class="launch-brand-wordmark">
          <strong>Biloo ERB</strong><span class="launch-brand-separator">|</span><span class="launch-brand-context">Company Setup</span>
        </div></a>
        <div class="launch-header-actions"><a class="launch-dashboard-link" href="/">Open dashboard</a></div>
      </header>
      <footer class="launch-finish">
        <div class="launch-finish-icon"></div>
        <div><span>4 tasks remaining</span><strong>Finish the critical controls, then move into daily operations.</strong><p>The roadmap keeps dependencies in order.</p></div>
        <a href="#review">Review production controls</a>
      </footer>
    `;
    document.body.append(main);
  });
  const expected = [
    [".launch-finish", "backgroundColor", "rgb(20, 33, 61)"],
    [".launch-finish > div:nth-child(2) > span", "color", "rgb(255, 208, 113)"],
    [".launch-finish > div:nth-child(2) > strong", "color", "rgb(255, 255, 255)"],
    [".launch-finish > div:nth-child(2) > p", "color", "rgb(219, 228, 242)"],
    [".launch-finish > a", "backgroundColor", "rgb(252, 163, 17)"],
    [".launch-finish > a", "color", "rgb(20, 33, 61)"],
  ] as const;
  for (const theme of ["light", "dark"] as const) {
    await page.locator("html").evaluate((element, value) => { element.dataset.theme = value; }, theme);
    for (const [selector, property, value] of expected) {
      const actual = await page.locator("main.launch-center " + selector).evaluate((element, key) => {
        const computed = getComputedStyle(element);
        return key === "color" ? (computed.webkitTextFillColor || computed.color) : computed.backgroundColor;
      }, property);
      expect(actual, `Company Setup ${theme} ${selector} ${property}`).toBe(value);
    }
    await expect(page.locator("main.launch-center .launch-brand-wordmark")).toBeVisible();
    await expect(page.locator("main.launch-center .launch-brand")).toContainText("Biloo ERB|Company Setup".replace("|", "|")); // text follows the divider
  }
});


test("Shared Biloo mobile header shows complete titles and a single command entry", async ({ page }) => {
  for (const route of ["/", "/finance", "/modules/localization-compliance", "/modules/integrations-automation"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(fixture + route);
    const masthead = page.locator(".mobile-workspace-header");
    await expect(masthead).toBeVisible();
    await expect(page.locator(".workspace-command-header")).not.toBeVisible();
    const search = page.locator(".mobile-command-trigger");
    await expect(search).toBeVisible();
    const title = masthead.locator(".mobile-workspace-title strong");
    await expect(title).not.toBeEmpty();
    expect(await title.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("normal");
    const visibleWithinSlot = await title.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const trigger = document.querySelector(".mobile-command-trigger")?.getBoundingClientRect();
      return rect.width > 85 && rect.left >= 0 && (!trigger || rect.right <= trigger.left + 1)
        && element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1;
    });
    expect(visibleWithinSlot, `mobile header ${route}`).toBe(true);
    await checkPageWidth(page);
  }
  await page.locator(".mobile-command-trigger").click();
  await expect(page.getByRole("dialog", { name: /search/i })).toBeVisible();
  await expect(page.getByText("Open Help Center")).toBeVisible();
  await expect(page.getByText("Open Advice Center")).toBeVisible();
  await expect(page.getByText("Open Hisab AI")).toBeVisible();
});

test("Overview hero and controls remain usable on compact mobile viewports", async ({ page }) => {
  await page.goto(fixture + "/");
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const hero = page.locator("main.apple-grade-dashboard .workspace-page-header");
    await expect(hero).toBeVisible();
    const styles = await hero.evaluate(element => ({
      background: getComputedStyle(element).backgroundColor,
      title: getComputedStyle(element.querySelector("h1")!).color,
      body: getComputedStyle(element.querySelector(".workspace-page-description")!).color,
    }));
    expect(styles.background).toBe("rgb(255, 255, 255)");
    expect(styles.title).toBe("rgb(20, 33, 61)");
    expect(styles.body).toBe("rgb(71, 84, 103)");
    const actions = hero.locator(".workspace-page-actions a");
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) await expect(action).toBeInViewport();
    await checkPageWidth(page);
  }
});


test("Compact mobile footer matches X-style dimensions and keeps all shortcuts operable", async ({ page }) => {
  for (const width of [320, 375, 390, 430, 760]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(fixture + "/");
    const nav = page.getByRole("navigation", { name: "Mobile workspace shortcuts" });
    await expect(nav).toBeVisible();
    const measurement = await nav.evaluate(element => {
      const box = element.getBoundingClientRect();
      const items = [...element.children] as HTMLElement[];
      return {
        height: box.height,
        right: box.right,
        bottom: box.bottom,
        itemCount: items.length,
        minTapHeight: Math.min(...items.map(item => item.getBoundingClientRect().height)),
        maxIconSize: Math.max(...items.map(item => item.querySelector("svg")?.getBoundingClientRect().width ?? 0)),
        maxLabelSize: Math.max(...items.map(item => Number.parseFloat(getComputedStyle(item.querySelector("span")!).fontSize))),
        activeBackground: getComputedStyle(element.querySelector('[aria-current="page"]')!).backgroundColor,
        itemWidths: items.map(item => item.getBoundingClientRect().width),
      };
    });
    expect(measurement.height).toBeGreaterThanOrEqual(55);
    expect(measurement.height).toBeLessThanOrEqual(60);
    expect(measurement.bottom).toBeCloseTo(844, 0);
    expect(measurement.right).toBeLessThanOrEqual(width + 1);
    expect(measurement.itemCount).toBe(5);
    expect(measurement.minTapHeight).toBeGreaterThanOrEqual(44);
    expect(measurement.maxIconSize).toBeLessThanOrEqual(19.5);
    expect(measurement.maxLabelSize).toBeLessThanOrEqual(10);
    expect(measurement.activeBackground).toBe("rgba(0, 0, 0, 0)");
    expect(Math.min(...measurement.itemWidths)).toBeGreaterThanOrEqual(55);
    await checkPageWidth(page);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const nav = page.getByRole("navigation", { name: "Mobile workspace shortcuts" });
  await nav.getByRole("link", { name: "Sales" }).click();
  await expect(page).toHaveURL(/\/sales$/);
  await expect(nav.getByRole("link", { name: "Sales" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("button", { name: "Workspace menu" }).click();
  await expect(page.getByRole("dialog", { name: "Workspace menu" })).toBeVisible();
});


test("Business Overview uses standard compact typography, cards and icon sizing", async ({ page }) => {
  for (const width of [320, 390, 760, 1024, 1440]) {
    await page.setViewportSize({width, height:900});
    await page.goto(fixture + "/");
    const dashboard = page.locator("main.apple-grade-dashboard");
    await expect(dashboard).toBeVisible();
    const hero = dashboard.locator(".workspace-page-header");
    const details = await hero.evaluate((header) => {
      const title = header.querySelector("h1")!;
      const style = getComputedStyle(title);
      const bg = getComputedStyle(header).backgroundColor;
      const box = header.getBoundingClientRect();
      const main = header.closest("main")!.getBoundingClientRect();
      return {title: title.textContent, font: parseFloat(style.fontSize), color: style.webkitTextFillColor || style.color, bg, left:box.left, right:box.right, mainLeft:main.left, mainRight:main.right};
    });
    expect(details.title).toContain("Business overview");
    expect(details.font).toBeLessThanOrEqual(37);
    expect(details.font).toBeGreaterThanOrEqual(24);
    expect(details.color).toBe("rgb(20, 33, 61)");
    expect(details.bg).toBe("rgb(255, 255, 255)");
    expect(details.left).toBeGreaterThanOrEqual(details.mainLeft - 1);
    expect(details.right).toBeLessThanOrEqual(details.mainRight + 1);
    await expect(dashboard.locator(".financial-metric-grid > .workspace-metric-tile")).toHaveCount(5);
    const iconSizes = await dashboard.locator(".financial-metric-grid .workspace-metric-icon svg").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width));
    expect(iconSizes.length).toBe(5);
    expect(Math.max(...iconSizes)).toBeLessThanOrEqual(17);
    const lastMetric = dashboard.locator(".financial-metric-grid > .workspace-metric-tile").last();
    await expect(lastMetric).toHaveCSS("color", "rgb(20, 33, 61)");
    await checkPageWidth(page);
  }
});

test("Business Overview uses truthful demo status and non-fabricated reporting labels", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(fixture + "/");
  const board = page.locator("main.apple-grade-dashboard");
  await expect(board.locator(".workspace-page-actions .workspace-status")).toContainText("Demo workspace");
  await expect(board.locator(".dashboard-performance-panel")).not.toContainText("+18.2%");
  await expect(board.locator(".financial-snapshot-section .workspace-eyebrow")).toContainText("Finance at a glance");
  const actions = board.locator(".workspace-page-actions a.action-link");
  await expect(actions).toHaveCount(2);
  for (const link of await actions.all()) {
    const rect = await link.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width).toBeGreaterThanOrEqual(110);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(391);
  }
});


for (const [route, heading, type] of [
  ["/sales","Sales & Invoicing","sales"],
  ["/finance","Finance & Accounting","finance"],
  ["/inventory","Inventory & Warehouse","core"],
] as const) {
  test(`Biloo standard module presentation and contrast: ${route}`, async ({page}) => {
    await page.goto(fixture+route);
    for(const width of [320,390,760,1024,1440]) {
      await page.setViewportSize({width,height:900});
      const main=page.locator("main.biloo-standard-module");
      const hero=main.locator(`.${type}-hero`);
      await expect(hero).toBeVisible();
      await expect(hero.locator("h1")).toHaveText(heading);
      const style=await hero.evaluate(el=>{
        const title=el.querySelector("h1")!;
        const p=el.querySelector("div > p:last-child")!;
        const box=el.getBoundingClientRect();
        return {
          background:getComputedStyle(el).backgroundColor,
          title:getComputedStyle(title).webkitTextFillColor||getComputedStyle(title).color,
          description:getComputedStyle(p).webkitTextFillColor||getComputedStyle(p).color,
          titleFont:parseFloat(getComputedStyle(title).fontSize),left:box.left,right:box.right
        };
      });
      expect(style.background).toBe("rgb(255, 255, 255)");
      expect(style.title).toBe("rgb(20, 33, 61)");
      expect(style.description).toBe("rgb(71, 84, 103)");
      expect(style.titleFont).toBeLessThanOrEqual(37);
      expect(style.left).toBeGreaterThanOrEqual(0);
      expect(style.right).toBeLessThanOrEqual(width+1);
      await expect(hero.locator("small")).toContainText("Demo workspace");
      const tabs=main.locator(`.${type}-tabs`);
      await expect(tabs).toBeVisible();
      const active=tabs.locator("button.active");
      await expect(active).toHaveCSS("background-color","rgb(252, 163, 17)");
      const kpis=main.locator(`.${type}-kpis > article`);
      await expect(kpis).toHaveCount(4);
      await checkPageWidth(page);
    }
    const section=page.locator(`.${type}-tabs`);
    const next=type==="sales"?"Quotations":type==="finance"?"Journal":"Products";
    await section.getByRole("button",{name:next,exact:true}).click();
    await expect(section.getByRole("button",{name:next,exact:true})).toHaveClass(/active/);
    await expect(page.locator(`.${type}-view`)).toBeVisible();
  });
}
