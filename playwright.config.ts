import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  timeout: 90_000,
  expect: { timeout: 8_000, toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 } },
  workers: 2,
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: "test-results/browser-results.json" }]],
  use: {
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {},
    trace: "off", // Authenticated session material must not enter test artifacts.
    screenshot: "only-on-failure",
  },
  webServer: [
    { command: "npm run start -- --hostname 127.0.0.1 --port 41773", url: "http://127.0.0.1:41773", timeout: 30_000, reuseExistingServer: false },
    { command: "node scripts/serve-ui-fixtures.mjs", url: "http://127.0.0.1:41774", timeout: 30_000, reuseExistingServer: false },
  ],
});
