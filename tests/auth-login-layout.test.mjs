import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("uses a focused sign-in hierarchy with HisabTech branding", async () => {
  const login = await read("app/auth/login/page.tsx");

  assert.match(login, /auth-slack-page/);
  assert.match(login, /auth-slack-new-account/);
  assert.match(login, /auth-slack-passwordless/);
  assert.match(login, /auth-hisab-mark/);
  assert.match(login, />H<\/span>/);
  assert.doesNotMatch(login, /auth-slack-mark/);
  assert.match(login, /SocialAuthButtons/);
  assert.match(login, /autoComplete="current-password"/);
  assert.match(login, /inputMode="email"/);
  assert.doesNotMatch(login, /auth-official-showcase/);
  assert.doesNotMatch(login, /LanguageSelector/);
});

test("keeps the redesigned login responsive and dark-mode complete", async () => {
  const [styles, brandStyles, layout] = await Promise.all([
    read("app/auth-login-slack.css"),
    read("app/auth-hisab-brand.css"),
    read("app/layout.tsx"),
  ]);

  assert.match(layout, /import "\.\/auth-login-slack\.css"/);
  assert.match(layout, /import "\.\/auth-hisab-brand\.css"/);
  assert.match(styles, /html\[data-theme="dark"\] \.auth-slack-page/);
  assert.match(styles, /@media \(max-width: 640px\)/);
  assert.match(styles, /\.auth-slack-page \.social-auth-grid/);
  assert.match(styles, /\.auth-slack-page \.field-control:focus-within/);
  assert.match(brandStyles, /\.auth-hisab-mark/);
  assert.match(brandStyles, /linear-gradient\(145deg, #0f4c81 0%, #146b70 100%\)/);
  assert.doesNotMatch(brandStyles, /#36c5f0|#2eb67d|#e01e5a/);
});
