import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile("components/marketing-home.tsx", "utf8");
const hero = await readFile("components/hero-office-workspace.tsx", "utf8");
const route = await readFile("app/api/homepage-hero/route.ts", "utf8");
const css = await readFile("app/home-office-hero.css", "utf8");

test("homepage renders the Ethiopian office hero instead of the iMac", () => {
  assert.match(home, /HeroOfficeWorkspace/);
  assert.doesNotMatch(home, /HeroImacWorkspace/);
});

test("office hero uses the cached production image endpoint", () => {
  assert.match(hero, /\/api\/homepage-hero/);
  assert.match(hero, /Ethiopian business professional/);
  assert.match(route, /Content-Type": "image\/webp"/);
  assert.match(route, /Buffer\.from\(encoded\.trim\(\), "base64"\)/);
});

test("office hero has responsive framing", () => {
  assert.match(css, /hero-office-scene/);
  assert.match(css, /object-fit:\s*cover/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
});
