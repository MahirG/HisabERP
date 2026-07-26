import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

async function doesNotExist(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return false;
  } catch {
    return true;
  }
}

test("homepage uses a text-led hero without uploaded hero images", async () => {
  const [page, home, styles] = await Promise.all([
    read("app/page.tsx"),
    read("components/marketing-home.tsx"),
    read("app/home-text-hero.css"),
  ]);

  assert.match(page, /home-text-hero\.css/);
  assert.doesNotMatch(page, /home-banner-slider\.css|home-office-hero\.css/);
  assert.match(home, /marketing-hero-text-only/);
  assert.match(home, /Run every part of your business with clarity/);
  assert.match(home, /Get started/);
  assert.match(home, /Request a demo/);
  assert.doesNotMatch(home, /HeroOfficeWorkspace|HeroImageBannerSlider|<img/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(styles, /@media \(max-width: 560px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);

  assert.equal(await doesNotExist("components/hero-office-workspace.tsx"), true);
  assert.equal(await doesNotExist("components/hero-image-banner-slider.tsx"), true);
  assert.equal(await doesNotExist("app/home-banner-slider.css"), true);
  assert.equal(await doesNotExist("app/home-office-hero.css"), true);
});
