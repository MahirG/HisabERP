import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile("components/marketing-home.tsx", "utf8");
const hero = await readFile("components/hero-office-workspace.tsx", "utf8");
const css = await readFile("app/home-office-hero.css", "utf8");
const encodedImage = (await readFile("public/hisab-ethiopian-office-hero.webp", "utf8")).trim();

test("homepage renders the Ethiopian office hero instead of the iMac", () => {
  assert.match(home, /HeroOfficeWorkspace/);
  assert.doesNotMatch(home, /HeroImacWorkspace/);
});

test("office hero embeds the optimized image during static generation", () => {
  assert.match(hero, /data:image\/webp;base64/);
  assert.match(hero, /hisab-ethiopian-office-hero\.webp/);
  assert.doesNotMatch(hero, /\/api\/homepage-hero/);
  assert.match(hero, /Ethiopian business professional/);
});

test("encoded homepage asset is a WebP payload", () => {
  const image = Buffer.from(encodedImage, "base64");
  assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
});

test("office hero has responsive framing", () => {
  assert.match(css, /hero-office-scene/);
  assert.match(css, /object-fit:\s*cover/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
});
