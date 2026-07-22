import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("official third-party marks retain their source brand colors", async () => {
  const [layout, socialButtons, protection] = await Promise.all([
    read("app/layout.tsx"),
    read("components/social-auth-buttons.tsx"),
    read("app/third-party-brand-colors.css"),
  ]);

  assert.match(layout, /third-party-brand-colors\.css/);
  assert.match(socialButtons, /data-brand-mark="google"/);
  assert.match(socialButtons, /data-brand-mark="apple"/);

  for (const color of ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]) {
    assert.ok(protection.includes(color), `Missing official Google color ${color}`);
  }

  assert.match(protection, /social-auth-apple/);
  assert.match(protection, /#FFFFFF/);
  assert.match(protection, /\[data-brand\]:not\(\[data-brand="hisab"\]\)/);
  assert.match(protection, /filter: none !important/);
  assert.doesNotMatch(protection, /var\(--hisab-(?:brand|500|600|700)\)/);
});
