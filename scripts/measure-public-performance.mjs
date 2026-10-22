import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Run against a production build. These are lab observations, not field CWV or
// a Lighthouse score. Use the same browser, machine and settings for comparison.
const option = (name) => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const base = option("--base-url") ?? "http://127.0.0.1:41773";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
});
const results = [];
try {
  for (const route of ["/", "/pricing", "/services"]) {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.addInitScript(() => {
          const metrics = window.__publicLab = { lcp: 0, cls: 0, longTasks: 0 };
          new PerformanceObserver((list) => list.getEntries().forEach((entry) => { metrics.lcp = entry.startTime; })).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((list) => list.getEntries().forEach((entry) => { if (!entry.hadRecentInput) metrics.cls += entry.value; })).observe({ type: "layout-shift", buffered: true });
          new PerformanceObserver((list) => list.getEntries().forEach((entry) => { metrics.longTasks += Math.max(0, entry.duration - 50); })).observe({ type: "longtask", buffered: true });
        });
        await page.goto(new URL(route, base).href, { waitUntil: "load" });
        await page.waitForTimeout(2000);
        const result = await page.evaluate(({ route, run }) => {
          const resources = performance.getEntriesByType("resource");
          return {
            route, run, ...window.__publicLab,
            jsDecodedBytes: resources.filter((resource) => resource.name.includes(".js")).reduce((sum, resource) => sum + resource.decodedBodySize, 0),
            cssDecodedBytes: resources.filter((resource) => resource.name.includes(".css")).reduce((sum, resource) => sum + resource.decodedBodySize, 0),
            requests: resources.length,
            domNodes: document.querySelectorAll("*").length,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        }, { route, run });
        results.push(result);
        console.log(JSON.stringify(result));
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); }
if (option("--output")) await writeFile(option("--output"), JSON.stringify(results, null, 2) + "\n");
