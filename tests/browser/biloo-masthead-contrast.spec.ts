import { test, expect } from "@playwright/test";

const fixture = "http://127.0.0.1:41774";

test("desktop Biloo header is flush, continuous, and contains the account", async ({ page }) => {
  for (const width of [800, 980, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(fixture + "/modules/localization-compliance");
    const header = page.locator(".erp-shell > .workspace-command-header");
    await expect(header).toBeVisible();
    await expect(header.locator(".workspace-header-account .sticky-user-trigger")).toBeVisible();
    const geometry = await header.evaluate((node) => {
      const element = node as HTMLElement;
      const box = element.getBoundingClientRect();
      const search = element.querySelector(".workspace-search-trigger")!.getBoundingClientRect();
      const profile = element.querySelector(".workspace-header-account")!.getBoundingClientRect();
      const identity = element.querySelector(".workspace-header-identity") as HTMLElement;
      const identityBox = identity.getBoundingClientRect();
      const identityText = identity.querySelector("strong")!;
      return {
        top: box.top,
        right: box.right,
        height: box.height,
        searchRight: search.right,
        searchLeft: search.left,
        identityLeft: identityBox.left,
        identityRight: identityBox.right,
        identityText: identityText.textContent?.trim(),
        identityColor: getComputedStyle(identityText).color,
        profileLeft: profile.left,
        bg: getComputedStyle(element).backgroundColor,
        ghost: getComputedStyle(element, "::before").content,
      };
    });
    expect(geometry.top).toBe(0);
    expect(geometry.right).toBeCloseTo(width, 0);
    expect(geometry.height).toBe(58);
    expect(geometry.bg).toBe("rgb(20, 33, 61)");
    expect(["none", "normal"]).toContain(geometry.ghost);
    expect(geometry.identityText).toBe("Business Operating System");
    expect(geometry.identityColor).toBe("rgb(255, 255, 255)");
    expect(geometry.identityLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.identityRight).toBeLessThanOrEqual(geometry.searchLeft + 1);
    expect(geometry.searchRight).toBeLessThanOrEqual(geometry.profileLeft);
  }
});

test("Localization & Compliance has readable hero, tabs, and input contrast", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(fixture + "/modules/localization-compliance");
  const hero = page.locator(".ops-page > .ops-hero");
  await expect(hero).toBeVisible();
  const heroTitle = hero.locator("h1");
  const heroColors = await heroTitle.evaluate((el) => ({
    color: getComputedStyle(el).color,
    fontSize: parseFloat(getComputedStyle(el).fontSize),
  }));
  expect(heroColors.color).toBe("rgb(255, 255, 255)");
  expect(heroColors.fontSize).toBeLessThanOrEqual(33);
  const activeTab = page.locator(".ops-tabs > button.active");
  await expect(activeTab).toBeVisible();
  const activeColors = await activeTab.evaluate((el) => ({
    color: getComputedStyle(el).color,
    bg: getComputedStyle(el).backgroundColor,
  }));
  expect(activeColors.color).toBe("rgb(255, 255, 255)");
  expect(activeColors.bg).toBe("rgb(20, 33, 61)");
  const panel = page.locator(".ops-panel").first();
  await expect(panel).toBeVisible();
  const panelColors = await panel.evaluate((el) => ({
    color: getComputedStyle(el).color,
    bg: getComputedStyle(el).backgroundColor,
  }));
  expect(panelColors.color).toBe("rgb(20, 33, 61)");
  expect(panelColors.bg).toBe("rgb(255, 255, 255)");
});

test("mobile keeps one masthead without the legacy floating second row", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture + "/modules/localization-compliance");
  await expect(page.locator(".erp-shell > .workspace-command-header")).toBeHidden();
  await expect(page.locator(".erp-shell > .mobile-workspace-header")).toBeVisible();
  await expect(page.locator(".mobile-workspace-header .sticky-user-trigger")).toBeVisible();
});
