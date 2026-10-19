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
 // Regression: the visible X must dismiss immediately, restore focus, and
 // allow opening the same drawer again without relying on route navigation.
 await close.click();await expect(drawer).not.toBeVisible();await expect(trigger).toBeFocused();
 await trigger.click();await expect(drawer).toBeVisible();await expect(close).toBeFocused();
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


test("ERP routes render without page-entry animations and with consistent navigation chrome", async ({ page }) => {
  for (const [route, label] of [
    ["/workspace-home", "Business overview"],
    ["/sales", "Sales & Invoicing"],
    ["/finance", "Finance & Accounting"],
    ["/inventory", "Inventory & Warehouse"],
    ["/purchasing", "Purchasing"],
    ["/modules/reports-analytics", "Reports"],
    ["/onboarding", "Company Setup"],
  ] as const) {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      if (route === "/onboarding") continue; // Standalone server route has no authenticated fixture.
      await page.goto(fixture + route);
      const shell = page.locator(".erp-shell");
      await expect(shell).toBeVisible();
      const content = page.locator(".workspace > main");
      await expect(content).toBeVisible();
      const appearance = await content.evaluate(el => {
        const styles = getComputedStyle(el);
        return { animation: styles.animationName, transform: styles.transform, opacity: styles.opacity };
      });
      expect(appearance.animation, `page-entry animation on ${route}`).toBe("none");
      expect(appearance.transform).toBe("none");
      expect(appearance.opacity).toBe("1");
      await expect(page.locator(".mobile-bottom-nav")).toHaveCount(1);
      await expect(page.locator(".mobile-workspace-header")).toHaveCount(1);
      await expect(page.locator(".app-navigation-progress")).toHaveCount(0);
      await checkPageWidth(page);
    }
  }
  // This fixture intentionally substitutes native anchors for Next Link.
  // Actual client-side shell persistence requires an authenticated Next app test,
  // not a synthetic DOM token across full page reloads.
});

test("Overview navigation remains in the secure ERP, not the marketing homepage", async ({ page }) => {
  await page.goto(fixture + "/finance");
  await expect(page.locator(".sidebar a[aria-current='page']")).toHaveAttribute("href", "/finance");
  await expect(page.locator(".mobile-bottom-nav").getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/workspace-home");
  await expect(page.locator(".desktop-sidebar-brand")).toHaveAttribute("href", "/workspace-home");
  await expect(page.locator(".sidebar-workspace-switcher")).toHaveAttribute("href", "/workspace-home");
});

test("Mobile workspace menu footer has an independently colored high-contrast surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture + "/finance");
  await page.locator(".mobile-menu-trigger").click();
  const dialog = page.locator('dialog[data-workspace-navigation]');
  await expect(dialog).toBeVisible();
  const colors = await dialog.evaluate(element => {
    const panel = element.querySelector<HTMLElement>("div[class*='panel']")!;
    const footer = element.querySelector<HTMLElement>("footer")!;
    const security = footer.querySelector<HTMLElement>("span")!;
    const company = footer.querySelector<HTMLElement>("a strong")!;
    return {
      panel: getComputedStyle(panel).backgroundColor,
      footer: getComputedStyle(footer).backgroundColor,
      border: getComputedStyle(footer).borderTopColor,
      security: getComputedStyle(security).color,
      company: getComputedStyle(company).color,
      link: footer.querySelector<HTMLAnchorElement>("a")?.getAttribute("href"),
    };
  });
  expect(colors.panel).toBe("rgb(255, 255, 255)");
  expect(colors.footer).toBe("rgb(234, 240, 247)");
  expect(colors.footer).not.toBe(colors.panel);
  expect(colors.border).toBe("rgb(213, 223, 234)");
  expect(colors.security).toBe("rgb(71, 84, 103)");
  expect(colors.company).toBe("rgb(20, 33, 61)");
  expect(colors.link).toBe("https://www.hisabtech.com");
  await dialog.getByRole("button", { name: "Close navigation" }).click();
  await expect(dialog).not.toBeVisible();
});


