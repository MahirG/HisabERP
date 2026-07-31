import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const palette = ["#FFFFFF", "#E5E5E5", "#FCA311", "#14213D", "#000000"];

test("black and gold palette is the final authoritative design layer", async () => {
  const [layout, brandStyles] = await Promise.all([
    read("app/layout.tsx"),
    read("app/biloo-black-gold-brand-system.css"),
  ]);

  const typographyImport = 'import "./zylo-typography-system.css";';
  const brandImport = 'import "./biloo-black-gold-brand-system.css";';

  assert.match(layout, /themeColor: "#14213D"/);
  assert.ok(layout.includes(brandImport), "root layout must import the brand system");
  assert.ok(
    layout.indexOf(brandImport) > layout.indexOf(typographyImport),
    "the palette layer must load after all previous design layers",
  );

  for (const color of palette) {
    assert.ok(
      brandStyles.toUpperCase().includes(color),
      `brand system must define ${color}`,
    );
  }
});

test("palette covers public, authentication, dashboard and account security surfaces", async () => {
  const brandStyles = await read("app/biloo-black-gold-brand-system.css");

  for (const selector of [
    ".marketing-site-v2",
    ".home-zylo-app",
    ".auth-page",
    'body[data-workspace-system="financial-os-v1"]',
    ".security-account-modern",
    ".security-command-header",
  ]) {
    assert.ok(brandStyles.includes(selector), `missing brand coverage for ${selector}`);
  }

  assert.match(brandStyles, /--biloo-gold:\s*#fca311/i);
  assert.match(brandStyles, /--biloo-navy:\s*#14213d/i);
  assert.match(brandStyles, /--biloo-black:\s*#000000/i);
  assert.match(brandStyles, /prefers-contrast: more/);
  assert.match(brandStyles, /prefers-reduced-motion: reduce/);
});

test("browser, PWA and wordmark assets use the permanent brand palette", async () => {
  const [manifest, logo] = await Promise.all([
    read("app/manifest.ts"),
    read("public/hisab-logo.svg"),
  ]);

  assert.match(manifest, /background_color: "#FFFFFF"/);
  assert.match(manifest, /theme_color: "#14213D"/);
  assert.match(logo, /fill="#14213D"/);
  assert.match(logo, /fill="#FCA311"/);
  assert.doesNotMatch(logo, /#DA7757|#1D1D1F/i);
});
