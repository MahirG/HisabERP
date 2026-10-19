import { expect, type Page } from "@playwright/test";
export const widths = [320,360,375,390,430,768,1024,1280,1440];
export async function checkPageWidth(page: Page) {
  const result = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, width: document.documentElement.scrollWidth }));
  expect(result.width, "The document must fit without hiding horizontal overflow").toBeLessThanOrEqual(result.viewport + 1);
}
export async function checkCards(page: Page, selector: string) {
  const violations = await page.locator(selector).evaluateAll(elements => elements.filter(element => {
    const box=element.getBoundingClientRect(); const parent=element.parentElement!.getBoundingClientRect();
    return box.width > 0 && (box.left < parent.left - 1 || box.right > parent.right + 1);
  }).map(element=>({class:element.className,text:element.textContent?.slice(0,80)})));
  expect(violations, "Cards must fit their layout container").toEqual([]);
}
export async function checkInputs(page: Page) {
  const violations = await page.locator('main input:not([type=hidden]),main select,main textarea,.help-search-field input').evaluateAll(elements => elements.filter(element => {
    const r=element.getBoundingClientRect(); const p=element.parentElement!.getBoundingClientRect();
    return r.width>0&&(r.left < p.left-1||r.right>p.right+1);
  }).map(element=>element.getAttribute("name")||element.id));
  expect(violations,"Form controls must fit their parents").toEqual([]);
}
