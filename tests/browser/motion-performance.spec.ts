import { test, expect } from "@playwright/test";
import { checkPageWidth, checkInputs } from "./layout-checks";

const base = "http://127.0.0.1:41773";
async function acceptEssential(page: import("@playwright/test").Page) {
  const button = page.getByRole("button", { name: "Essential only", exact: true });
  await expect(button).toBeVisible();
  await button.click();
}

test("public content and charts are readable before JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".ah-module-card")).toHaveCount(4);
  await expect(page.locator(".marketing-trend-chart svg")).toBeVisible();
  await checkPageWidth(page);
  await context.close();
});

test("scrolling reveals each section once and live reduced-motion cancels motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await acceptEssential(page);
  const section = page.locator(".cf-product-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-motion-seen", "true");
  await expect(page.locator(".wb-header")).toHaveAttribute("data-scrolled", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await section.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await expect(section).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await section.scrollIntoViewIfNeeded();
  expect(await section.evaluate((element) => element.getAnimations().length)).toBe(0);
});

test("drawer closes by Escape, backdrop and resize without losing scroll or focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await acceptEssential(page);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  const position = await page.evaluate(() => window.scrollY);
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Main navigation", exact: true });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(dialog).toBeHidden();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - position)).toBeLessThan(2);
  await page.setViewportSize({ width: 768, height: 900 });
  await trigger.click();
  await page.locator(".wb-mobile-drawer > .wb-overlay-backdrop").click({ position: { x: 20, y: 300 } });
  await expect(dialog).toBeHidden();
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.classList.contains("wb-modal-open"))).toBe(false);
});

test("anchor offsets and back navigation preserve a useful reading position", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await acceptEssential(page);
  await page.goto(base + "/#ah-module-title");
  const heading = page.locator("#ah-module-title");
  await expect.poll(async () => (await heading.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  await expect.poll(async () => (await heading.boundingBox())!.y).toBeLessThan(110);
  const position = await page.evaluate(() => window.scrollY);
  await page.locator(".ah-module-card").first().click();
  await expect(page).toHaveURL(/\/product\/sales-invoicing$/);
  await page.goBack();
  await expect(page).toHaveURL(/#ah-module-title$/);
  await expect.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - position)).toBeLessThan(5);
});

test("sample charts retain keyboard tooltips and product switching", async ({ page }) => {
  await page.goto(base);
  await acceptEssential(page);
  await page.getByRole("tab", { name: "Finance", exact: true }).click();
  const panel = page.getByRole("tabpanel", { name: "Finance", exact: true });
  await expect(panel).toContainText("ETB 3.42M");
  await panel.locator(".marketing-trend-chart circle[tabindex]").first().focus();
  await expect(panel.locator(".marketing-trend-tooltip")).toContainText("Feb");
  await page.keyboard.press("ArrowRight");
  await expect(panel.locator(".marketing-trend-chart svg")).toBeVisible();
});

test("contact validation and duplicate submission guard run without sending data", async ({ page }) => {
  await page.goto(base + "/request-demo?source=contact");
  await acceptEssential(page);
  await page.getByRole("button", { name: "Send inquiry", exact: true }).click();
  expect(await page.locator('[name="full_name"]').evaluate((element) => (element as HTMLInputElement).validity.valueMissing)).toBe(true);
  const submissions = await page.locator("form").evaluate((form) => {
    let count = 0;
    form.addEventListener("submit", (event) => { event.preventDefault(); count++; });
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    return count;
  });
  expect(submissions).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new Event("hisab:done")));
  await expect(page.locator("form")).not.toHaveAttribute("aria-busy");
});

for (const route of ["/", "/pricing", "/services", "/product-tour", "/help-center", "/resources", "/auth/login"]) {
  test(`responsive, error-free page: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + route);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await checkPageWidth(page);
      await checkInputs(page);
    }
    expect(errors).toEqual([]);
  });
}

test("public first visit avoids account calls and blanket route prefetch", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(base);
  await acceptEssential(page);
  await page.waitForTimeout(500);
  expect(requests.some((url) => url.includes("/api/session-context"))).toBe(false);
  expect(requests.filter((url) => url.includes("_rsc=")).length).toBeLessThanOrEqual(4);
});
