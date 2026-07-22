import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("loads the final brand lock after every other stylesheet", async () => {
  const layout = await read("app/layout.tsx");
  const imports = [...layout.matchAll(/import "\.\/(.+?\.css)";/g)].map((match) => match[1]);
  assert.equal(imports.at(-1), "brand-final-lock.css");
});

test("sidebar has separate light and dark Hisab treatments", async () => {
  const css = await read("app/brand-final-lock.css");
  assert.match(css, /html\[data-theme="light"\] \.erp-shell > \.sidebar\.supabase-sidebar/);
  assert.match(css, /background: #fffaf7 !important/);
  assert.match(css, /html\[data-theme="dark"\] \.erp-shell > \.sidebar\.supabase-sidebar/);
  assert.match(css, /background: #171717 !important/);
  assert.match(css, /--supabase-sidebar-accent: var\(--hisab-500\)/);
});

test("workspace and auth render the transparent SVG as image elements", async () => {
  const shell = await read("components/workspace-shell.tsx");
  const login = await read("app/auth/login/page.tsx");
  const authCard = await read("components/email-auth-card.tsx");
  const css = await read("app/brand-final-lock.css");

  assert.ok((shell.match(/src="\/hisab-logo\.svg"/g) || []).length >= 3);
  assert.match(login, /className="auth-hisab-mark hisab-logo"/);
  assert.ok((authCard.match(/src="\/hisab-logo\.svg"/g) || []).length >= 2);
  assert.match(css, /background: transparent !important/);
  assert.match(css, /box-shadow: none !important/);
});

test("all semantic color tokens resolve to the Hisab terracotta family", async () => {
  const css = await read("app/brand-final-lock.css");
  for (const token of ["success", "warning", "danger", "info"]) {
    assert.match(css, new RegExp(`--fin-${token}: var\\(--hisab-`));
  }
  for (const legacy of ["blue", "green", "red", "teal", "cyan", "purple", "violet", "indigo"]) {
    assert.match(css, new RegExp(`--${legacy}: var\\(--hisab-`));
  }
});
