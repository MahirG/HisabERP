import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const imac = readFileSync("components/hero-imac-workspace.tsx", "utf8");
const styles = readFileSync("app/apple-smooth-public.css", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");

test("homepage loads the premium iMac presentation styles", () => {
  assert.match(homepage, /apple-smooth-public\.css/);
});

test("iMac preview has a continuous display, hinge, neck and base structure", () => {
  assert.match(imac, /hero-imac-product/);
  assert.match(imac, /hero-imac-shell/);
  assert.match(imac, /hero-imac-chin/);
  assert.match(imac, /hero-imac-hinge/);
  assert.match(imac, /hero-imac-neck/);
  assert.match(imac, /hero-imac-base/);
});

test("motion is smooth and respects reduced-motion preferences", () => {
  assert.match(styles, /scroll-behavior:\s*smooth/);
  assert.match(styles, /cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/);
  assert.match(styles, /animation-timeline:\s*view\(\)/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test("the existing HisabERP brand assets remain in the product frame", () => {
  assert.match(imac, /hisab-logo\.svg/);
  assert.match(imac, />HisabERP</);
  assert.doesNotMatch(styles, /font-family:/);
});