test("Compact Biloo hamburger drawer is narrow, calm and fully navigable", async ({ page }) => {
  for (const width of [320, 390, 430, 760]) {
    await page.setViewportSize({width, height: 844});
    await page.goto(fixture + "/finance");
    await page.locator(".mobile-menu-trigger").click();
    const dialog = page.locator('dialog[data-workspace-navigation]');
    await expect(dialog).toBeVisible();
    const metrics = await dialog.evaluate(element => {
      const panel = element.querySelector<HTMLElement>("div[class*='panel']")!;
      const header = panel.querySelector<HTMLElement>("header")!;
      const links = [...panel.querySelectorAll<HTMLAnchorElement>('nav a[href]')];
      const active = panel.querySelector<HTMLAnchorElement>('nav a[aria-current="page"]')!;
      const footer = panel.querySelector<HTMLElement>("footer")!;
      return {
        width: panel.getBoundingClientRect().width,
        drawerAnim: getComputedStyle(panel).animationName,
        closeTarget: header.querySelector("button")!.getBoundingClientRect().height,
        count: links.length,
        minTap: Math.min(...links.map(a => a.getBoundingClientRect().height)),
        maxIcon: Math.max(...links.map(a => a.querySelector("svg")!.getBoundingClientRect().width)),
        maxText: Math.max(...links.map(a => parseFloat(getComputedStyle(a.querySelector('span[class*="label"]')!).fontSize))),
        activeBackground: getComputedStyle(active).backgroundColor,
        activeText: getComputedStyle(active).color,
        footerColor: getComputedStyle(footer).backgroundColor,
      };
    });
    expect(metrics.width).toBeLessThanOrEqual(309);
    expect(metrics.width).toBeLessThanOrEqual(width - 39);
    expect(metrics.drawerAnim).toBe("none");
    expect(metrics.closeTarget).toBeGreaterThanOrEqual(44);
    expect(metrics.count).toBeGreaterThanOrEqual(12);
    expect(metrics.minTap).toBeGreaterThanOrEqual(44);
    expect(metrics.maxIcon).toBeLessThanOrEqual(19);
    expect(metrics.maxText).toBeLessThanOrEqual(13.5);
    expect(metrics.activeBackground).toBe("rgb(237, 242, 248)");
    expect(metrics.activeText).toBe("rgb(20, 33, 61)");
    expect(metrics.footerColor).toBe("rgb(234, 240, 247)");
    await dialog.getByRole("button", {name:"Close navigation"}).click();
    await expect(dialog).not.toBeVisible();
    await checkPageWidth(page);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(fixture + "/finance");
  await page.locator(".mobile-menu-trigger").click();
  const drawer = page.locator('dialog[data-workspace-navigation]');
  await expect(drawer.getByRole("link", {name:"Overview"})).toHaveAttribute("href","/workspace-home");
  await expect(drawer.getByRole("link", {name:"Sales"})).toHaveAttribute("href","/sales");
  await expect(drawer.getByRole("link", {name:"Finance"})).toHaveAttribute("aria-current","page");
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
});


test("Account layout typography, navigation actions, and long IDs fit mobile",async({page})=>{
  await page.goto(fixture+"/finance");
  await page.evaluate(()=>{
    const workspace=document.querySelector(".workspace");
    if(!workspace)return;
    const el=document.createElement("main");el.className="acct2-page";
    el.innerHTML=`<nav class="acct2-breadcrumb"><a href="/workspace-home">Workspace</a><span aria-current="page">Account &amp; security</span></nav>
    <header class="acct2-heading"><div><span class="acct2-eyebrow">Identity &amp; access</span><h1>Account &amp; security</h1><p>Manage your account and session.</p></div><div class="acct2-heading-actions"><a href="/security" class="acct2-button">Security controls</a><a href="/workspace-home" class="acct2-button is-primary">Back to workspace</a></div></header>
    <section class="acct2-security-strip"><div class="acct2-security-summary"><span class="acct2-security-icon">✓</span><div><small>Security status</small><strong>Session verification required</strong><p>AAL1 assurance</p></div></div><dl class="acct2-security-facts"><div><dt>Authenticator</dt><dd>Enrolled</dd></div><div><dt>This session</dt><dd>AAL1 standard</dd></div></dl></section>
    <section class="acct2-grid"><div class="acct2-main"><article class="acct2-card"><header class="acct2-card-head"><div class="acct2-profile"><span class="acct2-avatar">AB</span><div class="acct2-profile-copy"><h2>An exceptionally long administrator name</h2><p>an-exceptionally-long-email@organization.example</p></div></div><span class="acct2-active">Active</span></header><div class="acct2-card-body"><dl class="acct2-details"><div><dt>Organization</dt><dd>Long organization name</dd></div><div><dt>Role</dt><dd>Owner</dd></div><div class="is-wide"><dt>Account ID</dt><dd><code>12345678-1234-1234-1234-123456789012</code></dd></div></dl></div></article></div><aside class="acct2-side"><section class="acct2-card"><div class="acct2-card-body">Session information</div></section></aside></section>`;
    workspace.querySelectorAll("main").forEach(main=>main.remove());workspace.appendChild(el);
  });
  for(const width of [320,390,430,760,1024]){
    await page.setViewportSize({width,height:844});
    const target=page.locator("main.acct2-page");
    await expect(target.locator("h1")).toHaveText("Account & security");
    const computed=await target.evaluate(el=>{
      const title=el.querySelector(".acct2-heading h1")!;
      const name=el.querySelector(".acct2-profile-copy h2")!;
      const id=el.querySelector(".acct2-details code")!;
      const action=el.querySelector(".acct2-heading-actions .is-primary")!;
      return {color:getComputedStyle(title).color,nameWrap:getComputedStyle(name).whiteSpace,idWrap:getComputedStyle(id).overflowWrap,button:getComputedStyle(action).backgroundColor,right:el.getBoundingClientRect().right};
    });
    expect(computed.color).toBe("rgb(20, 33, 61)");
    expect(computed.nameWrap).toBe("normal");
    expect(computed.idWrap).toBe("anywhere");
    expect(computed.button).toBe("rgb(252, 163, 17)");
    expect(computed.right).toBeLessThanOrEqual(width+1);
    await checkPageWidth(page);
  }
});

test("Biloo billing page fixture has compact, high-contrast cards across mobile and desktop", async ({ page }) => {
  await page.goto(fixture + "/finance");
  await page.evaluate(() => {
    const workspace = document.querySelector(".workspace");
    if (!workspace) return;
    const main = document.createElement("main");
    main.className = "commerce-page billing-page";
    main.innerHTML = `
      <header class="commerce-topbar"><a class="commerce-brand" href="/workspace-home"><img alt="" width="42" height="42" /><span><strong>Biloo ERP</strong><small>Billing &amp; paid access</small></span></a><a class="billing-return" href="/workspace-home">Back to workspace</a></header>
      <section class="billing-hero"><div><span class="commerce-kicker">Billing &amp; subscriptions</span><h1>Billing &amp; paid access</h1><p>Review access dates and latest payment status. There are no automatic recurring charges.</p></div><span class="billing-status inactive"><i></i>No paid access</span></section>
      <div class="commerce-alert warning billing-alert">Payments are made manually through Chapa.</div>
      <section class="billing-grid">
        <article class="billing-plan-card"><span class="billing-card-eyebrow">Current plan</span><h2>Growth</h2><p>Connected inventory, purchasing, invoicing, and operations.</p><div class="billing-price"><strong>ETB 4,500</strong><small>Monthly access amount recorded</small></div><div class="billing-card-actions"><a class="commerce-primary" href="/pricing">Compare plans</a><a class="commerce-secondary" href="/help-center">Payment help</a></div></article>
        <article class="billing-detail-card"><header><span>Access details</span><strong>Provider: Chapa</strong></header><dl><div><dt>Status</dt><dd>No paid access</dd></div><div><dt>Access starts</dt><dd>Not available</dd></div><div><dt>Access ends</dt><dd>Not available</dd></div><div><dt>Renewal</dt><dd>Manual payment through Chapa</dd></div></dl></article>
        <article class="billing-security-card"><span class="billing-card-eyebrow">Payment security</span><h2>Access updates require server verification.</h2><p>Payment references and amounts are verified by the server.</p><div><span><b>01</b> Authenticated webhook delivery</span><span><b>02</b> Direct transaction verification</span><span><b>03</b> User-isolated RLS</span></div><a href="/trust">Review the Trust Center</a></article>
      </section>`;
    workspace.querySelectorAll("main").forEach(el => el.remove());
    workspace.appendChild(main);
  });
  for (const width of [320, 375, 390, 430, 760, 1024, 1440]) {
    await page.setViewportSize({width,height:900});
    const main = page.locator("main.billing-page");
    await expect(main).toBeVisible();
    const computed = await main.evaluate(el => {
      const title = el.querySelector(".billing-hero h1")!;
      const hero = el.querySelector(".billing-hero")!;
      const cards = [...el.querySelectorAll(".billing-grid > article")];
      const action = el.querySelector(".billing-card-actions .commerce-primary")!;
      const detail = el.querySelector(".billing-detail-card dd")!;
      const heading = el.querySelector(".billing-detail-card dt")!;
      return {
        bg: getComputedStyle(el).backgroundColor,
        titleColor: getComputedStyle(title).color,
        titleSize: parseFloat(getComputedStyle(title).fontSize),
        heroBg: getComputedStyle(hero).backgroundColor,
        cards: cards.map(item => ({color:getComputedStyle(item).color, bg:getComputedStyle(item).backgroundColor, right:item.getBoundingClientRect().right})),
        action: getComputedStyle(action).backgroundColor,
        actionHeight: action.getBoundingClientRect().height,
        detailColor: getComputedStyle(detail).color,
        labelColor: getComputedStyle(heading).color,
      };
    });
    expect(computed.bg).toBe("rgb(246, 248, 251)");
    expect(computed.titleColor).toBe("rgb(20, 33, 61)");
    expect(computed.titleSize).toBeLessThanOrEqual(37);
    expect(computed.heroBg).toBe("rgb(255, 255, 255)");
    expect(computed.cards).toHaveLength(3);
    for(const card of computed.cards) {
      expect(card.bg).toBe("rgb(255, 255, 255)");
      expect(card.right).toBeLessThanOrEqual(width + 1);
    }
    expect(computed.action).toBe("rgb(252, 163, 17)");
    expect(computed.actionHeight).toBeGreaterThanOrEqual(44);
    expect(computed.detailColor).toBe("rgb(20, 33, 61)");
    expect(computed.labelColor).toBe("rgb(89, 101, 121)");
    await checkPageWidth(page);
  }
});
