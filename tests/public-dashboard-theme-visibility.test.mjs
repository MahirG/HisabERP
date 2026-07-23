import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

test("homepage and product-tour dashboard previews remain readable in both themes", async () => {
  const [styles, layout, home] = await Promise.all([
    read("app/public-dashboard-theme-visibility.css"),
    read("app/layout.tsx"),
    read("components/marketing-home.tsx"),
  ]);

  assert.match(home, /className="hero-workspace"/);
  assert.match(home, /className="hero-workspace-heading"/);
  assert.match(styles, /html\[data-theme="light"\]/);
  assert.match(styles, /html\[data-theme="dark"\]/);
  assert.match(styles, /\.hero-workspace-heading h2/);
  assert.match(styles, /\.hero-kpis article/);
  assert.match(styles, /\.hero-attention-card p/);
  assert.match(styles, /\.tour-app-window/);
  assert.match(styles, /\.tour-window-content/);
  assert.match(styles, /\.tour-metrics article/);
  assert.match(styles, /--preview-text:\s*#211a18/i);
  assert.match(styles, /--preview-text:\s*#fff8f4/i);

  const publicImport = 'import "./public-dashboard-theme-visibility.css";';
  const workspaceImport = 'import "./workspace-theme-visibility.css";';
  assert.ok(
    layout.indexOf(publicImport) > layout.indexOf(workspaceImport),
    "public dashboard visibility must load after all previous theme locks",
  );

  assert.ok(contrast("211a18", "ffffff") >= 7, "light preview text must meet enhanced contrast");
  assert.ok(contrast("fff8f4", "171311") >= 7, "dark preview text must meet enhanced contrast");
  assert.ok(contrast("dec9c0", "090909") >= 7, "sidebar text must remain readable in dark mode");
  assert.ok(contrast("8f412c", "fff5f0") >= 4.5, "light accent text must remain readable");
  assert.ok(contrast("f0b29c", "211916") >= 4.5, "dark accent text must remain readable");
});
